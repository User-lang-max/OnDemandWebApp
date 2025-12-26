using System.Text;
using System.Threading.Tasks; 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnDemandApp.Api.Auth;
using OnDemandApp.Infrastructure.Data;


var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONFIGURATION DATABASE
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("OnDemandDb")
    ?? "Server=localhost\\SQLEXPRESS;Database=OnDemandDb;Trusted_Connection=True;Encrypt=False";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// ==========================================
// 2. CONFIGURATION DES SETTINGS (appsettings.json)
// ==========================================
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));

// ==========================================
// 3. INJECTION DES DÉPENDANCES (SERVICES)
// ==========================================
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<ITwoFactorService, TwoFactorService>();
builder.Services.AddTransient<IEmailService, EmailService>();

// ==========================================
// 4. CONFIGURATION CORS (Vital pour React)
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

// ==========================================
// 5. CONFIGURATION AUTHENTIFICATION (JWT)
// ==========================================
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    jwtKey = "c2791930c0bda08978b2e1ce62961454f146bb754bc9c43c74d13453354bba1808e6aef572ca3dd275d48d81a0e524a14cc7c6c44a83426e7d374ff6d5781985";
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // A. Paramètres de validation classiques (HTTP)
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer ?? "OnDemandApp",
            ValidAudience = jwtAudience ?? "OnDemandUser",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
             
                var accessToken = context.Request.Query["access_token"];


                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs/notifications"))
                {
                
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// ==========================================
// 6. SERVICES STANDARDS
// ==========================================
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ==========================================
// 7. PIPELINE HTTP
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp"); 

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.UseStaticFiles();


app.MapHub<OnDemandApp.Api.Hubs.NotificationHub>("/hubs/notifications");

app.Run();