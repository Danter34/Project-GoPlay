using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class ContactRepository : IContactRepository
    {
        private readonly ApplicationDbContext _context;

        public ContactRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Contact>> GetInboxAsync(int userId) =>
            await _context.Contacts
                .Include(c => c.Sender)
                .Where(c => c.ReceiverId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<Contact>> GetSentAsync(int userId) =>
            await _context.Contacts
                .Include(c => c.Receiver)
                .Where(c => c.SenderId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

        public async Task<Contact> CreateAsync(int senderId, ContactCreateDTO dto)
        {
            var contact = new Contact
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                Subject = dto.Subject,
                Message = dto.Message,
                Status = "Open"
            };

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return contact;
        }

        public async Task<bool> ReplyAsync(int contactId, string replyMessage, int receiverId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null) return false;

            contact.Message += $"\n\n[Reply]: {replyMessage}";
            contact.ReceiverId = receiverId;
            contact.Status = "Replied";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CloseAsync(int contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null) return false;

            contact.Status = "Closed";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
