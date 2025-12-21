using Goplay_API.Data;
using Goplay_API.Helpers;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;
        public BookingRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<Booking>> GetByUserAsync(int userId)
        {
            return await _context.Bookings
                .Include(b => b.Field)
                .Include(b => b.BookingTimeSlots)
                    .ThenInclude(bts => bts.TimeSlot)
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByFieldAndDateAsync(int fieldId, DateTime date)
        {
            var targetDate = date.Date;
            return await _context.Bookings
                .Where(b => b.FieldId == fieldId && b.BookingDate.Date == targetDate && b.Status != BookingStatus.Cancelled)
                .Include(b => b.BookingTimeSlots)
                    .ThenInclude(bts => bts.TimeSlot)
                .ToListAsync();
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.BookingTimeSlots)
                    .ThenInclude(bts => bts.TimeSlot)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.BookingId == id);
        }

        public async Task<Booking> CreateAsync(int userId, BookingCreateDTO dto)
        {
            dto.BookingDate = dto.BookingDate.Date;

            // check slot tồn tại
            var validSlots = await _context.TimeSlots
                .Where(s => dto.SlotIds.Contains(s.SlotId))
                .Select(s => s.SlotId)
                .ToListAsync();

            if (validSlots.Count != dto.SlotIds.Count)
                throw new Exception("Invalid time slot");

            // check trùng slot
            bool exists = await _context.BookingTimeSlots
                .AnyAsync(bts =>
                    dto.SlotIds.Contains(bts.SlotId) &&
                    bts.Booking.FieldId == dto.FieldId &&
                    bts.Booking.BookingDate == dto.BookingDate &&
                    bts.Booking.Status != BookingStatus.Cancelled);

            if (exists)
                throw new Exception("Some selected time slots are already booked");

            var field = await _context.Fields.FindAsync(dto.FieldId)
                ?? throw new Exception("Field not found");

            var booking = new Booking
            {
                UserId = userId,
                FieldId = dto.FieldId,
                BookingDate = dto.BookingDate,
                TotalPrice = field.Price * dto.SlotIds.Count,
                Status = BookingStatus.Pending,
                BookingTimeSlots = new List<BookingTimeSlot>()
            };

            foreach (var slotId in dto.SlotIds)
            {
                booking.BookingTimeSlots.Add(new BookingTimeSlot
                {
                    SlotId = slotId
                });
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return booking;
        }


        public async Task<bool> CancelAsync(int bookingId, int userId)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingId == bookingId && b.UserId == userId);

            if (booking == null) return false;

            booking.Status = BookingStatus.Cancelled;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Booking>> GetByOwnerAsync(int ownerUserId)
        {
            return await _context.Bookings
                .Include(b => b.BookingTimeSlots)
                .Include(b => b.Field)
                    .ThenInclude(f => f.OwnerProfile)
                .Where(b =>
                    b.Field.OwnerProfile.UserId == ownerUserId &&
                    b.Status != BookingStatus.Cancelled
                )
                .ToListAsync();
        }
        public async Task<bool> OwnerUpdateStatusAsync(
   int ownerUserId,
   int bookingId,
   string status)
        {
            var booking = await _context.Bookings
                .Include(b => b.Field)
                    .ThenInclude(f => f.OwnerProfile)
                .FirstOrDefaultAsync(b =>
                    b.BookingId == bookingId &&
                    b.Field.OwnerProfile.UserId == ownerUserId
                );

            if (booking == null) return false;

            // Chỉ cho owner set các trạng thái hợp lệ
            if (status != BookingStatus.Confirmed &&
                status != BookingStatus.Cancelled &&
                status != BookingStatus.Completed)
                throw new Exception("Trạng thái không hợp lệ");

            // Không cho update nếu đã cancelled
            if (booking.Status == BookingStatus.Cancelled)
                throw new Exception("Booking đã bị hủy");

            booking.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
