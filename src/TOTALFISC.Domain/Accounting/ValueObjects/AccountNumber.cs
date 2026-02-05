using System;
using System.Collections.Generic;
using TOTALFISC.Domain.Common;

namespace TOTALFISC.Domain.Accounting.ValueObjects;

public class AccountNumber : ValueObject
{
    public string Value { get; }

    public AccountNumber(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Account number cannot be empty.");

        if (!IsValid(value))
            throw new ArgumentException($"Invalid SCF account number format: {value}");

        Value = value.Trim();
    }

    private static bool IsValid(string value)
    {
        // SCF: 1-10 digits (usually 1-5, but allow enterprise extensions), starts with 1-7
        var trimmed = value.Trim();
        if (trimmed.Length < 1 || trimmed.Length > 15) return false;
        
        if (trimmed[0] < '1' || trimmed[0] > '7') return false;

        foreach (char c in trimmed)
        {
            if (!char.IsDigit(c)) return false;
        }

        return true;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    // implicit conversion from string
    public static implicit operator string(AccountNumber accountNumber) => accountNumber.Value;
    // explicit conversion to AccountNumber
    public static explicit operator AccountNumber(string value) => new(value);
}
