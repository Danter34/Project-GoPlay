using Goplay_API.Data;
using Goplay_API.Helpers; // Để dùng BookingStatus
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddReviewAsync(int userId, CreateReviewDTO dto)
        {
            // 1. Kiểm tra Booking này có tồn tại, thuộc về User và đã Completed chưa
            var booking = await _context.Bookings.FirstOrDefaultAsync(b =>
                b.BookingId == dto.BookingId &&
                b.UserId == userId &&
                b.Status == "Completed");

            if (booking == null)
                throw new Exception("Đơn đặt sân không hợp lệ hoặc chưa hoàn thành.");

            // 2. Kiểm tra xem ĐƠN NÀY đã được đánh giá chưa
            bool alreadyReviewed = await _context.Reviews.AnyAsync(r => r.BookingId == dto.BookingId);
            if (alreadyReviewed)
                throw new Exception("Đơn đặt sân này đã được đánh giá rồi.");

            // 3. Tạo Review
            var review = new Review
            {
                UserId = userId,
                FieldId = dto.FieldId, // Hoặc lấy từ booking.FieldId cho an toàn
                BookingId = dto.BookingId, // [MỚI] Lưu BookingId
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // 4. Update AverageRating (Giữ nguyên logic cũ)
            var field = await _context.Fields.FindAsync(dto.FieldId);
            if (field != null)
            {
                double newAverage = await _context.Reviews
                    .Where(r => r.FieldId == dto.FieldId)
                    .AverageAsync(r => r.Rating);
                field.AverageRating = Math.Round(newAverage, 1);
                await _context.SaveChangesAsync();
            }
        }
    }
}