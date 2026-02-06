using MediatR;
using TOTALFISC.Domain.Accounting.Interfaces;
using TOTALFISC.Domain.Accounting.Enums;
using TOTALFISC.Application.Interfaces;
using TOTALFISC.Shared.Models;

namespace TOTALFISC.Application.Commands.JournalEntries;

public record PostJournalEntryCommand(string Id) : IRequest<Result<bool>>;

public class PostJournalEntryCommandHandler : IRequestHandler<PostJournalEntryCommand, Result<bool>>
{
    private readonly IJournalEntryRepository _repository;
    private readonly ICurrentUserService _currentUser;

    public PostJournalEntryCommandHandler(IJournalEntryRepository repository, ICurrentUserService currentUser)
    {
        _repository = repository;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(PostJournalEntryCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.Id, out var guid))
            return Result<bool>.Failure("Invalid Journal Entry ID format.");

        var entry = await _repository.GetByIdAsync(guid);
        if (entry == null)
            return Result<bool>.Failure("Journal Entry not found.");

        try
        {
            entry.Post(_currentUser.UserId ?? "System");
            await _repository.UpdateAsync(entry);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(ex.Message);
        }
    }
}
