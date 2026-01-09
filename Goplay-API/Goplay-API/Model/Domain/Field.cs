using static System.Net.Mime.MediaTypeNames;

namespace Goplay_API.Model.Domain
{
    public class Field
    {
        public int FieldId { get; set; }
        public string FieldName { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; }

        public int SportTypeId { get; set; }
        public SportType SportType { get; set; }
        public string? Description { get; set; }
        public int LocationId { get; set; }
        public Location Location { get; set; }

        public int OwnerProfileId { get; set; }
        public OwnerProfile OwnerProfile { get; set; }
        public double AverageRating { get; set; } = 0;

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Image> Images { get; set; }
        public ICollection<Booking> Bookings { get; set; }
    }
}
