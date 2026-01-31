using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goplay_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly INewsRepository _newsRepository;

        public NewsController(INewsRepository newsRepository)
        {
            _newsRepository = newsRepository;
        }

        // 1. Lấy danh sách cho User (Chỉ hiện bài Published)
      
        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetPublicNews()
        {
            var newsList = await _newsRepository.GetAllAsync(publicOnly: true);
            return Ok(newsList);
        }

        // 2. Lấy chi tiết bài viết
      
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var news = await _newsRepository.GetByIdAsync(id);
            if (news == null) return NotFound(new { message = "Bài viết không tồn tại" });

            // Nếu bài viết bị ẩn mà User thường truy cập -> Chặn (Optional)
           

            return Ok(news);
        }

        // --- CÁC API DÀNH RIÊNG CHO ADMIN ---

        // 3. Lấy tất cả danh sách (Bao gồm cả bài ẩn)
    
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var newsList = await _newsRepository.GetAllAsync(publicOnly: false);
            return Ok(newsList);
        }

        // 4. Thêm bài viết mới
 
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] NewsRequestDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var newsDomain = new News
            {
                Title = dto.Title,
                Summary = dto.Summary,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl, 
                IsPublished = dto.IsPublished
            };

            var createdNews = await _newsRepository.CreateAsync(newsDomain);
            return Ok(createdNews);
        }

        // 5. Cập nhật bài viết

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] NewsRequestDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var newsDomain = new News
            {
                Title = dto.Title,
                Summary = dto.Summary,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl,
                IsPublished = dto.IsPublished
            };

            var updatedNews = await _newsRepository.UpdateAsync(id, newsDomain);

            if (updatedNews == null)
                return NotFound(new { message = "Không tìm thấy bài viết để cập nhật" });

            return Ok(updatedNews);
        }

        // 6. Xóa bài viết
 
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _newsRepository.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy bài viết để xóa" });

            return Ok(new { message = "Xóa bài viết thành công" });
        }
    }
}