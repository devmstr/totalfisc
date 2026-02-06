using MediatR;
using TOTALFISC.Application.DTOs;
using TOTALFISC.Domain.Accounting.Interfaces;

namespace TOTALFISC.Application.Queries.JournalEntries;

public record GetJournalEntryByIdQuery(string Id) : IRequest<JournalEntryDto?>;

public class GetJournalEntryByIdQueryHandler : IRequestHandler<GetJournalEntryByIdQuery, JournalEntryDto?>
{
    private readonly IJournalEntryRepository _repository;

    public GetJournalEntryByIdQueryHandler(IJournalEntryRepository repository)
    {
        _repository = repository;
    }

    public async Task<JournalEntryDto?> Handle(GetJournalEntryByIdQuery request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.Id, out var guid))
            return null;

        var e = await _repository.GetByIdAsync(guid);

        if (e == null) return null;

        return new JournalEntryDto
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
        };
    }
}
