using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnDemandApp.Infrastructure.Data;
using Microsoft.AspNetCore.SignalR;
using OnDemandApp.Api.Hubs;

namespace OnDemandApp.Api.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _db;

        public NotificationController(AppDbContext db)
        {
            _db = db;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);


        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();

            var list = await _db.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20) 
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    Text = n.Message, 
                    Time = n.CreatedAt.ToString("HH:mm"), 
                    n.Type, 
                    n.IsRead
                })
                .ToListAsync();

            return Ok(list);
        }

    
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            var userId = GetUserId();
            var notifs = await _db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifs) n.IsRead = true;

            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}