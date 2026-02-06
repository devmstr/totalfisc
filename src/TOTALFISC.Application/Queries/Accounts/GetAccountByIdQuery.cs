using MediatR;
using TOTALFISC.Application.DTOs;
using TOTALFISC.Domain.Accounting.Interfaces;

namespace TOTALFISC.Application.Queries.Accounts;

public record GetAccountByIdQuery(string Id) : IRequest<AccountDto?>;

public class GetAccountByIdQueryHandler : IRequestHandler<GetAccountByIdQuery, AccountDto?>
{
    private readonly IAccountRepository _repository;

    public GetAccountByIdQueryHandler(IAccountRepository repository)
    {
        _repository = repository;
    }

    public async Task<AccountDto?> Handle(GetAccountByIdQuery request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.Id, out var guid))
            return null;

        var a = await _repository.GetByIdAsync(guid);
        if (a == null) return null;

        return new AccountDto
        {
            Id = a.Id.ToString(),
            AccountNumber = a.Number.Value,
            Label = a.Label,
            IsSummary = a.IsSummary,
            IsAuxiliary = a.IsAuxiliary,
            ParentAccountId = a.ParentAccountId?.ToString()
        };
    }
}
