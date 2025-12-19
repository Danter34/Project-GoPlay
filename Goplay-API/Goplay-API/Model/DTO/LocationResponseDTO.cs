using Goplay_API.Model.Domain;

namespace Goplay_API.Model.DTO
{
    public class LocationResponseDTO
    {
        public int LocationId { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public LocationResponseDTO() { }

        public LocationResponseDTO(Location location)
        {
            LocationId = location.LocationId;
            City = location.City;
            District = location.District;
            Address = location.Address;
            Latitude = location.Latitude;
            Longitude = location.Longitude;
        }
    }
}
