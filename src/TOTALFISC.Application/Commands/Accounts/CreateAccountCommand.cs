using MediatR;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.Accounting.ValueObjects;
using TOTALFISC.Domain.Accounting.Interfaces;
using TOTALFISC.Shared.Models;
using TOTALFISC.Shared.Constants;

namespace TOTALFISC.Application.Commands.Accounts;

public record CreateAccountCommand(
    string AccountNumber,
    string Label,
    string? ParentAccountId,
    bool IsSummary,
    bool IsAuxiliary
) : IRequest<Result<string>>;

public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, Result<string>>
{
    private readonly IAccountRepository _accountRepository;

    public CreateAccountCommandHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<Result<string>> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate Account Number Format
        try
        {
            var accountNumber = new AccountNumber(request.AccountNumber);
            
            // 2. Check Uniqueness
            var existing = await _accountRepository.GetByNumberAsync(request.AccountNumber);
            if (existing != null)
                return Result<string>.Failure(ErrorMessages.AccountAlreadyExists);

            // 3. Create Entity
            var account = new Account(
                accountNumber,
                request.Label,
                request.IsSummary,
                request.IsAuxiliary,
                request.ParentAccountId
            );

            // 4. Save
            await _accountRepository.AddAsync(account);

            return Result<string>.Success(account.Id.ToString());
        }
        catch (ArgumentException ex)
        {
            return Result<string>.Failure(ex.Message);
        }
    }
}
