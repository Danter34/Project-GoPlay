using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class TimeSlotRepository : ITimeSlotRepository
    {
        private readonly ApplicationDbContext _context;

        public TimeSlotRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TimeSlot>> GetAllAsync()
            => await _context.TimeSlots
                .Where(t => t.IsActive)
                .OrderBy(t => t.StartTime)
                .ToListAsync();

        public async Task<TimeSlot?> GetByIdAsync(int id)
            => await _context.TimeSlots.FindAsync(id);

        public async Task<TimeSlot> CreateAsync(TimeSlotDTO slotDto)
        {
            var slot = new TimeSlot
            {
                StartTime = slotDto.StartTime,
                EndTime = slotDto.EndTime,
                IsActive = slotDto.IsActive
            };

            _context.TimeSlots.Add(slot);
            await _context.SaveChangesAsync();
            return slot;
        }

        public async Task<bool> UpdateAsync(int id, TimeSlotDTO slotDto)
        {
            var existing = await _context.TimeSlots.FindAsync(id);
            if (existing == null) return false;

            existing.StartTime = slotDto.StartTime;
            existing.EndTime = slotDto.EndTime;
            existing.IsActive = slotDto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var slot = await _context.TimeSlots.FindAsync(id);
            if (slot == null) return false;

            _context.TimeSlots.Remove(slot);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
