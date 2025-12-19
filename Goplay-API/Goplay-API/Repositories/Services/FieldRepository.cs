using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class FieldRepository : IFieldRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageRepository _imageRepository;

        public FieldRepository(ApplicationDbContext context, IImageRepository imageRepository)
        {
            _context = context;
            _imageRepository = imageRepository;
        }

        public async Task<IEnumerable<Field>> GetAllAsync() =>
            await _context.Fields
                .Include(f => f.SportType)
                .Include(f => f.Location)
                .Include(f => f.OwnerProfile)
                .Include(f => f.Images)
                .Where(f => f.OwnerProfile.Status == "Approved")
                .ToListAsync();

        public async Task<Field?> GetByIdAsync(int id) =>
            await _context.Fields
                .Include(f => f.SportType)
                .Include(f => f.Location)
                .Include(f => f.OwnerProfile)
                .Include(f => f.Images)
                .FirstOrDefaultAsync(f => f.FieldId == id && f.OwnerProfile.Status == "Approved");

        public async Task<IEnumerable<Field>> FilterAsync(string? city, string? district, int? sportTypeId)
        {
            var query = _context.Fields
                .Include(f => f.SportType)
                .Include(f => f.Location)
                .Include(f => f.OwnerProfile)
                .Where(f => f.OwnerProfile.Status == "Approved")
                .AsQueryable();

            if (!string.IsNullOrEmpty(city)) query = query.Where(f => f.Location.City == city);
            if (!string.IsNullOrEmpty(district)) query = query.Where(f => f.Location.District == district);
            if (sportTypeId.HasValue) query = query.Where(f => f.SportTypeId == sportTypeId);

            return await query.ToListAsync();
        }

        public async Task<int> CreateFieldAsync(int ownerId, FieldCreateDTO dto)
        {
            var owner = await _context.OwnerProfiles
                .FirstOrDefaultAsync(o => o.UserId == ownerId && o.Status == "Approved");

            if (owner == null) throw new UnauthorizedAccessException("You are not an approved owner");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var location = new Location
                {
                    City = dto.Location.City,
                    District = dto.Location.District,
                    Address = dto.Location.Address,
                    Latitude = dto.Location.Latitude,
                    Longitude = dto.Location.Longitude
                };
                _context.Locations.Add(location);
                await _context.SaveChangesAsync();

                var field = new Field
                {
                    FieldName = dto.FieldName,
                    Price = dto.Price,
                    SportTypeId = dto.SportTypeId,
                    LocationId = location.LocationId,
                    OwnerProfileId = owner.OwnerProfileId,
                    Status = "Available"
                };
                _context.Fields.Add(field);
                await _context.SaveChangesAsync();

                if (dto.Images != null)
                    foreach (var file in dto.Images)
                        await _imageRepository.UploadAsync(field.FieldId, file);

                await transaction.CommitAsync();
                return field.FieldId;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateFieldAsync(int ownerId, int fieldId, FieldUpdateDTO dto)
        {
            var owner = await _context.OwnerProfiles.FirstOrDefaultAsync(o => o.UserId == ownerId);
            if (owner == null) return false;

            var field = await _context.Fields
                .Include(f => f.Location)
                .Include(f => f.Images)
                .FirstOrDefaultAsync(f => f.FieldId == fieldId);

            if (field == null || field.OwnerProfileId != owner.OwnerProfileId) return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // update field
                field.FieldName = dto.FieldName;
                field.Price = dto.Price;
                field.SportTypeId = dto.SportTypeId;

                // update location
                field.Location.City = dto.Location.City;
                field.Location.District = dto.Location.District;
                field.Location.Address = dto.Location.Address;
                field.Location.Latitude = dto.Location.Latitude;
                field.Location.Longitude = dto.Location.Longitude;

                if (dto.DeleteImageIds != null)
                    foreach (var imgId in dto.DeleteImageIds)
                        await _imageRepository.DeleteAsync(imgId);

                if (dto.NewImages != null)
                    foreach (var file in dto.NewImages)
                        await _imageRepository.UploadAsync(field.FieldId, file);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteFieldAsync(int ownerId, int fieldId)
        {
            var owner = await _context.OwnerProfiles.FirstOrDefaultAsync(o => o.UserId == ownerId);
            if (owner == null) return false;

            var field = await _context.Fields.FindAsync(fieldId);
            if (field == null || field.OwnerProfileId != owner.OwnerProfileId) return false;

            _context.Fields.Remove(field);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
