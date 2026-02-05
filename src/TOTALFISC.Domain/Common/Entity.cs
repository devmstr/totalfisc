using System;
using System.Collections.Generic;

namespace TOTALFISC.Domain.Common;

public abstract class Entity
{
    public string Id { get; protected set; } = Guid.NewGuid().ToString();

    public override bool Equals(object? obj)
    {
        if (obj is not Entity other) return false;
        if (ReferenceEquals(this, other)) return true;
        if (GetType() != other.GetType()) return false;
        if (Id == null || other.Id == null) return false;

        return Id == other.Id;
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
