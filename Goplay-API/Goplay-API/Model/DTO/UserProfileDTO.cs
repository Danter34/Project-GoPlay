namespace Goplay_API.Model.DTO
{
    public class UserProfileDTO
    {
        public class UserProfileResponseDto
        {
            public int UserId { get; set; }
            public string FullName { get; set; }
            public string Email { get; set; }
            public string? Phone { get; set; }
            public string Role { get; set; }
        }
        public class UpdateUserProfileDto
        {
            public string FullName { get; set; }
            public string Email { get; set; }
            public string? Phone { get; set; }
        }
    }
}
