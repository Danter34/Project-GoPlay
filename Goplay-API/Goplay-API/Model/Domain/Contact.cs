namespace Goplay_API.Model.Domain
{
    public class Contact
    {
        public int ContactId { get; set; }

        public int SenderId { get; set; }
        public User Sender { get; set; }

        public int ReceiverId { get; set; }
        public User Receiver { get; set; }

        public string Subject { get; set; }
        public ICollection<ContactMessage> Messages { get; set; }

        public string Status { get; set; } = "Open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActivity { get; set; } = DateTime.UtcNow;


    }
    public class ContactMessage
    {
        public int Id { get; set; }
        public int ContactId { get; set; }
        public Contact Contact { get; set; }

        public int UserId { get; set; } // Người gửi tin nhắn này
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }


}
