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
    public async Task<IActionResult> GetList([FromQuery] string fiscalYearId, [FromQuery] int? limit = null)
    {
        if (string.IsNullOrEmpty(fiscalYearId))
        {
            return BadRequest("fiscalYearId is required");
        }

        var result = await _mediator.Send(new GetJournalEntryListQuery(fiscalYearId, limit));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var result = await _mediator.Send(new GetJournalEntryByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJournalEntryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateJournalEntryCommand command)
    {
        if (id != command.Id) return BadRequest("ID mismatch");
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _mediator.Send(new DeleteJournalEntryCommand(id));
        return Ok(result);
    }
}
