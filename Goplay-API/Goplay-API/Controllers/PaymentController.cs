using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _repo;

        public PaymentController(IPaymentRepository repo)
        {
            _repo = repo;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentRequest dto)
        {
            // Kiểm tra chuỗi method gửi lên (VNPay hay MoMo)
            if (string.Equals(dto.Method, "VNPay", StringComparison.OrdinalIgnoreCase))
            {
                // Hàm này trong Repo sẽ tự set Enum = VnPay
                var result = await _repo.CreateVnPayPaymentAsync(dto);
                return Ok(result);
            }
            else
            {
                // Mặc định hoặc MoMo: Repo sẽ tự set Enum = Momo
                var result = await _repo.CreatePaymentAsync(dto);
                return Ok(result);
            }
        }

        [HttpGet("momo-return")]
        public async Task<IActionResult> MomoReturn(
            [FromQuery] string orderId,
            [FromQuery] string resultCode)
        {
            var success = await _repo.HandleMomoReturnAsync(orderId, resultCode);
            return success
                ? Ok(new { message = "Payment success" })
                : BadRequest(new { message = "Payment failed" });
        }

        [HttpPost("momo-notify")]
        public async Task<IActionResult> MomoNotify(
            [FromForm] string orderId,
            [FromForm] string resultCode)
        {
            var success = await _repo.HandleMomoNotifyAsync(orderId, resultCode);
            return success ? Ok() : BadRequest();
        }

        [HttpPost("cash-confirm/{bookingId}")]
        public async Task<IActionResult> ConfirmCash(int bookingId)
        {
            var success = await _repo.ConfirmCashPaymentAsync(bookingId);
            return success ? Ok("Cash confirmed") : BadRequest();
        }

        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VnPayReturn()
        {
            var queryParams = Request.Query
                .ToDictionary(k => k.Key, v => v.Value.ToString());

            var success = await _repo.HandleVnPayReturnAsync(queryParams);
         
            return success
                ? Ok(new { message = "Payment success" })
                : BadRequest(new { message = "Payment failed" });
        }
    }
}
