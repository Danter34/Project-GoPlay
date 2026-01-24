using System.ComponentModel.DataAnnotations;

namespace Goplay_API.Model.DTO
{
    public class BookingCreateDTO
    {
        [Required]
        public int FieldId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        public List<int> SlotIds { get; set; } = new List<int>();

        // --- THÊM: Thông tin khách (Optional nếu đã login) ---
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
    }
}