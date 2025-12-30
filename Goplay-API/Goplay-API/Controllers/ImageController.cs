using Goplay_API.Helpers;
using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Goplay_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly IImageRepository _imageRepository;
        private readonly string _baseUrl;

        public ImageController(
            IImageRepository imageRepository,
            IOptions<AppSettings> appSettings)
        {
            _imageRepository = imageRepository;
            _baseUrl = appSettings.Value.BaseUrl;
        }

        [HttpPost("upload/{fieldId}")]
        public async Task<IActionResult> Upload(int fieldId, IFormFile file)
        {
            try
            {
                var image = await _imageRepository.UploadAsync(fieldId, file);
                return Ok(new ImageResponseDTO(image, _baseUrl));
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

            var result = images
                .Select(img => new ImageResponseDTO(img, _baseUrl))
                .ToList();

            return Ok(result);
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
