namespace Goplay_API.Model.DTO
{
    public class CreateReviewDTO
    {
        public int FieldId { get; set; }
        public int BookingId { get; set; }
        public int Rating { get; set; } // 1 - 5
        public string? Comment { get; set; }
    }
}