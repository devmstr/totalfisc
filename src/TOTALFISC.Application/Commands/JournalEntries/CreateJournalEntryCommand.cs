using MediatR;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.Accounting.Interfaces;
using TOTALFISC.Domain.Accounting.Enums;
using TOTALFISC.Application.DTOs;
using TOTALFISC.Application.Interfaces;
using TOTALFISC.Shared.Models;
using TOTALFISC.Shared.Constants;
using TOTALFISC.Domain.ValueObjects;

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
        if (!Guid.TryParse(request.FiscalYearId, out var fyGuid))
            return Result<string>.Failure("Invalid Fiscal Year ID format.");

        var fiscalYear = await _fiscalYearRepository.GetByIdAsync(fyGuid); // Assuming Repo expects Guid? Or update Repo call?
        // Wait, GetByIdAsync(string id) vs GetByIdAsync(Guid id). 
        // If repo uses generic IRepository<T>, T.Id is Guid.
        // So Repo.GetByIdAsync likely takes Guid now.
        if (fiscalYear == null)
            return Result<string>.Failure(ErrorMessages.FiscalYearNotFound);

        if (fiscalYear.Status == FiscalYearStatus.Closed)
            return Result<string>.Failure(ErrorMessages.FiscalYearClosed);

        // 2. Get Next Entry Number
        var entryNumber = await _repository.GetNextEntryNumberAsync(fyGuid, request.JournalCode);

        // 3. Create Entry Aggregate
        var entry = new JournalEntry(
            fyGuid,
            request.JournalCode,
            entryNumber,
            request.EntryDate,
            request.Description,
            request.Reference ?? string.Empty
        );
        
        entry.CreatedBy = _currentUser.UserId ?? "System";

        // 4. Add Lines
        foreach (var lineDto in request.Lines)
        {
            if (!Guid.TryParse(lineDto.AccountId, out var accountId))
                 return Result<string>.Failure($"Invalid Account ID format: {lineDto.AccountId}");
            
            Guid? thirdPartyId = null;
            if (!string.IsNullOrEmpty(lineDto.ThirdPartyId))
            {
                 if (Guid.TryParse(lineDto.ThirdPartyId, out var tpid))
                     thirdPartyId = tpid;
                 else
                     return Result<string>.Failure($"Invalid ThirdParty ID format: {lineDto.ThirdPartyId}");
            }

            var line = new JournalLine(
                accountId,
                lineDto.Label,
                Money.FromDZD(lineDto.Debit),
                Money.FromDZD(lineDto.Credit),
                thirdPartyId
            );
            entry.AddLine(line);
        }

        // 5. Validate Balance
        if (!entry.IsBalanced())
            return Result<string>.Failure(ErrorMessages.EntryNotBalanced);

        // 6. Save
        await _repository.AddAsync(entry);

        return Result<string>.Success(entry.Id.ToString());
    }
}
