namespace Goplay_API.Model.DTO
{
    public class BookingResponseDTO
    {
        public int BookingId { get; set; }
        public DateTime BookingDate { get; set; }
        public string Status { get; set; }
        public decimal TotalPrice { get; set; }
        public int FieldId { get; set; }
        public List<BookingTimeSlotDTO> TimeSlots { get; set; } = new();
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public bool HasReviewed { get; set; }
        public string FieldName { get; set; }

    }
}
