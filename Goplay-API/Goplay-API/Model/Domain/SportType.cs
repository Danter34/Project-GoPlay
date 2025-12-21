    namespace Goplay_API.Model.Domain
    {
        public class SportType
        {
            public int SportTypeId { get; set; }
            public string SportName { get; set; }

            public ICollection<Field?> Fields { get; set; }
        }

    }
