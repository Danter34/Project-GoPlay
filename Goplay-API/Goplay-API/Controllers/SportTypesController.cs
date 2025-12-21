using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/sport-types")]
    public class SportTypesController : ControllerBase
    {
        private readonly ISportTypeRepository _service;

        public SportTypesController(ISportTypeRepository service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var sportTypes = await _service.GetAllAsync();
            return Ok(sportTypes.Select(x => new SportTypeResponseDTO(x)));
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var sportType = await _service.GetByIdAsync(id);
            if (sportType == null) return NotFound();
            return Ok(new SportTypeResponseDTO(sportType));
        }

        [Authorize(Roles ="Admin")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] SportTypeDTO dto)
        {
            var sportType = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = sportType.SportTypeId }, new SportTypeResponseDTO(sportType));
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("update-by-id/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SportTypeDTO dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated ? NoContent() : NotFound();
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-by-id/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }

}
