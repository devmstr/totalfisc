using System;
using TOTALFISC.Domain.Common;
using TOTALFISC.Domain.ValueObjects;

namespace TOTALFISC.Domain.Accounting.Entities;

public class JournalLine : Entity
{
    public Guid AccountId { get; private set; }
    public Guid? ThirdPartyId { get; private set; }
    public string Label { get; private set; } = null!;
    public Money Debit { get; private set; }
    public Money Credit { get; private set; }
    public int LineNumber { get; set; }

    // Required by EF Core
    private JournalLine() { }

    public JournalLine(Guid accountId, string label, Money debit, Money credit, Guid? thirdPartyId = null)
    {
        if (debit.AmountInMillimes < 0 || credit.AmountInMillimes < 0)
            throw new ArgumentException("Amounts cannot be negative.");

        if (debit.AmountInMillimes > 0 && credit.AmountInMillimes > 0)
            throw new ArgumentException("A line cannot have both debit and credit.");

        if (debit.AmountInMillimes == 0 && credit.AmountInMillimes == 0)
            throw new ArgumentException("Line must have at least one amount.");

        AccountId = accountId;
        Label = label;
        Debit = debit;
        Credit = credit;
        ThirdPartyId = thirdPartyId;
    }
}
