using System;
using TOTALFISC.Domain.Common;

namespace TOTALFISC.Domain.Accounting.Entities;

public enum FiscalYearStatus
{
    Open,
    Locked,
    Closed
}

public class FiscalYear : AggregateRoot
{
    public int YearNumber { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public FiscalYearStatus Status { get; private set; }
    public string? ClosingEntryId { get; set; }

    // Required by EF Core
    private FiscalYear() { }

    public FiscalYear(int yearNumber, DateTime startDate, DateTime endDate)
    {
        YearNumber = yearNumber;
        StartDate = startDate;
        EndDate = endDate;
        Status = FiscalYearStatus.Open;
    }

    public void Lock() => Status = FiscalYearStatus.Locked;
    public void Close(string closingEntryId)
    {
        ClosingEntryId = closingEntryId;
        Status = FiscalYearStatus.Closed;
    }
}
