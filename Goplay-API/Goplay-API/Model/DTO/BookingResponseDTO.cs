namespace Goplay_API.Model.DTO
{
    public class BookingResponseDTO
    {
        public int BookingId { get; set; }
        public DateTime BookingDate { get; set; }
        public string Status { get; set; }
        public decimal TotalPrice { get; set; }
        public int FieldId { get; set; }
        public List<int> SlotIds { get; set; } = new List<int>();
    }
}
