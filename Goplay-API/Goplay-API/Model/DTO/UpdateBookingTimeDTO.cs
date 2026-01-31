namespace Goplay_API.Model.DTO
{
    public class UpdateBookingTimeDTO
    {
        public int BookingId { get; set; }
        public DateTime NewDate { get; set; }
        public List<int> NewSlotIds { get; set; } // Danh sách Slot ID mới
    }
}