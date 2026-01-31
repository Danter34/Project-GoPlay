namespace Goplay_API.Model.DTO
{
    public class AdminDashboardDTO
    {
        public int TotalUsers { get; set; }
        public int TotalOwners { get; set; }
        public int PendingOwners { get; set; } // Số hồ sơ chờ duyệt
        public int TotalFields { get; set; }
        public int TotalBookings { get; set; }
        public decimal TotalRevenueSystem { get; set; } // Tổng tiền giao dịch toàn sàn
    }
}