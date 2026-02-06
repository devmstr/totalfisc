using MediatR;
using TOTALFISC.Application.DTOs;
using TOTALFISC.Domain.Accounting.Interfaces;

namespace TOTALFISC.Application.Queries.Accounts;

public record GetAccountHierarchyQuery : IRequest<List<AccountDto>>;

public class GetAccountHierarchyQueryHandler : IRequestHandler<GetAccountHierarchyQuery, List<AccountDto>>
{
    private readonly IAccountRepository _repository;

    public GetAccountHierarchyQueryHandler(IAccountRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<AccountDto>> Handle(GetAccountHierarchyQuery request, CancellationToken cancellationToken)
    {
        // For now, return flat list. Hierarchy building can happen here or in UI.
        var accounts = await _repository.GetAllAsync();
        
        return accounts.Select(a => new AccountDto
        {
            Id = a.Id.ToString(),
            AccountNumber = a.Number.Value,
            Label = a.Label,
            IsSummary = a.IsSummary,
            IsAuxiliary = a.IsAuxiliary,
            ParentAccountId = a.ParentAccountId,
            Class = a.Number.Value.Length > 0 ? a.Number.Value[0].ToString() : string.Empty
        }).OrderBy(a => a.AccountNumber).ToList();
    }
}
