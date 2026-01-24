using Goplay_API.Model.DTO;
using Goplay_API.Repositories.Interface;
using Goplay_API.Repositories.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Route("api/contacts")]
[ApiController]
public class ContactsController : ControllerBase
{
    private readonly IContactRepository _contactRepository;

    public ContactsController(IContactRepository contactRepository)
    {
        _contactRepository = contactRepository;
    }

    // Inbox
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var list = await _contactRepository.GetConversationsAsync(userId);
        return Ok(list);
    }

    // Chi tiết tin nhắn
    [HttpGet("{id}/messages")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMessages(int id)
    {
        var msgs = await _contactRepository.GetMessagesAsync(id);
        return Ok(msgs);
    }
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateContact([FromBody] CreateContactDTO dto)
    {
        int? currentUserId = null;
        if (User.Identity != null && User.Identity.IsAuthenticated)
        {
            currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        var contact = await _contactRepository.CreateContactAsync(currentUserId, dto);
        return Ok(contact);
    }
}
