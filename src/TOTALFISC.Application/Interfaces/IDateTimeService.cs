using System;

namespace TOTALFISC.Application.Interfaces;

public interface IDateTimeService
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}
