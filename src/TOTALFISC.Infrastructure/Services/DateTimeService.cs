using System;
using TOTALFISC.Application.Interfaces;

namespace TOTALFISC.Infrastructure.Services;

public class DateTimeService : IDateTimeService
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
