using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class LocationRepository:ILocationRepository
    {
        private readonly ApplicationDbContext _context;

        public LocationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Location>> GetAllAsync()
        {
            return await _context.Locations
                .Include(l => l.Fields)
                .ToListAsync();
        }

        public async Task<Location?> GetByIdAsync(int id)
        {
            return await _context.Locations
                .Include(l => l.Fields)
                .FirstOrDefaultAsync(l => l.LocationId == id);
        }

        public async Task<IEnumerable<Location>> GetByCityAsync(string city)
        {
            return await _context.Locations
                .Where(l => l.City == city)
                .ToListAsync();
        }

        public async Task<IEnumerable<Location>> GetByCityAndDistrictAsync(string city, string district)
        {
            return await _context.Locations
                .Where(l => l.City == city && l.District == district)
                .ToListAsync();
        }

        public async Task<Location> CreateAsync(LocationCreateDTO dto)
        {
            var location = new Location
            {
                City = dto.City,
                District = dto.District,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();
            return location;
        }

        public async Task<bool> UpdateAsync(int id, LocationCreateDTO dto)
        {
            var existing = await _context.Locations.FindAsync(id);
            if (existing == null) return false;

            existing.City = dto.City;
            existing.District = dto.District;
            existing.Address = dto.Address;
            existing.Latitude = dto.Latitude;
            existing.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null) return false;

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
