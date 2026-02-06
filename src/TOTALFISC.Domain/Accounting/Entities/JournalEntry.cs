using System;
using System.Collections.Generic;
using System.Linq;
using TOTALFISC.Domain.Accounting.Enums;
using TOTALFISC.Domain.Common;
using TOTALFISC.Domain.ValueObjects;

namespace TOTALFISC.Domain.Accounting.Entities;

public class JournalEntry : AggregateRoot
{
    private readonly List<JournalLine> _lines = new();

    public Guid FiscalYearId { get; private set; } // Matches BaseEntity.Id
    public string JournalCode { get; private set; } = null!;
    public int EntryNumber { get; private set; }
    public DateTime EntryDate { get; private set; }
    public string Description { get; private set; } = null!;
    public string Reference { get; private set; } = null!;
    public EntryStatus Status { get; private set; }
    public string? ValidationHash { get; set; } // Set by infrastructure
    public DateTime? PostedAt { get; private set; }
    public string? PostedBy { get; private set; }

    public IReadOnlyCollection<JournalLine> Lines => _lines.AsReadOnly();
    public Money TotalDebit => Money.FromMillimes(_lines.Sum(l => l.Debit.AmountInMillimes));
    public Money TotalCredit => Money.FromMillimes(_lines.Sum(l => l.Credit.AmountInMillimes));

    // Required by EF Core
    private JournalEntry() { }

    public JournalEntry(
        Guid fiscalYearId,
        string journalCode,
        int entryNumber,
        DateTime entryDate,
        string description,
        string reference = "")
    {
        FiscalYearId = fiscalYearId;
        JournalCode = journalCode;
        EntryNumber = entryNumber;
        EntryDate = entryDate;
        Description = description;
        Reference = reference;
        Status = EntryStatus.Draft;
    }

    public void AddLine(JournalLine line)
    {
        if (Status == EntryStatus.Posted)
            throw new InvalidOperationException("Cannot add lines to a posted entry.");

        line.LineNumber = _lines.Count + 1;
        _lines.Add(line);
    }

    public void RemoveLine(Guid lineId)
    {
        if (Status == EntryStatus.Posted)
            throw new InvalidOperationException("Cannot remove lines from a posted entry.");

        var line = _lines.FirstOrDefault(l => l.Id == lineId);
        if (line != null)
        {
            _lines.Remove(line);
            // Re-sequence line numbers
            for (int i = 0; i < _lines.Count; i++)
            {
                _lines[i].LineNumber = i + 1;
            }
        }
    }

    public bool IsBalanced()
    {
        return _lines.Count >= 2 && TotalDebit.AmountInMillimes == TotalCredit.AmountInMillimes;
    }

    public void Post(string userId)
    {
        if (Status == EntryStatus.Posted)
            throw new InvalidOperationException("Entry is already posted.");

        if (!IsBalanced())
            throw new InvalidOperationException("Cannot post an unbalanced entry.");

        Status = EntryStatus.Posted;
        PostedAt = DateTime.UtcNow;
        PostedBy = userId;
        
        // Raising Domain Event could go here if needed
    }

    public void Void()
    {
        if (Status == EntryStatus.Posted)
            throw new InvalidOperationException("Cannot void a posted entry. Use contra-passation instead.");

        Status = EntryStatus.Voided;
    }
}
