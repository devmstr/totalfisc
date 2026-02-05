namespace TOTALFISC.Application.DTOs;

public class AccountDto
{
    public string Id { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool IsSummary { get; set; }
    public bool IsAuxiliary { get; set; }
    public string? ParentAccountId { get; set; }
    public string Class { get; set; } = string.Empty;
}
