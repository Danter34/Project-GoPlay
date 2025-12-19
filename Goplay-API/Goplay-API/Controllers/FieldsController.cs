using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Goplay_API.Repositories.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        [HttpGet("Get-all")]
        public async Task<IActionResult> GetAll()
        {
            var fields = await _service.GetAllAsync();
            return Ok(fields.Select(f => new FieldResponseDTO(f)));
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var field = await _service.GetByIdAsync(id);
            if (field == null) return NotFound();
            return Ok(new FieldResponseDTO(field));
        }

        [HttpGet("filter")]
        public async Task<IActionResult> Filter([FromQuery] string? city, [FromQuery] string? district, [FromQuery] int? sportTypeId)
        {
            var fields = await _service.FilterAsync(city, district, sportTypeId);
            return Ok(fields.Select(f => new FieldResponseDTO(f)));
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] FieldCreateDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var fieldId = await _service.CreateFieldAsync(userId, dto);
            return Ok(new { fieldId });
        }

        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] FieldUpdateDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.UpdateFieldAsync(userId, id, dto);
            return result ? NoContent() : Forbid();
        }

        [Authorize]
        [HttpDelete("delete-by-id/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.DeleteFieldAsync(userId, id);
            return result ? NoContent() : Forbid();
        }
    }

}
