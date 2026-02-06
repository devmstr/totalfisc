using System;
using System.ComponentModel.DataAnnotations;

namespace TOTALFISC.Domain.Common;

public abstract class Entity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModified { get; set; }

    public bool IsDeleted { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; }

    public override bool Equals(object? obj)
    {
        if (obj is not Entity other) return false;
        if (ReferenceEquals(this, other)) return true;
        if (GetType() != other.GetType()) return false;
        
        return Id == other.Id && Id != Guid.Empty;
    }

    public static bool operator ==(Entity? a, Entity? b)
    {
        if (a is null && b is null) return true;
        if (a is null || b is null) return false;
        return a.Equals(b);
    }

    public static bool operator !=(Entity? a, Entity? b) => !(a == b);

    public override int GetHashCode() => Id.GetHashCode();
}
