using Microsoft.AspNetCore.Http;

namespace Goplay_API.Model.DTO
{
    public class FieldUpdateDTO
    {
        public string FieldName { get; set; }
        public decimal Price { get; set; }
        public int SportTypeId { get; set; }

        public LocationCreateDTO Location { get; set; }

        public List<IFormFile>? NewImages { get; set; }
        public List<int>? DeleteImageIds { get; set; }
    }
}
