using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Goplay_API.Model.Domain
{
    public class Contact
    {
        [Key]
        public int ContactId { get; set; }

        // [QUAN TRỌNG] Cho phép Null để hỗ trợ Guest
        public int? SenderId { get; set; }
        [ForeignKey("SenderId")]
        public User? Sender { get; set; }

        // Người nhận (Chủ sân) luôn phải có
        public int ReceiverId { get; set; }
        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; }

        // [MỚI] Thông tin định danh cho khách vãng lai
        // VD: "Guest 888", "Guest 123"
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; } // Có thể null nếu chỉ chat ẩn danh
        public int? FieldId { get; set; }
        [ForeignKey("FieldId")]
        public Field? Field { get; set; }

        public string Subject { get; set; }

        public string Status { get; set; } = "Open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActivity { get; set; } = DateTime.UtcNow;

        public ICollection<ContactMessage> Messages { get; set; } = new List<ContactMessage>();
    }

    public class ContactMessage
    {
        [Key]
        public int Id { get; set; }

        public int ContactId { get; set; }
        [ForeignKey("ContactId")]
        public Contact Contact { get; set; }

    
        public int? UserId { get; set; }

        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}