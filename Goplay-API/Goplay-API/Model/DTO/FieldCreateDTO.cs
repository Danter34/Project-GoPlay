using Microsoft.AspNetCore.Http;

namespace Goplay_API.Model.DTO
{
    public class FieldCreateDTO
    {
        public string FieldName { get; set; }
        public decimal Price { get; set; }
        public int SportTypeId { get; set; }
        public string? Description { get; set; }

        public LocationCreateDTO Location { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}
