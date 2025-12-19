using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IBookingRepository
    {
        Task<IEnumerable<Booking>> GetByUserAsync(int userId);
        Task<IEnumerable<Booking>> GetByFieldAndDateAsync(int fieldId, DateTime date);
        Task<Booking?> GetByIdAsync(int id);
        Task<Booking> CreateAsync(BookingCreateDTO dto);
        Task<bool> CancelAsync(int bookingId);
    }
}
