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
                    b.Status == "Completed");

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
                    b.Status == "Completed" &&
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
                    b.Status == "Completed");

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
        public async Task<AdminDashboardDTO> GetAdminDashboardAsync()
        {
            var totalUsers = await _context.Users.CountAsync();

            // Đếm chủ sân Active
            var totalOwners = await _context.OwnerProfiles.CountAsync(x => x.Status == "Approved");

            // Đếm chủ sân chờ duyệt
            var pendingOwners = await _context.OwnerProfiles.CountAsync(x => x.Status == "Pending");

            
            var totalFields = await _context.Fields.CountAsync(x => x.Status == "Available");

            // Đếm đơn đã hoàn thành hoặc đã xác nhận
            var totalBookings = await _context.Bookings
                .CountAsync(x => x.Status == "Completed" || x.Status == "Confirmed");

            // Tổng doanh thu toàn hệ thống
            var totalRevenue = await _context.Bookings
                .Where(x => x.Status == "Completed")
                .SumAsync(x => x.TotalPrice);

            return new AdminDashboardDTO
            {
                TotalUsers = totalUsers,
                TotalOwners = totalOwners,
                PendingOwners = pendingOwners,
                TotalFields = totalFields,
                TotalBookings = totalBookings,
                TotalRevenueSystem = totalRevenue
            };
        }
    }
}
