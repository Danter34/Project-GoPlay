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
        public async Task<List<BookingResponseDTO>> GetMyBookingsAsync(int userId)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate) // Sắp xếp ngày mới nhất lên đầu
                .Select(b => new BookingResponseDTO
                {
                    BookingId = b.BookingId,
                    BookingDate = b.BookingDate,
                    Status = b.Status,
                    TotalPrice = b.TotalPrice,
                    FieldId = b.FieldId,
                    FieldName = b.Field.FieldName, // Lấy tên sân

                    // [LOGIC QUAN TRỌNG] Kiểm tra xem đơn này đã có Review chưa
                    HasReviewed = _context.Reviews.Any(r => r.BookingId == b.BookingId),

                    // Map TimeSlots
                    TimeSlots = b.BookingTimeSlots.Select(ts => new BookingTimeSlotDTO
                    {
                        StartTime = ts.TimeSlot.StartTime,
                        EndTime = ts.TimeSlot.EndTime
                    }).ToList()
                })
                .ToListAsync();
        }
        public async Task<IEnumerable<Booking>> GetByFieldAndDateAsync(int fieldId, DateTime date)
        {
            var targetDate = date.Date;
            return await _context.Bookings
         .Where(b => b.FieldId == fieldId &&
                     b.BookingDate.Date == targetDate &&
                     b.Status != "Cancelled") // Chỉ lấy đơn chưa hủy
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

        public async Task<Booking> CreateAsync(int? userId, BookingCreateDTO dto)
        {
            dto.BookingDate = dto.BookingDate.Date;

            if (userId == null && (string.IsNullOrEmpty(dto.GuestName) || string.IsNullOrEmpty(dto.GuestPhone)))
            {
                throw new Exception("Khách vãng lai vui lòng nhập Tên và Số điện thoại.");
            }
            // 1. Check slot tồn tại
            var validSlots = await _context.TimeSlots
             .Where(s => dto.SlotIds.Contains(s.SlotId))
             .Select(s => s.SlotId)
             .ToListAsync();

            if (validSlots.Count != dto.SlotIds.Count)
                throw new Exception("Khung giờ không hợp lệ.");

            // 2. Check trùng slot
            bool exists = await _context.BookingTimeSlots
             .AnyAsync(bts =>
                 dto.SlotIds.Contains(bts.SlotId) &&
                 bts.Booking.FieldId == dto.FieldId &&
                 bts.Booking.BookingDate == dto.BookingDate &&
                 bts.Booking.Status != "Cancelled");
            if (exists)
                throw new Exception("Một số khung giờ bạn chọn đã có người đặt.");

            // 3. Check field
            var field = await _context.Fields.FindAsync(dto.FieldId)
             ?? throw new Exception("Không tìm thấy sân.");

            // 4. Tạo booking
            var booking = new Booking
            {
                UserId = userId, // Có thể null
                GuestName = userId == null ? dto.GuestName : null,
                GuestPhone = userId == null ? dto.GuestPhone : null,
                FieldId = dto.FieldId,
                BookingDate = dto.BookingDate,
                TotalPrice = field.Price * dto.SlotIds.Count,
                Status = "AwaitingPayment",
                CreatedAt = DateTime.UtcNow
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

            return await _context.Bookings
            .Include(b => b.BookingTimeSlots)
                .ThenInclude(bts => bts.TimeSlot)
            .FirstAsync(b => b.BookingId == booking.BookingId);
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

        public async Task<IEnumerable<Booking>> GetByFieldAndOwnerAsync(int fieldId, int ownerUserId)
        {
            return await _context.Bookings
                // 1. Load thông tin Slot
                .Include(b => b.BookingTimeSlots)
                    .ThenInclude(bts => bts.TimeSlot)

                // 2. Load thông tin Field & Owner (để check quyền)
                .Include(b => b.Field)
                    .ThenInclude(f => f.OwnerProfile)

                // 3. [QUAN TRỌNG] THÊM DÒNG NÀY ĐỂ LẤY THÔNG TIN KHÁCH ĐÃ ĐĂNG NHẬP
                .Include(b => b.User)

                .Where(b =>
                    b.FieldId == fieldId &&
                    b.Field.OwnerProfile.UserId == ownerUserId &&
                    b.Status != BookingStatus.Cancelled
                )
                .OrderByDescending(b => b.BookingDate)
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
            if (status != "Confirmed" &&
         status != "Cancelled" &&
         status != "Completed")
                throw new Exception("Trạng thái không hợp lệ");

            // Không cho update nếu đã cancelled
            if (booking.Status == BookingStatus.Cancelled)
                throw new Exception("Booking đã bị hủy");

            booking.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateBookingTimeAsync(int bookingId, DateTime newDate, List<int> newSlotIds)
        {
            var booking = await _context.Bookings
                .Include(b => b.Field) // Load giá sân
                .Include(b => b.BookingTimeSlots)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null) throw new Exception("Booking not found");

            // 1. Kiểm tra ngày quá khứ
            if (newDate.Date < DateTime.UtcNow.AddHours(7).Date) // Giả sử múi giờ VN
                throw new Exception("Không thể chuyển về ngày quá khứ!");

            // 2. Check trùng lịch (Ở ngày mới)
            var conflict = await _context.BookingTimeSlots
                .Include(bts => bts.Booking)
                .AnyAsync(bts =>
                    bts.Booking.FieldId == booking.FieldId &&
                    bts.Booking.BookingDate.Date == newDate.Date && // Check theo ngày mới
                    bts.BookingId != bookingId && // Không tính chính nó
                    (bts.Booking.Status == "Confirmed" || bts.Booking.Status == "Completed") &&
                    newSlotIds.Contains(bts.SlotId)
                );

            if (conflict) throw new Exception("Khung giờ bạn chọn đã có người đặt!");

            // 3. Cập nhật thông tin
            booking.BookingDate = newDate; // Update ngày

            // Xóa slot cũ
            _context.BookingTimeSlots.RemoveRange(booking.BookingTimeSlots);

            // Thêm slot mới
            foreach (var slotId in newSlotIds)
            {
                _context.BookingTimeSlots.Add(new BookingTimeSlot { BookingId = bookingId, SlotId = slotId });
            }

            // 4. [QUAN TRỌNG] TÍNH LẠI TIỀN
            // Giả sử giá sân cố định theo slot (Hoặc bạn có thể query bảng TimeSlot để lấy giá chi tiết)
            // Ở đây mình lấy: Giá sân * Số lượng slot
            decimal newPrice = booking.Field.Price * newSlotIds.Count;

            // Cập nhật giá mới vào DB luôn để thống kê doanh thu đúng
            booking.TotalPrice = newPrice;

            await _context.SaveChangesAsync();
        }
    }
}