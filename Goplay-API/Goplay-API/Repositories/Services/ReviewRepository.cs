using Goplay_API.Data;
using Goplay_API.Model.Domain;
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

        public async Task AddReviewAsync(int userId, int fieldId, int rating, string? comment)
        {
            // 1. Chỉ review khi đã booking
            bool booked = await _context.Bookings.AnyAsync(b =>
                b.UserId == userId &&
                b.FieldId == fieldId &&
                b.Status == "Confirmed");

            if (!booked)
                throw new Exception("You must book before reviewing");

            // 2. Không cho review 2 lần
            if (await _context.Reviews.AnyAsync(r => r.UserId == userId && r.FieldId == fieldId))
                throw new Exception("You already reviewed this field");

            var review = new Review
            {
                UserId = userId,
                FieldId = fieldId,
                Rating = rating,
                Comment = comment
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // 3. Update AverageRating
            var field = await _context.Fields
                .Include(f => f.Reviews)
                .FirstAsync(f => f.FieldId == fieldId);

            field.AverageRating = field.Reviews.Average(r => r.Rating);
            await _context.SaveChangesAsync();
        }
    }

}
