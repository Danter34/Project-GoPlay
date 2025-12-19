using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;
        public BookingController(IBookingRepository bookingRepository) => _bookingRepository = bookingRepository;

        [HttpGet("get-by-user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var bookings = await _bookingRepository.GetByUserAsync(userId);

            // Chuyển đổi sang DTO để cắt đứt vòng lặp
            var response = bookings.Select(b => new BookingResponseDTO
            {
                BookingId = b.BookingId,
                BookingDate = b.BookingDate,
                Status = b.Status,
                TotalPrice = b.TotalPrice,
                FieldId = b.FieldId,
                // Chỉ lấy danh sách ID của Slot, không lấy nguyên object Slot
                SlotIds = b.BookingTimeSlots.Select(bts => bts.SlotId).ToList()
            });

            return Ok(response);
        }

        [HttpGet("get-by-field/{fieldId}/date/{date}")]
        public async Task<IActionResult> GetByFieldAndDate(int fieldId, DateTime date)
        {
            var bookings = await _bookingRepository.GetByFieldAndDateAsync(fieldId, date);
            return Ok(bookings);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null) return NotFound(new { message = "Booking not found" });

            // Chuyển đổi sang DTO
            var response = new BookingResponseDTO
            {
                BookingId = booking.BookingId,
                BookingDate = booking.BookingDate,
                Status = booking.Status,
                TotalPrice = booking.TotalPrice,
                FieldId = booking.FieldId,
                SlotIds = booking.BookingTimeSlots.Select(bts => bts.SlotId).ToList()
            };

            return Ok(response);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] BookingCreateDTO dto)
        {
            try
            {
                var booking = await _bookingRepository.CreateAsync(dto);
                return Ok(new BookingResponseDTO
                {
                    BookingId = booking.BookingId,
                    BookingDate = booking.BookingDate,
                    Status = booking.Status,
                    FieldId = booking.FieldId,
                    SlotIds = booking.BookingTimeSlots.Select(b => b.SlotId).ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var success = await _bookingRepository.CancelAsync(id);
            return success ? Ok(new { message = "Booking cancelled" }) : NotFound(new { message = "Booking not found" });
        }
    }
}
