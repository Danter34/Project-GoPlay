using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IBookingRepository
    {
        Task<IEnumerable<Booking>> GetByUserAsync(int userId);
        Task<IEnumerable<Booking>> GetByFieldAndDateAsync(int fieldId, DateTime date);
        Task<Booking?> GetByIdAsync(int id);
        Task<Booking> CreateAsync(int? userId, BookingCreateDTO dto);
        Task<bool> CancelAsync(int userId, int bookingId);
        Task<List<BookingResponseDTO>> GetMyBookingsAsync(int userId);
        Task<IEnumerable<Booking>> GetByFieldAndOwnerAsync(int fieldId, int ownerUserId);

        Task<bool> OwnerUpdateStatusAsync(int ownerUserId, int bookingId, string status);
        Task UpdateBookingTimeAsync(int bookingId, DateTime newDate, List<int> newSlotIds);
    }
}
