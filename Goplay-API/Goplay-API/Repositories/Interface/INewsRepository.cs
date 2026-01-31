using Goplay_API.Model.Domain;

namespace Goplay_API.Repositories.Interface
{
    public interface INewsRepository
    {
        // Lấy danh sách (có tham số để lọc public hay lấy tất cả)
        Task<IEnumerable<News>> GetAllAsync(bool publicOnly = true);

        // Lấy chi tiết
        Task<News?> GetByIdAsync(int id);

        // Tạo mới
        Task<News> CreateAsync(News news);

        // Cập nhật
        Task<News?> UpdateAsync(int id, News news);

        // Xóa
        Task<bool> DeleteAsync(int id);
    }
}