using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/owner-profiles")]
    public class OwnerProfilesController : ControllerBase
    {
        private readonly IOwnerProfileRepository _service;

        public OwnerProfilesController(IOwnerProfileRepository service)
        {
            _service = service;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
            => Ok((await _service.GetAllAsync()).Select(p => new OwnerProfileResponseDTO(p)));

        [Authorize(Roles = "Admin")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
            => Ok((await _service.GetPendingAsync()).Select(p => new OwnerProfileResponseDTO(p)));

        [Authorize(Roles = "Admin")]
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var profile = await _service.GetByIdAsync(id);
            if (profile == null) return NotFound();
            return Ok(new OwnerProfileResponseDTO(profile));
        }

        [Authorize]
        [HttpPost("register")]
        public async Task<IActionResult> Register(OwnerProfileRegisterDTO dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var created = await _service.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = created.OwnerProfileId }, new OwnerProfileResponseDTO(created));
        }

        [Authorize]
        [HttpPut("update-by-id/{id}")]
        public async Task<IActionResult> Update(int id, OwnerProfileRegisterDTO dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.UpdateAsync(userId, id, dto);
            return result ? NoContent() : Forbid();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
            => await _service.ApproveAsync(id) ? NoContent() : NotFound();

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
            => await _service.RejectAsync(id) ? NoContent() : NotFound();
    }

}
