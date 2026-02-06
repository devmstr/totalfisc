using MediatR;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.Accounting.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace TOTALFISC.Application.Queries.FiscalYears;

public record GetFiscalYearListQuery() : IRequest<List<FiscalYearDto>>;

public record FiscalYearDto(string Id, int YearNumber, string StartDate, string EndDate, string Status);

public class GetFiscalYearListHandler : IRequestHandler<GetFiscalYearListQuery, List<FiscalYearDto>>
{
    private readonly IFiscalYearRepository _repository;

    public GetFiscalYearListHandler(IFiscalYearRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<FiscalYearDto>> Handle(GetFiscalYearListQuery request, CancellationToken cancellationToken)
    {
        var fiscalYears = await _repository.GetAllAsync();
        
        return fiscalYears
            .OrderByDescending(f => f.YearNumber)
            .Select(f => new FiscalYearDto(
                f.Id.ToString(),
                f.YearNumber,
                f.StartDate.ToString("yyyy-MM-dd"),
                f.EndDate.ToString("yyyy-MM-dd"),
                f.Status.ToString()
            ))
            .ToList();
    }
}
