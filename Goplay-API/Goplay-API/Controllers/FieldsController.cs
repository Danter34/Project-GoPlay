using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/fields")]
    public class FieldsController : ControllerBase
    {
        private readonly IFieldRepository _service;

        public FieldsController(IFieldRepository service)
        {
            _service = service;
        }

        [AllowAnonymous]
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var fields = await _service.GetAllAsync();
            return Ok(fields.Select(f => new FieldResponseDTO(f)));
        }

        [AllowAnonymous]
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var field = await _service.GetByIdAsync(id);
            if (field == null) return NotFound();
            return Ok(new FieldResponseDTO(field));
        }

        [AllowAnonymous]
        [HttpGet("filter")]
        public async Task<IActionResult> Filter(
            [FromQuery] string? city,
            [FromQuery] string? district,
            [FromQuery] int? sportTypeId)
        {
            var fields = await _service.FilterAsync(city, district, sportTypeId);
            return Ok(fields.Select(f => new FieldResponseDTO(f)));
        }

        [Authorize(Roles = "OwnerField")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] FieldCreateDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var fieldId = await _service.CreateFieldAsync(userId, dto);
            return Ok(new { fieldId });
        }

        [Authorize(Roles = "OwnerField")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] FieldUpdateDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.UpdateFieldAsync(userId, id, dto);
            return result ? NoContent() : Forbid();
        }

        [Authorize(Roles = "OwnerField")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.DeleteFieldAsync(userId, id);
            return result ? NoContent() : Forbid();
        }
    }
}
