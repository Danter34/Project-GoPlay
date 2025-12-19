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
            // Tạo folder Images ngang hàng với Controllers
            _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "Images");
            if (!Directory.Exists(_uploadFolder))
                Directory.CreateDirectory(_uploadFolder);
        }

        public async Task<Image> UploadAsync(int fieldId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty", nameof(file));

            var field = await _context.Fields.FindAsync(fieldId);
            if (field == null)
                throw new Exception("Field not found");

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(_uploadFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var image = new Image
            {
                FieldId = fieldId,
                ImageUrl = Path.Combine("Images", fileName).Replace("\\", "/")
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

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), image.ImageUrl);
            if (File.Exists(filePath))
                File.Delete(filePath);

            _context.Images.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
