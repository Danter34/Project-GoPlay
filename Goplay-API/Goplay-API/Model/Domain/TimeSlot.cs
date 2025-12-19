using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Goplay_API.Model.Domain
{
    public class TimeSlot
    {
        [Key]
        public int SlotId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsActive { get; set; } = true;
        public ICollection<BookingTimeSlot> BookingTimeSlots { get; set; } = new List<BookingTimeSlot>();
    }

}
