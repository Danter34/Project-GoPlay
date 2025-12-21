namespace Goplay_API.Model.Domain
{
    public class Review
    {
        public int ReviewId { get; set; }

        public int FieldId { get; set; }
        public Field Field { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int Rating { get; set; } // 1–5
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
