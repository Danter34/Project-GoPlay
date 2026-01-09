using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using System;

namespace Goplay_API.Repositories.Services
{
    public class ContactRepository : IContactRepository
    {
        private readonly ApplicationDbContext _context;

        public ContactRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<object>> GetConversationsAsync(int userId)
        {
            return await _context.Contacts
                .Include(c => c.Sender)  
                .Include(c => c.Receiver) 
                .Where(c => c.SenderId == userId || c.ReceiverId == userId)
                .OrderByDescending(c => c.LastActivity)
                .Select(c => new
                {
                    c.ContactId,
                    c.Subject,
                    c.Status,
                    c.LastActivity,
                    OtherUser = c.SenderId == userId ? c.Receiver.FullName : c.Sender.FullName,
                    OtherUserId = c.SenderId == userId ? c.ReceiverId : c.SenderId 
                })
                .ToListAsync<object>();
        }
        public async Task<List<ChatMessageDTO>> GetMessagesAsync(int contactId)
        {
            return await _context.ContactMessages
                .Where(m => m.ContactId == contactId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new ChatMessageDTO
                {
                    ContactId = m.ContactId,
                    SenderId = m.UserId,
                    Content = m.Content,
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync();
        }
       


        // ContactRepository
        public async Task<Contact> CreateContactAsync(int senderId, CreateContactDTO dto)
        {
            // 1. Kiểm tra xem đã có hội thoại giữa 2 người này chưa
            var existing = await _context.Contacts
                .FirstOrDefaultAsync(c => (c.SenderId == senderId && c.ReceiverId == dto.ReceiverId) ||
                                          (c.SenderId == dto.ReceiverId && c.ReceiverId == senderId));

            if (existing != null) return existing; // Nếu có rồi thì trả về cái cũ

            // 2. Tạo mới
            var newContact = new Contact
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                Subject = dto.Subject ?? "Conversation",
                Status = "Open",
                CreatedAt = DateTime.UtcNow,
                LastActivity = DateTime.UtcNow
            };

            _context.Contacts.Add(newContact);
            await _context.SaveChangesAsync();

            // 3. Nếu có tin nhắn mở đầu thì thêm luôn
            if (!string.IsNullOrEmpty(dto.InitialMessage))
            {
                var msg = new ContactMessage
                {
                    ContactId = newContact.ContactId,
                    UserId = senderId,
                    Content = dto.InitialMessage,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ContactMessages.Add(msg);
                await _context.SaveChangesAsync();
            }

            return newContact;
        }
    }
}
