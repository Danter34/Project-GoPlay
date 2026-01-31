using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Goplay_API.Repositories.Services
{
    public class NewsImageRepository : INewsImageRepository
    {
        private readonly string _uploadFolder;

        public NewsImageRepository()
        {
            // Tạo đường dẫn: wwwroot/images/news
            _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "news");

            // Nếu thư mục chưa có thì tạo mới
            if (!Directory.Exists(_uploadFolder))
                Directory.CreateDirectory(_uploadFolder);
        }

        public async Task<string> UploadAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không hợp lệ hoặc rỗng");

            // 1. Tạo tên file ngẫu nhiên để tránh trùng lặp
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

            // 2. Đường dẫn vật lý để lưu file
            var physicalPath = Path.Combine(_uploadFolder, fileName);

            // 3. Lưu file vào ổ cứng
            using (var stream = new FileStream(physicalPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 4. Trả về đường dẫn tương đối để lưu vào DB (Web URL)
            return $"/images/news/{fileName}";
        }

        public async Task<bool> DeleteAsync(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl)) return false;

            // Chuyển URL web (/images/news/abc.jpg) thành đường dẫn vật lý
            var fileName = Path.GetFileName(imageUrl);
            var physicalPath = Path.Combine(_uploadFolder, fileName);

            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
                return true;
            }
            return false;
        }
    }
}