namespace Goplay_API.Model.DTO
{
    public class VerifyEmailDto
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; }
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public string NewPassword { get; set; }
    }
}
