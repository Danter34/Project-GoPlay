namespace Goplay_API.Model.DTO
{
    public class CreateContactDTO
    {
        public int ReceiverId { get; set; }
        public string Subject { get; set; }
        public string InitialMessage { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public int? FieldId { get; set; }
    }
    public class SendMessageDTO
    {
        public int ContactId { get; set; }
        public string Content { get; set; }
    }
}