using Goplay_API.Model.Domain;

namespace Goplay_API.Model.DTO
{
    public class ContactResponseDTO
    {
       
        public int ContactId { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public int SenderId { get; set; }
        public int? ReceiverId { get; set; }

        public ContactResponseDTO(Contact c)
        {
            ContactId = c.ContactId;
            Subject = c.Subject;
            Message = c.Message;
            Status = c.Status;
            CreatedAt = c.CreatedAt;
            SenderId = c.SenderId;
            ReceiverId = c.ReceiverId;
        }
    }
}
