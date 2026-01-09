using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Goplay_API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Client join vào phòng chat (theo ContactId)
        public async Task JoinChat(int contactId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, contactId.ToString());
        }

        // 2. Client rời phòng
        public async Task LeaveChat(int contactId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, contactId.ToString());
        }

        // 3. Gửi tin nhắn
        public async Task SendMessage(SendMessageDTO dto)
        {
            var userId = int.Parse(Context.User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Lưu vào DB
            var contact = await _context.Contacts.FindAsync(dto.ContactId);
            if (contact == null) return;

            var message = new ContactMessage
            {
                ContactId = dto.ContactId,
                UserId = userId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactMessages.Add(message);
            
            // Update thời gian hoạt động của hội thoại để nó nổi lên đầu
            contact.LastActivity = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            // Gửi realtime cho tất cả người đang xem hội thoại này
            var responseDto = new ChatMessageDTO
            {
                ContactId = dto.ContactId,
                SenderId = userId,
                Content = dto.Content,
                CreatedAt = message.CreatedAt
            };

            await Clients.Group(dto.ContactId.ToString()).SendAsync("ReceiveMessage", responseDto);
        }
    }
}