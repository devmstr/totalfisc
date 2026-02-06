using MediatR;
using Microsoft.AspNetCore.Mvc;
using TOTALFISC.Application.Queries.FiscalYears;

namespace TOTALFISC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FiscalYearsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FiscalYearsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetList()
    {
        var result = await _mediator.Send(new GetFiscalYearListQuery());
        return Ok(result);
    }
}
