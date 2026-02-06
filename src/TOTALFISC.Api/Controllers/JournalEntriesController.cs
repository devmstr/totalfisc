using MediatR;
using Microsoft.AspNetCore.Mvc;
using TOTALFISC.Application.Queries.JournalEntries;
using TOTALFISC.Application.Commands.JournalEntries;

namespace TOTALFISC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JournalEntriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public JournalEntriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string fiscalYearId)
    {
        if (string.IsNullOrEmpty(fiscalYearId))
        {
            return BadRequest("fiscalYearId is required");
        }

        var result = await _mediator.Send(new GetJournalEntryListQuery(fiscalYearId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJournalEntryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
