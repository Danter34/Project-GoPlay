using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Microsoft.AspNetCore.Authorization; // Có thể bỏ nếu muốn mở hoàn toàn
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Goplay_API.Hubs
{
    // [Authorize] <-- BỎ hoặc Comment dòng này để Guest kết nối được
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task JoinChat(int contactId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, contactId.ToString());
        }

        public async Task SendMessage(SendMessageDTO dto)
        {
            int? userId = null;

            // Cố gắng lấy UserID nếu có Token
            var userClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userClaim != null)
            {
                userId = int.Parse(userClaim.Value);
            }

            var contact = await _context.Contacts.FindAsync(dto.ContactId);
            if (contact == null) return;

            // Logic: Nếu là Guest (userId == null) thì Contact phải có SenderId là null
            // (Tránh trường hợp Guest chat vào phòng của User khác)
            if (userId == null && contact.SenderId != null) return;

            var message = new ContactMessage
            {
                ContactId = dto.ContactId,
                UserId = userId, // Lưu null nếu là Guest
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactMessages.Add(message);
            contact.LastActivity = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var responseDto = new ChatMessageDTO
            {
                ContactId = dto.ContactId,
                SenderId = userId ?? 0, // Trả về 0 cho Frontend biết là Guest
                Content = dto.Content,
                CreatedAt = message.CreatedAt
            };

            await Clients.Group(dto.ContactId.ToString()).SendAsync("ReceiveMessage", responseDto);
        }
    }
}