using System;
using TOTALFISC.Domain.Common;

namespace TOTALFISC.Domain.Accounting.Entities;

public class JournalLine : Entity
{
    public string AccountId { get; private set; } = null!;
    public string? ThirdPartyId { get; private set; }
    public string Label { get; private set; } = null!;
    public decimal Debit { get; private set; }
    public decimal Credit { get; private set; }
    public int LineNumber { get; set; }

    // Required by EF Core
    private JournalLine() { }

    public JournalLine(string accountId, string label, decimal debit, decimal credit, string? thirdPartyId = null)
    {
        if (debit < 0 || credit < 0)
            throw new ArgumentException("Amounts cannot be negative.");

        if (debit > 0 && credit > 0)
            throw new ArgumentException("A line cannot have both debit and credit.");

        if (debit == 0 && credit == 0)
            throw new ArgumentException("Line must have at least one amount.");

        AccountId = accountId;
        Label = label;
        Debit = debit;
        Credit = credit;
        ThirdPartyId = thirdPartyId;
    }
}
