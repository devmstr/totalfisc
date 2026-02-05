using TOTALFISC.Domain.Accounting.ValueObjects;
using TOTALFISC.Domain.Common;

namespace TOTALFISC.Domain.Accounting.Entities;

public class Account : AggregateRoot
{
    public AccountNumber Number { get; private set; } = null!;
    public string Label { get; private set; } = null!;
    public bool IsSummary { get; private set; }
    public bool IsAuxiliary { get; private set; }
    public string? ParentAccountId { get; private set; }

    // Required by EF Core
    private Account() { }

    public Account(AccountNumber number, string label, bool isSummary, bool isAuxiliary, string? parentAccountId = null)
    {
        Number = number;
        Label = label;
        IsSummary = isSummary;
        IsAuxiliary = isAuxiliary;
        ParentAccountId = parentAccountId;
    }

    public void Update(string label, bool isSummary, bool isAuxiliary)
    {
        Label = label;
        IsSummary = isSummary;
        IsAuxiliary = isAuxiliary;
    }
}
