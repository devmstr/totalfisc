using System;

namespace TOTALFISC.Application.DTOs;

public class JournalLineDto
{
    public string AccountId { get; set; } = string.Empty;
    public string? ThirdPartyId { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}

public class JournalEntryDto
{
    public string Id { get; set; } = string.Empty;
    public int EntryNumber { get; set; }
    public DateTime EntryDate { get; set; }
    public string JournalCode { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public List<JournalLineDto> Lines { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? PostedAt { get; set; }
    public string? PostedBy { get; set; }
    public string? ValidationHash { get; set; }
}
