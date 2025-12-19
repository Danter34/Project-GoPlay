using Goplay_API.Data;
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
                .Where(b => b.FieldId == fieldId && b.BookingDate.Date == targetDate && b.Status != "Cancelled")
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

        public async Task<Booking> CreateAsync(BookingCreateDTO dto)
        {
            bool exists = await _context.BookingTimeSlots
                .Include(bts => bts.Booking)
                .AnyAsync(bts =>
                    bts.Booking.FieldId == dto.FieldId &&
                    bts.Booking.BookingDate.Date == dto.BookingDate.Date &&
                    dto.SlotIds.Contains(bts.SlotId) &&
                    bts.Booking.Status != "Cancelled");

            if (exists)
                throw new Exception("Some selected time slots are already booked");

    
            var field = await _context.Fields.FindAsync(dto.FieldId);
            if (field == null)
            {
                throw new Exception("Field not found");
            }

            decimal totalPrice = field.Price * dto.SlotIds.Count;

            var booking = new Booking
            {
                UserId = dto.UserId,
                FieldId = dto.FieldId,
                BookingDate = dto.BookingDate,
                TotalPrice = totalPrice, 
                Status = "Pending"       
            };

            foreach (var slotId in dto.SlotIds)
            {
                booking.BookingTimeSlots.Add(new BookingTimeSlot
                {
                    SlotId = slotId,
                    Booking = booking
                });
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<bool> CancelAsync(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return false;
            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
