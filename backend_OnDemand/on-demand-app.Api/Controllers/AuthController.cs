using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading.Tasks;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OnDemandApp.Api.Auth;
using OnDemandApp.Core.Entities;
using OnDemandApp.Infrastructure.Data;

namespace OnDemandApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly ITwoFactorService _authService;
    private readonly IEmailService _emailService;

    public AuthController(AppDbContext db, IJwtTokenService jwt, ITwoFactorService authService, IEmailService emailService)
    {
        _db = db;
        _jwt = jwt;
        _authService = authService;
        _emailService = emailService;
    }

    // DTOs
    public record RegisterDto(
        [Required, EmailAddress] string Email,
        [Required] string FullName,
        [Required] string Password,
        UserRole Role,
        string? ProviderCategoryCode,
        string? CvUrl,
        string? PhotoUrl
    );

    public record LoginDto([Required, EmailAddress] string Email, [Required] string Password);
    public record VerifyEmailDto([Required, EmailAddress] string Email, [Required] string Code);

    // 1. REGISTER
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict("Email déjà utilisé.");

        var initialStatus = dto.Role == UserRole.provider ? UserStatus.pending : UserStatus.active;

        var user = new User
        {
            Email = dto.Email.Trim().ToLowerInvariant(),
            FullName = dto.FullName,
            Role = dto.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            EmailConfirmed = false,
            Status = initialStatus,
            TwoFactorEnabled = false
        };

        if (dto.Role == UserRole.provider)
        {
            user.ProviderProfile = new ProviderProfile
            {
                Zones = dto.ProviderCategoryCode ?? "Général",
                CvUrl = dto.CvUrl,
                PhotoUrl = dto.PhotoUrl,
                IsOnboardingCompleted = false
            };
            Console.WriteLine("[REGISTER] Profil Provider créé en mémoire avec CV/Photo.");
        }

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        Console.WriteLine($"[REGISTER] Utilisateur {user.Id} sauvegardé en base !");

        await _authService.CreateAndMaybeSendCodeAsync(user, AuthCodePurpose.EmailConfirm);

        return Created("", new { message = "Compte créé.", userId = user.Id });
    }

   
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

        
        var user = await _db.Users.FindAsync(userId);

        if (user == null) return NotFound("Utilisateur introuvable");

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.TwoFactorEnabled,
            user.CreatedAt,
            user.Status,
            user.EmailConfirmed
        });
    }

    // 3. ACTIVER/DESACTIVER 2FA
    [Authorize]
    [HttpPost("toggle-2fa")]
    public async Task<IActionResult> Toggle2FA()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        var user = await _db.Users.FindAsync(userId);

        if (user == null) return NotFound();

        // On inverse l'état actuel
        user.TwoFactorEnabled = !user.TwoFactorEnabled;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            enabled = user.TwoFactorEnabled,
            message = user.TwoFactorEnabled ? "2FA Activé" : "2FA Désactivé"
        });
    }

    // 4. VÉRIFICATION EMAIL
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(VerifyEmailDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLowerInvariant());
        if (user == null) return Unauthorized("Utilisateur inconnu.");

        var isValid = await _authService.VerifyCodeAsync(user, dto.Code, AuthCodePurpose.EmailConfirm);
        if (!isValid) return BadRequest("Code invalide ou expiré.");

        user.EmailConfirmed = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Email confirmé avec succès. Vous pouvez maintenant vous connecter." });
    }

   
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

      
        var user = await _db.Users
            .Include(u => u.ProviderProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Identifiants invalides.");

     
        if (!user.EmailConfirmed)
            return Unauthorized(new { error = "EmailNonVerifie", message = "Veuillez d'abord confirmer votre adresse email." });

        if (user.Status == UserStatus.banned)
            return Unauthorized("Votre compte a été banni.");

      
        if (user.Status == UserStatus.pending)
        {
            if (user.Role == UserRole.client)
            {
                user.Status = UserStatus.active;
                await _db.SaveChangesAsync();
            }
            else if (user.Role == UserRole.provider)
            {
             
                var hasFinishedOnboarding = user.ProviderProfile?.IsOnboardingCompleted ?? false;

                if (!hasFinishedOnboarding)
                {
            
                    var tokenTemp = _jwt.CreateToken(user);
                    return Ok(new
                    {
                        token = tokenTemp,
                        role = "provider_pending_onboarding",
                        fullName = user.FullName
                    });
                }
                else
                {
              
                    return Unauthorized(new { error = "CompteEnAttente", message = "Dossier complet. En attente de validation admin." });
                }
            }
        }

        var token = _jwt.CreateToken(user);
        return Ok(new { token, role = user.Role.ToString(), fullName = user.FullName });
    }
}