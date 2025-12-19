namespace Goplay_API.Model.Domain
{
    public class BookingTimeSlot
    {
        public int BookingId { get; set; }
        public Booking Booking { get; set; }

        public int SlotId { get; set; }
        public TimeSlot TimeSlot { get; set; }
    }
}
