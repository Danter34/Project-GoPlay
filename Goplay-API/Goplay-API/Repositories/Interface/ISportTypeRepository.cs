using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface ISportTypeRepository
    {
        Task<IEnumerable<SportType>> GetAllAsync();
        Task<SportType?> GetByIdAsync(int id);
        Task<SportType> CreateAsync(SportTypeDTO dto);
        Task<bool> UpdateAsync(int id, SportTypeDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
