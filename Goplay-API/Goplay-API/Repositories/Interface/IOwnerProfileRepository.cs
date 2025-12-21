using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IOwnerProfileRepository
    {
        Task<IEnumerable<OwnerProfile>> GetAllAsync();
        Task<IEnumerable<OwnerProfile>> GetPendingAsync();
        Task<OwnerProfile?> GetByIdAsync(int id);
        Task<OwnerProfile?> GetByUserIdAsync(int userId);
        Task<OwnerProfile> CreateAsync(int userId, OwnerProfileRegisterDTO dto);
        Task<bool> UpdateAsync(int userId, int profileId, OwnerProfileRegisterDTO dto);
        Task<bool> ApproveAsync(int profileId);
        Task<bool> RejectAsync(int profileId);

    }
}
