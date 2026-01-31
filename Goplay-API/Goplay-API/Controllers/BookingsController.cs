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

            // Gọi Repository lấy DTO đã có sẵn HasReviewed
            var response = await _bookingRepository.GetMyBookingsAsync(userId);

            return Ok(response);
        }

        [Authorize(Roles = "OwnerField")]
        [HttpGet("owner/field/{fieldId}")]
        public async Task<IActionResult> GetBookingsByField(int fieldId)
        {
            try
            {
                
                int ownerUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                
                var bookings = await _bookingRepository.GetByFieldAndOwnerAsync(fieldId, ownerUserId);

                
                var response = bookings.Select(b => new BookingResponseDTO
                {
                    BookingId = b.BookingId,
                    BookingDate = b.BookingDate,
                    Status = b.Status,
                    TotalPrice = b.TotalPrice,
                    FieldId = b.FieldId,

                    
                    GuestName = !string.IsNullOrEmpty(b.GuestName) ? b.GuestName : b.User?.FullName,
                    GuestPhone = !string.IsNullOrEmpty(b.GuestPhone) ? b.GuestPhone : b.User?.Phone,

                    TimeSlots = b.BookingTimeSlots.Select(ts => new BookingTimeSlotDTO
                    {
                        StartTime = ts.TimeSlot.StartTime,
                        EndTime = ts.TimeSlot.EndTime
                    }).ToList()
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi tải danh sách đặt sân." });
            }
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
        [HttpPut("update-time")]
        [Authorize] // Chủ sân hoặc Admin mới được đổi
        public async Task<IActionResult> UpdateBookingTime([FromBody] UpdateBookingTimeDTO dto)
        {
            try
            {
                
                await _bookingRepository.UpdateBookingTimeAsync(dto.BookingId, dto.NewDate, dto.NewSlotIds);

                return Ok(new { message = "Cập nhật khung giờ thành công!" });
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
                TimeSlots = booking.BookingTimeSlots.Select(ts => new BookingTimeSlotDTO
                {
                    StartTime = ts.TimeSlot.StartTime,
                    EndTime = ts.TimeSlot.EndTime
                }).ToList()

            };

            return Ok(response);
        }

        [HttpPost("create")]
        [AllowAnonymous] 
        public async Task<IActionResult> Create([FromBody] BookingCreateDTO dto)
        {
            try
            {
                int? userId = null;

                // Kiểm tra xem request có token User hợp lệ không
                if (User.Identity != null && User.Identity.IsAuthenticated)
                {
                    var claimId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (!string.IsNullOrEmpty(claimId))
                    {
                        userId = int.Parse(claimId);
                    }
                }

                // Gọi Repo xử lý
                var booking = await _bookingRepository.CreateAsync(userId, dto);

                // Trả về kết quả
                return Ok(new BookingResponseDTO
                {
                    BookingId = booking.BookingId,
                    BookingDate = booking.BookingDate,
                    Status = booking.Status,
                    TotalPrice = booking.TotalPrice,
                    FieldId = booking.FieldId,
                    // Trả về list giờ đã đặt để hiển thị lại bill
                    TimeSlots = booking.BookingTimeSlots.Select(ts => new BookingTimeSlotDTO
                    {
                        StartTime = ts.TimeSlot.StartTime,
                        EndTime = ts.TimeSlot.EndTime
                    }).ToList()
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

            try
            {
                var success = await _bookingRepository.CancelByUserAsync(userId, id);

                if (!success)
                    return NotFound(new { message = "Không tìm thấy booking hoặc không có quyền." });

                return Ok(new { message = "Hủy đơn thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
