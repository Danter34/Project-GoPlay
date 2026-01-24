using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/timeslots")]
    public class TimeSlotsController : ControllerBase
    {
        private readonly ITimeSlotRepository _service;

        public TimeSlotsController(ITimeSlotRepository service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var slots = await _service.GetAllAsync();
            return Ok(slots.Select(s => new TimeSlotDTO
            {
                SlotId = s.SlotId,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsActive = s.IsActive
            }));
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var slot = await _service.GetByIdAsync(id);
            if (slot == null) return NotFound();

            return Ok(new TimeSlotDTO
            {
                SlotId = slot.SlotId,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                IsActive = slot.IsActive
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] TimeSlotDTO dto)
        {
            var slot = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = slot.SlotId }, new TimeSlotDTO
            {
                SlotId = slot.SlotId,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                IsActive = slot.IsActive
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-by-id/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TimeSlotDTO dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result ? NoContent() : NotFound();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-by-id/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }
    }
}
