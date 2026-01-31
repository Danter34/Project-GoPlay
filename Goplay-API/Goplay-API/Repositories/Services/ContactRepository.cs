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
                   // Logic hiển thị tên: Nếu Sender là null thì lấy GuestName
                   OtherUser = c.SenderId == userId
                       ? c.Receiver.FullName
                       : (c.SenderId == null ? c.GuestName : c.Sender.FullName),
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
                    SenderId = m.UserId ?? 0, // Nếu null (Guest) thì trả về 0
                    Content = m.Content,
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync();
        }



        // ContactRepository
        public async Task<Contact> CreateContactAsync(int? senderId, CreateContactDTO dto)
        {
            // 1. Lấy thông tin sân để làm Tiêu đề cho đẹp
            string fieldName = "Chung";
            if (dto.FieldId.HasValue)
            {
                var field = await _context.Fields.FindAsync(dto.FieldId.Value);
                if (field != null) fieldName = field.FieldName;
            }

            Contact newContact;

            
            if (senderId.HasValue)
            {
                
                var existing = await _context.Contacts
                    .FirstOrDefaultAsync(c =>
                        ((c.SenderId == senderId && c.ReceiverId == dto.ReceiverId) ||
                         (c.SenderId == dto.ReceiverId && c.ReceiverId == senderId))
                        && c.FieldId == dto.FieldId 
                    );

                if (existing != null) return existing;

                newContact = new Contact
                {
                    SenderId = senderId,
                    ReceiverId = dto.ReceiverId,
                    FieldId = dto.FieldId, // Lưu ID sân
                    Subject = $"User hỏi về: {fieldName}", // Tiêu đề rõ ràng
                    Status = "Open"
                };
            }
        
            else
            {
                var randomId = new Random().Next(100, 999);
                var guestName = $"Guest {randomId}";

                newContact = new Contact
                {
                    SenderId = null,
                    ReceiverId = dto.ReceiverId,
                    FieldId = dto.FieldId, // Lưu ID sân
                    GuestName = guestName,
                    GuestPhone = "N/A",

                    // [SỬA] Tiêu đề chứa tên sân
                    Subject = $"{guestName} quan tâm: {fieldName}",
                    Status = "Open"
                };
            }

            _context.Contacts.Add(newContact);
            await _context.SaveChangesAsync();

            // Thêm tin nhắn mở đầu
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