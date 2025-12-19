using Goplay_API.Model.Domain;

namespace Goplay_API.Model.DTO
{
    public class SportTypeResponseDTO
    {
        public SportTypeResponseDTO() { }

        // Constructor từ entity SportType
        public SportTypeResponseDTO(SportType sportType)
        {
            SportTypeId = sportType.SportTypeId;
            SportName = sportType.SportName;
        }

        public int SportTypeId { get; set; }
        public string SportName { get; set; }
    }
}
