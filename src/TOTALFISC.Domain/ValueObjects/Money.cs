namespace TOTALFISC.Domain.ValueObjects;

public record Money
{
    // Store as millimes (1 DZD = 1000 millimes)
    public long AmountInMillimes { get; init; }

    public string Currency { get; init; } = "DZD";

    // Convenience property
    public decimal Amount => AmountInMillimes / 1000m;

    // Factory methods
    public static Money FromDZD(decimal amount)
        => new Money { AmountInMillimes = (long)(amount * 1000) };

    public static Money FromMillimes(long millimes)
        => new Money { AmountInMillimes = millimes };

    // Operators
    public static Money operator +(Money left, Money right)
        => new Money { AmountInMillimes = left.AmountInMillimes + right.AmountInMillimes };

    public static Money operator -(Money left, Money right)
        => new Money { AmountInMillimes = left.AmountInMillimes - right.AmountInMillimes };

    public override string ToString() => $"{Amount:N2} {Currency}";
}
