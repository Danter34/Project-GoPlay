using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/statistics")]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsRepository _service;

        public StatisticsController(IStatisticsRepository service)
        {
            _service = service;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
            => Ok(await _service.GetOwnerDashboardAsync(UserId));

        [HttpGet("revenue-by-month")]
        public async Task<IActionResult> RevenueByMonth([FromQuery] int year)
            => Ok(await _service.GetRevenueByMonthAsync(UserId, year));

        [HttpGet("revenue-by-field")]
        public async Task<IActionResult> RevenueByField(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
            => Ok(await _service.GetRevenueByFieldAsync(UserId, from, to));

        [Authorize(Roles = "Admin")] // Chỉ Admin mới được gọi
        [HttpGet("admin-dashboard")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var data = await _service.GetAdminDashboardAsync();
            return Ok(data);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/revenue/{userId}")]
        public async Task<IActionResult> GetRevenueByUserId(int userId, [FromQuery] int year)
        {
            if (year == 0) year = DateTime.Now.Year;
            // Tái sử dụng hàm GetRevenueByMonthAsync trong Repo (Hàm này nhận UserId)
            var result = await _service.GetRevenueByMonthAsync(userId, year);
            return Ok(result);
        }
    }


}
