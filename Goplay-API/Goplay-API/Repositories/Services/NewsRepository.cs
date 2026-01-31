using Goplay_API.Data;
using Goplay_API.Model.Domain;
using Goplay_API.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace Goplay_API.Repositories.Services
{
    public class NewsRepository : INewsRepository
    {
        private readonly ApplicationDbContext _context;

        public NewsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<News>> GetAllAsync(bool publicOnly = true)
        {
            var query = _context.News.AsQueryable();

            if (publicOnly)
            {
                // Nếu là user thường, chỉ lấy bài đã Public
                query = query.Where(n => n.IsPublished);
            }

            // Sắp xếp bài mới nhất lên đầu
            return await query.OrderByDescending(n => n.CreatedAt).ToListAsync();
        }

        public async Task<News?> GetByIdAsync(int id)
        {
            return await _context.News.FindAsync(id);
        }

        public async Task<News> CreateAsync(News news)
        {
            news.CreatedAt = DateTime.Now;
            await _context.News.AddAsync(news);
            await _context.SaveChangesAsync();
            return news;
        }

        public async Task<News?> UpdateAsync(int id, News newsData)
        {
            var existingNews = await _context.News.FindAsync(id);
            if (existingNews == null) return null;

            existingNews.Title = newsData.Title;
            existingNews.Summary = newsData.Summary;
            existingNews.Content = newsData.Content;
            existingNews.ImageUrl = newsData.ImageUrl;
            existingNews.IsPublished = newsData.IsPublished;
            // Không cập nhật CreatedAt

            await _context.SaveChangesAsync();
            return existingNews;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null) return false;

            _context.News.Remove(news);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}