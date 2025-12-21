using Goplay_API.Data;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class StatisticsRepository : IStatisticsRepository
    {
        private readonly ApplicationDbContext _context;

        public StatisticsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OwnerDashboardDTO> GetOwnerDashboardAsync(int ownerId)
        {
            var owner = await _context.OwnerProfiles.FirstAsync(o => o.UserId == ownerId);

            var bookings = _context.Bookings
                .Include(b => b.Field)
                .Where(b =>
                    b.Field.OwnerProfileId == owner.OwnerProfileId &&
                    b.Status == "Paid");

            return new OwnerDashboardDTO
            {
                TotalRevenue = await bookings.SumAsync(b => b.TotalPrice),
                TotalBookings = await bookings.CountAsync(),
                TotalFields = await _context.Fields
                    .CountAsync(f => f.OwnerProfileId == owner.OwnerProfileId)
            };
        }

        public async Task<IEnumerable<RevenueByTimeDTO>> GetRevenueByMonthAsync(int ownerId, int year)
        {
            var owner = await _context.OwnerProfiles.FirstAsync(o => o.UserId == ownerId);

            return await _context.Bookings
                .Include(b => b.Field)
                .Where(b =>
                    b.Field.OwnerProfileId == owner.OwnerProfileId &&
                    b.Status == "Paid" &&
                    b.BookingDate.Year == year)
                .GroupBy(b => b.BookingDate.Month)
                .Select(g => new RevenueByTimeDTO
                {
                    Label = $"Tháng {g.Key}",
                    TotalRevenue = g.Sum(x => x.TotalPrice)
                })
                .OrderBy(x => x.Label)
                .ToListAsync();
        }

        public async Task<IEnumerable<RevenueByFieldDTO>> GetRevenueByFieldAsync(
            int ownerId, DateTime? from, DateTime? to)
        {
            var owner = await _context.OwnerProfiles.FirstAsync(o => o.UserId == ownerId);

            var query = _context.Bookings
                .Include(b => b.Field)
                .Where(b =>
                    b.Field.OwnerProfileId == owner.OwnerProfileId &&
                    b.Status == "Paid");

            if (from.HasValue)
                query = query.Where(b => b.BookingDate >= from.Value);

            if (to.HasValue)
                query = query.Where(b => b.BookingDate <= to.Value);

            return await query
                .GroupBy(b => b.Field)
                .Select(g => new RevenueByFieldDTO
                {
                    FieldId = g.Key.FieldId,
                    FieldName = g.Key.FieldName,
                    TotalRevenue = g.Sum(x => x.TotalPrice),
                    TotalBookings = g.Count()
                })
                .ToListAsync();
        }
    }

}
