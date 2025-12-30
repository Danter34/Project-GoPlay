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
        Task<(int TotalItems, List<Field> Items)> SearchAsync(FieldSearchQueryDTO query);
        Task<(int TotalItems, List<Field> Items)> GetMyFieldsAsync(
    int userId, int page, int pageSize);
        Task<(int TotalItems, List<Field> Items)> GetAllPagedAsync(
    int page, int pageSize);

        Task<(int TotalItems, List<Field> Items)> FilterPagedAsync(
    string? city,
    string? district,
    int? sportTypeId,
    int page,
    int pageSize);

    }
}
