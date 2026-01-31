using System.ComponentModel.DataAnnotations;

namespace Goplay_API.Model.DTO
{
    // DTO dùng cho việc Tạo mới và Cập nhật
    public class NewsRequestDTO
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        public string Title { get; set; }

        public string? Summary { get; set; }

        [Required(ErrorMessage = "Nội dung không được để trống")]
        public string Content { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsPublished { get; set; } = true;
    }
}