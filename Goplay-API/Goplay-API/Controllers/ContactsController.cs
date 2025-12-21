using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Goplay_API.Controllers
{
    [ApiController]
    [Route("api/contacts")]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly IContactRepository _service;

        public ContactsController(IContactRepository service)
        {
            _service = service;
        }

        [HttpGet("inbox")]
        public async Task<IActionResult> Inbox()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var contacts = await _service.GetInboxAsync(userId);
            return Ok(contacts.Select(c => new ContactResponseDTO(c)));
        }

        [HttpGet("sent")]
        public async Task<IActionResult> Sent()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var contacts = await _service.GetSentAsync(userId);
            return Ok(contacts.Select(c => new ContactResponseDTO(c)));
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create(ContactCreateDTO dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var contact = await _service.CreateAsync(userId, dto);
            return Ok(new ContactResponseDTO(contact));
        }

        [Authorize(Roles = "Admin,OwnerField")]
        [HttpPost("reply/{id}")]
        public async Task<IActionResult> Reply(int id, ContactReplyDTO dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.ReplyAsync(id, dto.Message, userId);
            return result ? NoContent() : NotFound();
        }

        [Authorize(Roles = "Admin,OwnerField")]
        [HttpPost("close/{id}")]
        public async Task<IActionResult> Close(int id)
        {
            var result = await _service.CloseAsync(id);
            return result ? NoContent() : NotFound();
        }
    }
}
