using System;

namespace TOTALFISC.Domain.Common;

public interface IDomainEvent
{
    string EventId { get; }
    DateTime OccurredAt { get; }
}

public abstract class DomainEvent : IDomainEvent
{
    public string EventId { get; } = Guid.NewGuid().ToString();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
