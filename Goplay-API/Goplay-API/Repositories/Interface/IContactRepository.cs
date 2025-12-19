using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IContactRepository
    {
        Task<IEnumerable<Contact>> GetInboxAsync(int userId);
        Task<IEnumerable<Contact>> GetSentAsync(int userId);
        Task<Contact> CreateAsync(int senderId, ContactCreateDTO dto);
        Task<bool> ReplyAsync(int contactId, string message, int userId);
        Task<bool> CloseAsync(int contactId);
    }
}
