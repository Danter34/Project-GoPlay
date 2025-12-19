using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface ILocationRepository
    {
        Task<IEnumerable<Location>> GetAllAsync();
        Task<Location?> GetByIdAsync(int id);
        Task<IEnumerable<Location>> GetByCityAsync(string city);
        Task<IEnumerable<Location>> GetByCityAndDistrictAsync(string city, string district);
        Task<Location> CreateAsync(LocationCreateDTO dto);
        Task<bool> UpdateAsync(int id, LocationCreateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
