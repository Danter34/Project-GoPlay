namespace Goplay_API.Model.Domain
{
    public class User
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "User";

        public ICollection<Booking> Bookings { get; set; }
        public ICollection<Contact> SentContacts { get; set; }
        public ICollection<Contact> ReceivedContacts { get; set; }
        public OwnerProfile? OwnerProfile { get; set; }
    }

}
