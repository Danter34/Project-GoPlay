using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IStatisticsRepository
    {
        Task<OwnerDashboardDTO> GetOwnerDashboardAsync(int ownerId);

        Task<IEnumerable<RevenueByTimeDTO>> GetRevenueByMonthAsync(int ownerId, int year);

        Task<IEnumerable<RevenueByFieldDTO>> GetRevenueByFieldAsync(int ownerId, DateTime? from, DateTime? to);

        Task<AdminDashboardDTO> GetAdminDashboardAsync();
    }
}
