using Goplay_API.Data;
using Goplay_API.Helpers;
using Goplay_API.Model.Domain;
using Goplay_API.Model.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwt;

        public AuthController(ApplicationDbContext context, JwtService jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (_context.Users.Any(x => x.Email == dto.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Register success");
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == dto.Email);
            if (user == null ||
                !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                return Unauthorized("Invalid credentials");

            var token = _jwt.GenerateToken(user);
            return Ok(new { token });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
                return BadRequest("Current password is incorrect");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                return BadRequest("Password confirmation does not match");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Password changed successfully");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            var users = _context.Users.Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                u.Role
            });

            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{userId}/role")]
        public async Task<IActionResult> SetRole(int userId, SetRoleDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found");

            user.Role = dto.Role;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.UserId,
                user.FullName,
                user.Email,
                user.Role
            });
        }
    }
}
