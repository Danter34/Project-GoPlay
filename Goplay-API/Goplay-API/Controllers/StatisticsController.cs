using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [Authorize(Roles = "OwnerField")]
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
    }
}
