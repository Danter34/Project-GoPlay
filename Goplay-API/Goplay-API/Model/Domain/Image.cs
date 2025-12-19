namespace Goplay_API.Model.Domain
{
    public class Image
    {
        public int ImageId { get; set; }
        public string ImageUrl { get; set; }

        public int FieldId { get; set; }
        public Field Field { get; set; }
    }

}
