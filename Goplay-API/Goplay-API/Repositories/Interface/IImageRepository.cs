using Goplay_API.Model.Domain;

namespace Goplay_API.Repositories.Interface
{
    public interface IImageRepository
    {
        Task<Image> UploadAsync(int fieldId, IFormFile file);
        Task<IEnumerable<Image>> GetByFieldAsync(int fieldId);
        Task<bool> DeleteAsync(int imageId);
    }
}
