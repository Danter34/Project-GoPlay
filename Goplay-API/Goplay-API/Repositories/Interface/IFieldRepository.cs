using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;

namespace Goplay_API.Repositories.Interface
{
    public interface IFieldRepository
    {
        Task<IEnumerable<Field>> GetAllAsync();
        Task<Field?> GetByIdAsync(int id);
        Task<IEnumerable<Field>> FilterAsync(string? city, string? district, int? sportTypeId);
        Task<int> CreateFieldAsync(int ownerId, FieldCreateDTO dto);
        Task<bool> UpdateFieldAsync(int ownerId, int fieldId, FieldUpdateDTO dto);
        Task<bool> DeleteFieldAsync(int ownerId, int fieldId);
    }
}
