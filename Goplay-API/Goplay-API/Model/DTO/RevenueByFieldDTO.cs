namespace Goplay_API.Model.DTO
{
    public class RevenueByFieldDTO
    {
        public int FieldId { get; set; }
        public string FieldName { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
    }
}
