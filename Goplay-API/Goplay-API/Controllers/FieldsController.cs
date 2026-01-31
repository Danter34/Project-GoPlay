using Goplay_API.Helpers;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/fields")]
    public class FieldsController : ControllerBase
    {
        private readonly IFieldRepository _service;
        private readonly string _baseUrl;

        public FieldsController(IFieldRepository service, IOptions<AppSettings> appSettings)
        {
            _service = service;
            _baseUrl = appSettings.Value.BaseUrl;
        }

        [AllowAnonymous]
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllPaged(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;

            var result = await _service.GetAllPagedAsync(page, pageSize);

            return Ok(new PagedResult<FieldResponseDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = result.TotalItems,
                Items = result.Items
                    .Select(f => new FieldResponseDTO(f, _baseUrl))
                    .ToList()
            });
        }

        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] FieldSearchQueryDTO query)
        {
            var result = await _service.SearchAsync(query);

            return Ok(new PagedResult<FieldResponseDTO>
            {
                Page = query.Page,
                PageSize = query.PageSize,
                TotalItems = result.TotalItems,
                Items = result.Items
                    .Select(f => new FieldResponseDTO(f, _baseUrl))
                    .ToList()
            });
        }

        [AllowAnonymous]
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var field = await _service.GetByIdAsync(id);
            if (field == null) return NotFound();
            return Ok(new FieldResponseDTO(field, _baseUrl));
        }
        [Authorize(Roles = "OwnerField")]
        [HttpGet("my-fields")]
        public async Task<IActionResult> GetMyFields(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var result = await _service.GetMyFieldsAsync(userId, page, pageSize);

            return Ok(new PagedResult<FieldResponseDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = result.TotalItems,
                Items = result.Items
                    .Select(f => new FieldResponseDTO(f, _baseUrl))
                    .ToList()
            });
        }

        [AllowAnonymous]
        [HttpGet("filter")]
        public async Task<IActionResult> FilterPaged(
     [FromQuery] string? city,
     [FromQuery] string? district,
     [FromQuery] int? sportTypeId,
     [FromQuery] int page = 1,
     [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;

            var result = await _service.FilterPagedAsync(
                city, district, sportTypeId, page, pageSize);

            return Ok(new PagedResult<FieldResponseDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = result.TotalItems,
                Items = result.Items
                    .Select(f => new FieldResponseDTO(f, _baseUrl))
                    .ToList()
            });
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
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/fields/{userId}")]
        public async Task<IActionResult> GetFieldsByUserId(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // Tái sử dụng hàm GetMyFieldsAsync trong FieldRepository
            var result = await _service.GetMyFieldsAsync(userId, page, pageSize);

            // Map sang DTO trả về
            return Ok(new PagedResult<FieldResponseDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = result.TotalItems,
                Items = result.Items.Select(f => new FieldResponseDTO(f, _baseUrl)).ToList()
            });
        }
    }
}
