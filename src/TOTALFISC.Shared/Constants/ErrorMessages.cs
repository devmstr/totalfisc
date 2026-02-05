namespace TOTALFISC.Shared.Constants;

public static class ErrorMessages
{
    public const string AccountAlreadyExists = "Account with this number already exists.";
    public const string FiscalYearNotFound = "Fiscal year not found.";
    public const string FiscalYearClosed = "Cannot post entries to a closed fiscal year.";
    public const string EntryNotBalanced = "Journal entry must be balanced (Total Debit = Total Credit).";
    public const string EntryEmpty = "Journal entry must have at least two lines.";
}
