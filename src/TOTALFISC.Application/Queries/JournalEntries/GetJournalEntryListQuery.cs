using MediatR;
using TOTALFISC.Application.DTOs;
using TOTALFISC.Domain.Accounting.Interfaces;

namespace TOTALFISC.Application.Queries.JournalEntries;

public record GetJournalEntryListQuery(string FiscalYearId, int? Limit = null) : IRequest<List<JournalEntryDto>>;

public class GetJournalEntryListQueryHandler : IRequestHandler<GetJournalEntryListQuery, List<JournalEntryDto>>
{
    private readonly IJournalEntryRepository _repository;

    public GetJournalEntryListQueryHandler(IJournalEntryRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<JournalEntryDto>> Handle(GetJournalEntryListQuery request, CancellationToken cancellationToken)
    {
        var entries = await _repository.GetByFiscalYearAsync(Guid.Parse(request.FiscalYearId), request.Limit);

        return entries.Select(e => new JournalEntryDto
        {
            Id = e.Id.ToString(),
            EntryNumber = e.EntryNumber,
            EntryDate = e.EntryDate,
            JournalCode = e.JournalCode,
            Reference = e.Reference,
            Description = e.Description,
            Status = e.Status.ToString(),
            TotalDebit = e.TotalDebit.Amount,
            TotalCredit = e.TotalCredit.Amount,
            PostedAt = e.PostedAt,
            PostedBy = e.PostedBy,
            ValidationHash = e.ValidationHash,
            CreatedAt = e.CreatedAt,
            CreatedBy = e.CreatedBy,
            Lines = e.Lines.Select(l => new JournalLineDto
            {
                AccountId = l.AccountId.ToString(),
                ThirdPartyId = l.ThirdPartyId?.ToString(),
                Label = l.Label,
                Debit = l.Debit.Amount,
                Credit = l.Credit.Amount
            }).ToList()
        }).ToList();
    }
}
