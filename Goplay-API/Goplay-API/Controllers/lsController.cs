using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace Goplay_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class lsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public lsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [AllowAnonymous] 
        public async Task<IActionResult> SendContact([FromBody] lhdto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var contact = new lh
            {
                Name = dto.Name,
                Email = dto.Email,
                Message = dto.Message,
                CreatedAt = DateTime.Now,
                Status = "New"
            };

            _context.lhs.Add(contact);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi liên hệ thành công!" });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới xem được
        public async Task<IActionResult> GetContacts([FromQuery] string? status)
        {
            var query = _context.lhs.AsQueryable();

            if (!string.IsNullOrEmpty(status) && status != "All")
            {
                query = query.Where(c => c.Status == status);
            }

            // Sắp xếp mới nhất lên đầu
            var list = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            return Ok(list);
        }

        // 2. Cập nhật trạng thái 
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var contact = await _context.lhs.FindAsync(id);
            if (contact == null) return NotFound();

            contact.Status = newStatus; 
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công!" });
        }

        // 3. Xóa tin nhắn (Spam hoặc cũ)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var contact = await _context.lhs.FindAsync(id);
            if (contact == null) return NotFound();

            _context.lhs.Remove(contact);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa tin nhắn." });
        }
    }
}
