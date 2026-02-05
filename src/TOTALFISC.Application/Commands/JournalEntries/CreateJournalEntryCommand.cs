using MediatR;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.Accounting.Interfaces;
using TOTALFISC.Domain.Accounting.Enums;
using TOTALFISC.Application.DTOs;
using TOTALFISC.Application.Interfaces;
using TOTALFISC.Shared.Models;
using TOTALFISC.Shared.Constants;

namespace TOTALFISC.Application.Commands.JournalEntries;

public record CreateJournalEntryCommand(
    string JournalCode,
    string Description,
    DateTime EntryDate,
    string FiscalYearId,
    List<JournalLineDto> Lines,
    string? Reference = null
) : IRequest<Result<string>>;

public class CreateJournalEntryCommandHandler : IRequestHandler<CreateJournalEntryCommand, Result<string>>
{
    private readonly IJournalEntryRepository _repository;
    private readonly IFiscalYearRepository _fiscalYearRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeService _dateTime;

    public CreateJournalEntryCommandHandler(
        IJournalEntryRepository repository,
        IFiscalYearRepository fiscalYearRepository,
        ICurrentUserService currentUser,
        IDateTimeService dateTime)
    {
        _repository = repository;
        _fiscalYearRepository = fiscalYearRepository;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<Result<string>> Handle(CreateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate Fiscal Year
        var fiscalYear = await _fiscalYearRepository.GetByIdAsync(request.FiscalYearId);
        if (fiscalYear == null)
            return Result<string>.Failure(ErrorMessages.FiscalYearNotFound);

        if (fiscalYear.Status == FiscalYearStatus.Closed)
            return Result<string>.Failure(ErrorMessages.FiscalYearClosed);

        // 2. Get Next Entry Number
        var entryNumber = await _repository.GetNextEntryNumberAsync(request.FiscalYearId, request.JournalCode);

        // 3. Create Entry Aggregate
        var entry = new JournalEntry(
            request.FiscalYearId,
            request.JournalCode,
            entryNumber,
            request.EntryDate,
            request.Description,
            request.Reference ?? string.Empty
        );
        
        entry.CreatedBy = _currentUser.UserId ?? "System";

        // 4. Add Lines
        // Note: Real implementation would look up AccountIds/ThirdPartyIds to ensure existence
        // and map DTOs to Domain Entities.
        // Assuming simple mapping for scaffolding purposes:
        foreach (var lineDto in request.Lines)
        {
            var line = new JournalLine(
                lineDto.AccountId,
                lineDto.Label,
                lineDto.Debit,
                lineDto.Credit,
                lineDto.ThirdPartyId
            );
            entry.AddLine(line);
        }

        // 5. Validate Balance
        if (!entry.IsBalanced())
            return Result<string>.Failure(ErrorMessages.EntryNotBalanced);

        // 6. Save
        await _repository.AddAsync(entry);

        return Result<string>.Success(entry.Id);
    }
}
