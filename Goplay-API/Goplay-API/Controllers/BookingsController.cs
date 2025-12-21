using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;

        public BookingController(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        [Authorize]
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var bookings = await _bookingRepository.GetByUserAsync(userId);

            var response = bookings.Select(b => new BookingResponseDTO
            {
                BookingId = b.BookingId,
                BookingDate = b.BookingDate,
                Status = b.Status,
                TotalPrice = b.TotalPrice,
                FieldId = b.FieldId,
                SlotIds = b.BookingTimeSlots.Select(bts => bts.SlotId).ToList()
            });

            return Ok(response);
        }

        [Authorize(Roles="OwnerField")]
        [HttpGet("owner-bookings")]
        public async Task<IActionResult> GetOwnerBookings()
        {
            int ownerUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var bookings = await _bookingRepository.GetByOwnerAsync(ownerUserId);

            var response = bookings.Select(b => new BookingResponseDTO
            {
                BookingId = b.BookingId,
                BookingDate = b.BookingDate,
                Status = b.Status,
                TotalPrice = b.TotalPrice,
                FieldId = b.FieldId,
                SlotIds = b.BookingTimeSlots.Select(s => s.SlotId).ToList()
            });

            return Ok(response);
        }

        [Authorize(Roles = "OwnerField")]
        [HttpPut("owner/{id}/status")]
        public async Task<IActionResult> OwnerUpdateStatus(
           int id,
           [FromBody] UpdateBookingStatusDTO dto)
        {
            int ownerUserId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            try
            {
                var result = await _bookingRepository
                    .OwnerUpdateStatusAsync(ownerUserId, id, dto.Status);

                return result ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("by-field/{fieldId}/date/{date}")]
        public async Task<IActionResult> GetByFieldAndDate(int fieldId, DateTime date)
        {
            var bookings = await _bookingRepository.GetByFieldAndDateAsync(fieldId, date);
            return Ok(bookings);
        }

        [Authorize]
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null || booking.UserId != userId)
                return NotFound();

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

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] BookingCreateDTO dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                var booking = await _bookingRepository.CreateAsync(userId, dto);

                return Ok(new BookingResponseDTO
                {
                    BookingId = booking.BookingId,
                    BookingDate = booking.BookingDate,
                    Status = booking.Status,
                    TotalPrice = booking.TotalPrice,
                    FieldId = booking.FieldId,
                    SlotIds = booking.BookingTimeSlots.Select(b => b.SlotId).ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var success = await _bookingRepository.CancelAsync(userId, id);
            return success ? Ok(new { message = "Booking cancelled" }) : NotFound();
        }
    }
}
