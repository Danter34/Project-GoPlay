using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
namespace Goplay_API.Repositories.Interface
{
    public interface ITimeSlotRepository
    {
        Task<IEnumerable<TimeSlot>> GetAllAsync();
        Task<TimeSlot?> GetByIdAsync(int id);
        Task<TimeSlot> CreateAsync(TimeSlotDTO slot);
        Task<bool> UpdateAsync(int id, TimeSlotDTO slot);
        Task<bool> DeleteAsync(int id);
    }
}
