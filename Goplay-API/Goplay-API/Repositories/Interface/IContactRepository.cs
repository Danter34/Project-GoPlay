using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IContactRepository
    {
        Task<List<object>> GetConversationsAsync(int userId);
        Task<List<ChatMessageDTO>> GetMessagesAsync(int contactId);
        Task<Contact> CreateContactAsync(int senderId, CreateContactDTO dto);
    }
}
