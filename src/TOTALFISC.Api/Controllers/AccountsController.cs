using MediatR;
using Microsoft.AspNetCore.Mvc;
using TOTALFISC.Application.Queries.Accounts;
using TOTALFISC.Application.Commands.Accounts;

namespace TOTALFISC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetHierarchy()
    {
        var result = await _mediator.Send(new GetAccountHierarchyQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _mediator.Send(new GetAccountByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
