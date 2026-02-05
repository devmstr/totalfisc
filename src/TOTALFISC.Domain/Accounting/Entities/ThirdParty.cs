using TOTALFISC.Domain.Common;

namespace TOTALFISC.Domain.Accounting.Entities;

public enum ThirdPartyType
{
    Client,
    Supplier,
    Employee,
    Other
}

public class ThirdParty : AggregateRoot
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public ThirdPartyType Type { get; private set; }
    public string? NIF { get; private set; }
    public string? NIS { get; private set; }
    public string? RC { get; private set; }
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }

    // Required by EF Core
    private ThirdParty() { }

    public ThirdParty(string code, string name, ThirdPartyType type)
    {
        Code = code;
        Name = name;
        Type = type;
    }

    public void SetTaxIdentifiers(string? nif, string? nis, string? rc)
    {
        NIF = nif;
        NIS = nis;
        RC = rc;
    }

    public void SetContactInfo(string? address, string? phone, string? email)
    {
        Address = address;
        Phone = phone;
        Email = email;
    }
}
