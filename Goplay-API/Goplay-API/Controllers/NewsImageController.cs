using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Goplay_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsImageController : ControllerBase
    {
        private readonly INewsImageRepository _newsImageRepository;

        public NewsImageController(INewsImageRepository newsImageRepository)
        {
            _newsImageRepository = newsImageRepository;
        }

       
        [HttpPost("upload")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
               
                var imageUrl = await _newsImageRepository.UploadAsync(file);

               
                return Ok(new { imageUrl = imageUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

     
        [HttpDelete("delete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromQuery] string url)
        {
            try
            {
                var success = await _newsImageRepository.DeleteAsync(url);

                if (!success)
                    return NotFound(new { message = "Không tìm thấy ảnh hoặc ảnh đã bị xóa." });

                return Ok(new { message = "Xóa ảnh thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}