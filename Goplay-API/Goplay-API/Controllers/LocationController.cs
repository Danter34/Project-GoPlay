using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/locations")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationRepository _service;

        public LocationsController(ILocationRepository service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll() =>
            Ok((await _service.GetAllAsync()).Select(l => new LocationResponseDTO(l)));

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var location = await _service.GetByIdAsync(id);
            return location == null ? NotFound() : Ok(new LocationResponseDTO(location));
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string city, [FromQuery] string? district)
        {
            var locations = string.IsNullOrEmpty(district)
                ? await _service.GetByCityAsync(city)
                : await _service.GetByCityAndDistrictAsync(city, district);

            return Ok(locations.Select(l => new LocationResponseDTO(l)));
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] LocationCreateDTO dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.LocationId }, new LocationResponseDTO(created));
        }

        [HttpPut("update-by-id/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] LocationCreateDTO dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("delete-by-id/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }

}
