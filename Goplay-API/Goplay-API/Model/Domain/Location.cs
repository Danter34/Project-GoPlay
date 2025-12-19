namespace Goplay_API.Model.Domain
{
    public class Location
    {
        public int LocationId { get; set; }
        public string Address { get; set; }
        public string District { get; set; }
        public string City { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public ICollection<Field?> Fields { get; set; }
    }

}
