using System;
using System.ComponentModel.DataAnnotations;

namespace Goplay_API.Model.Domain
{
    public class News
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Summary { get; set; }

        [Required]
        public string Content { get; set; }

        public string ImageUrl { get; set; }

        public bool IsPublished { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}