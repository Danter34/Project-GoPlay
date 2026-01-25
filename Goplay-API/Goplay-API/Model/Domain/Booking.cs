namespace Goplay_API.Model.Domain
{
    public class Booking
    {
        public int BookingId { get; set; }
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = "Pending";
        public decimal TotalPrice { get; set; }

        // --- SỬA: Cho phép null để khách vãng lai đặt ---
        public int? UserId { get; set; }
        public User? User { get; set; }

        // --- THÊM: Thông tin khách vãng lai ---
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }

        public int FieldId { get; set; }
        public Field Field { get; set; }

        public ICollection<BookingTimeSlot> BookingTimeSlots { get; set; } = new List<BookingTimeSlot>();

        public Payment? Payment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}