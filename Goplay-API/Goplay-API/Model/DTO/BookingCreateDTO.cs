namespace Goplay_API.Model.DTO
{
    public class BookingCreateDTO
    {
        public int UserId { get; set; }
        public int FieldId { get; set; }
        public DateTime BookingDate { get; set; }
        public List<int> SlotIds { get; set; } = new List<int>();
    }
}
