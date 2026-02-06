using MediatR;
using TOTALFISC.Domain.Accounting.Interfaces;
using TOTALFISC.Domain.Accounting.Enums;
using TOTALFISC.Application.DTOs;
using TOTALFISC.Shared.Models;
using TOTALFISC.Shared.Constants;
using TOTALFISC.Domain.ValueObjects;
using TOTALFISC.Domain.Accounting.Entities;

namespace TOTALFISC.Application.Commands.JournalEntries;

public record UpdateJournalEntryCommand(
    string Id,
    string Description,
    DateTime EntryDate,
    List<JournalLineDto> Lines,
    string? Reference = null
) : IRequest<Result<string>>;

public class UpdateJournalEntryCommandHandler : IRequestHandler<UpdateJournalEntryCommand, Result<string>>
{
    private readonly IJournalEntryRepository _repository;

    public UpdateJournalEntryCommandHandler(IJournalEntryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(UpdateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.Id, out var guid))
            return Result<string>.Failure("Invalid Journal Entry ID format.");

        var entry = await _repository.GetByIdAsync(guid);
        if (entry == null)
            return Result<string>.Failure("Journal Entry not found.");

        if (entry.Status == EntryStatus.Posted)
            return Result<string>.Failure("Cannot update a posted journal entry.");

        // Update basic info
        entry.SetValue(request.Description, request.EntryDate, request.Reference ?? string.Empty);

        // Update lines
        entry.ClearLines();
        
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

        if (!entry.IsBalanced())
            return Result<string>.Failure(ErrorMessages.EntryNotBalanced);

        await _repository.UpdateAsync(entry);

        return Result<string>.Success(entry.Id.ToString());
    }
}
