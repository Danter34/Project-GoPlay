using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Goplay_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly IImageRepository _imageRepository;

        public ImageController(IImageRepository imageRepository)
        {
            _imageRepository = imageRepository;
        }

        [HttpPost("upload/{fieldId}")]
        public async Task<IActionResult> Upload(int fieldId, IFormFile file)
        {
            try
            {
                var image = await _imageRepository.UploadAsync(fieldId, file);
                return Ok(image);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("field/{fieldId}")]
        public async Task<IActionResult> GetByField(int fieldId)
        {
            var images = await _imageRepository.GetByFieldAsync(fieldId);
            return Ok(images);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _imageRepository.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = "Image not found" });

            return Ok(new { message = "Image deleted" });
        }
    }
}
