namespace Goplay_API.Model.DTO
{
    public class FieldSearchQueryDTO
    {
        public string? Keyword { get; set; }     // search by name
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
    public class PagedResult<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);
        public List<T> Items { get; set; } = new();
    }

}
