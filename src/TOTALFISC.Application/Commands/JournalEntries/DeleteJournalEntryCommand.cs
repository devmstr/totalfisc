using MediatR;
using TOTALFISC.Domain.Accounting.Interfaces;
using TOTALFISC.Domain.Accounting.Enums;
using TOTALFISC.Shared.Models;

namespace TOTALFISC.Application.Commands.JournalEntries;

public record DeleteJournalEntryCommand(string Id) : IRequest<Result<bool>>;

public class DeleteJournalEntryCommandHandler : IRequestHandler<DeleteJournalEntryCommand, Result<bool>>
{
    private readonly IJournalEntryRepository _repository;

    public DeleteJournalEntryCommandHandler(IJournalEntryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteJournalEntryCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.Id, out var guid))
            return Result<bool>.Failure("Invalid Journal Entry ID format.");

        var entry = await _repository.GetByIdAsync(guid);
        if (entry == null)
            return Result<bool>.Failure("Journal Entry not found.");

        if (entry.Status == EntryStatus.Posted)
            return Result<bool>.Failure("Cannot delete a posted journal entry.");

        await _repository.DeleteAsync(entry);

        return Result<bool>.Success(true);
    }
}
