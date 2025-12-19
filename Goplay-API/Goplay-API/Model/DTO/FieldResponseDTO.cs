using Goplay_API.Model.Domain;

namespace Goplay_API.Model.DTO
{
    public class FieldResponseDTO
    {
        public int FieldId { get; set; }
        public string FieldName { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; }

        public string SportName { get; set; }
        public string City { get; set; }
        public string District { get; set; }

        // Tọa độ
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        // Tất cả ảnh
        public List<string> Images { get; set; } = new List<string>();

        // Tên doanh nghiệp
        public string BusinessName { get; set; }

        public FieldResponseDTO(Field f)
        {
            FieldId = f.FieldId;
            FieldName = f.FieldName;
            Price = f.Price;
            Status = f.Status;

            SportName = f.SportType?.SportName ?? "";
            City = f.Location?.City ?? "";
            District = f.Location?.District ?? "";

            // Cast double → decimal?
            Latitude = f.Location != null ? (decimal?)f.Location.Latitude : null;
            Longitude = f.Location != null ? (decimal?)f.Location.Longitude : null;

            // Check property ảnh đúng tên
            Images = f.Images?.Select(i => i.ImageUrl).ToList() ?? new List<string>();

            BusinessName = f.OwnerProfile?.BusinessName ?? "";
        }
    }
}
