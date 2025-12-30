using Goplay_API.Model.Domain;

namespace Goplay_API.Model.DTO
{
    public class ImageResponseDTO
    {
        public int ImageId { get; set; }
        public string ImageUrl { get; set; }

        public ImageResponseDTO(Image image, string baseUrl)
        {
            ImageId = image.ImageId;
            ImageUrl = baseUrl.TrimEnd('/') + image.ImageUrl;
        }
    }
}
