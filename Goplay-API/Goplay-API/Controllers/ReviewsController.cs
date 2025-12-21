using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewRepository _repo;

        public ReviewsController(IReviewRepository repo)
        {
            _repo = repo;
        }

        [HttpPost]
        public async Task<IActionResult> Create(int fieldId, int rating, string? comment)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _repo.AddReviewAsync(userId, fieldId, rating, comment);
            return Ok("Review submitted");
        }
    }
}
