namespace Goplay_API.Repositories.Interface
{
    public interface IReviewRepository
    {
        Task AddReviewAsync(int userId, int fieldId, int rating, string? comment);
    }
}
