using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace Goplay_API.Repositories.Services
{
    public class ImageRepository : IImageRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly string _uploadFolder;

        public ImageRepository(ApplicationDbContext context)
        {
            _context = context;

            _uploadFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "images",
                "fields"
            );

            if (!Directory.Exists(_uploadFolder))
                Directory.CreateDirectory(_uploadFolder);
        }

        public async Task<Image> UploadAsync(int fieldId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            var field = await _context.Fields.FindAsync(fieldId);
            if (field == null)
                throw new Exception("Field not found");

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var physicalPath = Path.Combine(_uploadFolder, fileName);

            using (var stream = new FileStream(physicalPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var image = new Image
            {
                FieldId = fieldId,
                ImageUrl = $"/images/fields/{fileName}" 
            };

            _context.Images.Add(image);
            await _context.SaveChangesAsync();

            return image;
        }

        public async Task<IEnumerable<Image>> GetByFieldAsync(int fieldId)
        {
            return await _context.Images
                .Where(i => i.FieldId == fieldId)
                .ToListAsync();
        }

        public async Task<bool> DeleteAsync(int imageId)
        {
            var image = await _context.Images.FindAsync(imageId);
            if (image == null) return false;

            var physicalPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                image.ImageUrl.TrimStart('/')
            );

            if (File.Exists(physicalPath))
                File.Delete(physicalPath);

            _context.Images.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}
