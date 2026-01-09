using Azure.Core;
using Goplay_API.Model.Domain;

namespace Goplay_API.Model.DTO
{
    public class FieldResponseDTO
    {
        public int FieldId { get; set; }
        public string FieldName { get; set; }
        public int OwnerId { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; }

        public string SportName { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string? Description { get; set; }
        public string Address { get; set; }
        // Tọa độ
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }

        // Tất cả ảnh
        public List<ImageResponseDTO> Images { get; set; } = new List<ImageResponseDTO>();

        // Tên doanh nghiệp
        public string BusinessName { get; set; }

        public FieldResponseDTO(Field f, string baseUrl)
        {
            FieldId = f.FieldId;
            FieldName = f.FieldName;
            Price = f.Price;
            Status = f.Status;
            Description = f.Description;
            SportName = f.SportType?.SportName ?? "";
            City = f.Location?.City ?? "";
            District = f.Location?.District ?? "";
            Address = f.Location?.Address ?? "";

            // Cast double → decimal?
            Latitude = f.Location != null ? (decimal?)f.Location.Latitude : null;
            Longitude = f.Location != null ? (decimal?)f.Location.Longitude : null;

            // Check property ảnh đúng tên
            Images = f.Images?
              .Select(img => new ImageResponseDTO(img, baseUrl))
              .ToList() ?? new List<ImageResponseDTO>();

            BusinessName = f.OwnerProfile?.BusinessName ?? "";
            OwnerId = f.OwnerProfile?.UserId ?? 0;

            AverageRating = f.AverageRating;
            TotalReviews = f.Reviews?.Count ?? 0;
        }
    }
}
