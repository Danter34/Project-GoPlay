using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IReviewRepository
    {
        Task AddReviewAsync(int userId, CreateReviewDTO dto);
    }
}
