using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class OwnerProfileRepository : IOwnerProfileRepository
    {
        private readonly ApplicationDbContext _context;

        public OwnerProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OwnerProfile>> GetAllAsync() =>
            await _context.OwnerProfiles.Include(o => o.User).ToListAsync();

        public async Task<IEnumerable<OwnerProfile>> GetPendingAsync() =>
            await _context.OwnerProfiles
                .Include(o => o.User)
                .Where(o => o.Status == "Pending")
                .ToListAsync();

        public async Task<OwnerProfile?> GetByIdAsync(int id) =>
            await _context.OwnerProfiles.Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OwnerProfileId == id);

        public async Task<OwnerProfile?> GetByUserIdAsync(int userId) =>
            await _context.OwnerProfiles.FirstOrDefaultAsync(o => o.UserId == userId);

        public async Task<OwnerProfile> CreateAsync(int userId, OwnerProfileRegisterDTO dto)
        {
            if (await _context.OwnerProfiles.AnyAsync(o => o.UserId == userId))
                throw new Exception("User already registered as owner");

            var profile = new OwnerProfile
            {
                UserId = userId,
                IdentityNumber = dto.IdentityNumber,
                TaxCode = dto.TaxCode,
                Phone = dto.Phone,
                BusinessName = dto.BusinessName
            };

            _context.OwnerProfiles.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<bool> UpdateAsync(int userId, int profileId, OwnerProfileRegisterDTO dto)
        {
            var existing = await _context.OwnerProfiles.FindAsync(profileId);
            if (existing == null || existing.UserId != userId) return false;

            existing.Phone = dto.Phone;
            existing.BusinessName = dto.BusinessName;
            existing.TaxCode = dto.TaxCode;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveAsync(int profileId)
        {
            var profile = await _context.OwnerProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.OwnerProfileId == profileId);

            if (profile == null) return false;

            profile.Status = "Approved";

            // set role user thành OwnerField
            profile.User.Role = "OwnerField";  
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectAsync(int profileId)
        {
            var profile = await _context.OwnerProfiles.FindAsync(profileId);
            if (profile == null) return false;

            profile.Status = "Rejected";
            await _context.SaveChangesAsync();
            return true;
        }

       

    }
}
