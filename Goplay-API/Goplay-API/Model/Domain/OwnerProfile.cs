namespace Goplay_API.Model.Domain
{
    public class OwnerProfile
    {
        public int OwnerProfileId { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }


        public string IdentityNumber { get; set; } 
        public string? TaxCode { get; set; }       
        public string Phone { get; set; }

        public string BusinessName { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Field> Fields { get; set; }
    }
}
