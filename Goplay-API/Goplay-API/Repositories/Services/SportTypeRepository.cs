using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class SportTypeRepository : ISportTypeRepository
    {
        private readonly ApplicationDbContext _context;

        public SportTypeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SportType>> GetAllAsync() =>
            await _context.SportTypes.ToListAsync();

        public async Task<SportType?> GetByIdAsync(int id) =>
            await _context.SportTypes.FindAsync(id);

        public async Task<SportType> CreateAsync(SportTypeDTO dto)
        {
            var sportType = new SportType { SportName = dto.SportName };
            _context.SportTypes.Add(sportType);
            await _context.SaveChangesAsync();
            return sportType;
        }

        public async Task<bool> UpdateAsync(int id, SportTypeDTO dto)
        {
            var existing = await _context.SportTypes.FindAsync(id);
            if (existing == null) return false;

            existing.SportName = dto.SportName;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sportType = await _context.SportTypes.FindAsync(id);
            if (sportType == null) return false;

            _context.SportTypes.Remove(sportType);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
