namespace Goplay_API.Model.DTO
{
    public class ChatMessageDTO
    {
        public int ContactId { get; set; }
        public int SenderId { get; set; } // int thường, không null
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}