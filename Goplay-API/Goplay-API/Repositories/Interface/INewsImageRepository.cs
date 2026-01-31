namespace Goplay_API.Repositories.Interface
{
    public interface INewsImageRepository
    {
        Task<string> UploadAsync(IFormFile file);

        Task<bool> DeleteAsync(string imageUrl);
    }
}
