# CQRS_IMPLEMENTATION.md
# TOTALFISC - CQRS Implementation

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Pattern:** Command Query Responsibility Segregation (CQRS)  

---

## Table of Contents

1. [CQRS Overview](#cqrs-overview)
2. [Command Side](#command-side)
3. [Query Side](#query-side)
4. [MediatR Integration](#mediatr-integration)
5. [Command Examples](#command-examples)
6. [Query Examples](#query-examples)
7. [Validation](#validation)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

---

## CQRS Overview

### What is CQRS?

**CQRS (Command Query Responsibility Segregation)** separates read operations (queries) from write operations (commands).

```
┌─────────────────────────────────────────────────────────────┐
│                      CQRS PATTERN                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CLIENT REQUEST                                             │
│       │                                                      │
│       ├────► COMMAND (Write)                                │
│       │         │                                            │
│       │         ├─► Validate                                │
│       │         ├─► Execute Business Logic                  │
│       │         ├─► Modify Domain Model                     │
│       │         ├─► Save to Database                        │
│       │         └─► Return Success/Failure                  │
│       │                                                      │
│       └────► QUERY (Read)                                   │
│                 │                                            │
│                 ├─► Read from Database                      │
│                 ├─► Project to DTO                          │
│                 └─► Return Data                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **Separation of Concerns** | Commands change state, queries retrieve data |
| **Optimized Reads** | Queries use denormalized/materialized views |
| **Scalability** | Read/write models can scale independently |
| **Testability** | Easy to test commands and queries separately |
| **Clarity** | Clear intent: is this changing or reading? |

### CQRS in TOTALFISC

```
Commands (Write):
  ├─ CreateJournalEntry
  ├─ PostJournalEntry
  ├─ VoidJournalEntry
  ├─ CreateThirdParty
  └─ CloseFiscalYear

Queries (Read):
  ├─ GetJournalEntryById
  ├─ GetJournalEntriesByFiscalYear
  ├─ GetTrialBalance
  ├─ GetGeneralLedger
  └─ GetAccountStatement
```

---

## Command Side

### Command Structure

```csharp
public interface ICommand : IRequest<Result>
{
    // Marker interface for commands
}

public interface ICommandHandler<TCommand> : IRequestHandler<TCommand, Result>
    where TCommand : ICommand
{
    // Marker interface for command handlers
}
```

### Command Example

```csharp
public class CreateJournalEntryCommand : ICommand
{
    public DateTime EntryDate { get; set; }
    public string JournalCode { get; set; }
    public string Reference { get; set; }
    public string Description { get; set; }
    public string FiscalYearId { get; set; }
    public List<JournalLineDto> Lines { get; set; }
}

public class JournalLineDto
{
    public string AccountId { get; set; }
    public string? ThirdPartyId { get; set; }
    public string Label { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}
```

### Command Handler

```csharp
public class CreateJournalEntryCommandHandler : ICommandHandler<CreateJournalEntryCommand>
{
    private readonly IJournalEntryRepository _repository;
    private readonly IAccountRepository _accountRepository;
    private readonly IFiscalYearRepository _fiscalYearRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeService _dateTime;

    public async Task<Result> Handle(
        CreateJournalEntryCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Validate fiscal year exists and is open
        var fiscalYear = await _fiscalYearRepository.GetByIdAsync(request.FiscalYearId);
        if (fiscalYear == null)
            return Result.Failure("Fiscal year not found");

        if (fiscalYear.Status == FiscalYearStatus.Closed)
            return Result.Failure("Cannot create entries in closed fiscal year");

        // 2. Validate accounts exist
        var accountIds = request.Lines.Select(l => l.AccountId).Distinct();
        var accounts = await _accountRepository.GetByIdsAsync(accountIds);

        if (accounts.Count != accountIds.Count())
            return Result.Failure("One or more accounts not found");

        // 3. Get next entry number
        var entryNumber = await _repository.GetNextEntryNumberAsync(request.FiscalYearId);

        // 4. Create domain entity
        var entry = new JournalEntry
        {
            EntryId = Guid.NewGuid().ToString(),
            EntryNumber = entryNumber,
            EntryDate = request.EntryDate,
            JournalCode = request.JournalCode,
            Reference = request.Reference,
            Description = request.Description,
            FiscalYearId = request.FiscalYearId,
            Status = EntryStatus.Draft,
            CreatedBy = _currentUser.UserId,
            CreatedAt = _dateTime.UtcNow
        };

        // 5. Add lines
        foreach (var lineDto in request.Lines)
        {
            var line = new JournalLine
            {
                LineId = Guid.NewGuid().ToString(),
                LineNumber = entry.Lines.Count + 1,
                AccountId = lineDto.AccountId,
                ThirdPartyId = lineDto.ThirdPartyId,
                Label = lineDto.Label,
                Debit = lineDto.Debit,
                Credit = lineDto.Credit
            };

            entry.AddLine(line); // Domain validation happens here
        }

        // 6. Validate entry is balanced
        var validationResult = entry.ValidateBalance();
        if (!validationResult.IsSuccess)
            return validationResult;

        // 7. Save to database
        await _repository.AddAsync(entry);

        // 8. Return success with entity ID
        return Result.Success(entry.EntryId);
    }
}
```

---

## Query Side

### Query Structure

```csharp
public interface IQuery<TResult> : IRequest<TResult>
{
    // Marker interface for queries
}

public interface IQueryHandler<TQuery, TResult> : IRequestHandler<TQuery, TResult>
    where TQuery : IQuery<TResult>
{
    // Marker interface for query handlers
}
```

### Query Example

```csharp
public class GetJournalEntryByIdQuery : IQuery<JournalEntryDto?>
{
    public string EntryId { get; set; }
}

public class JournalEntryDto
{
    public string EntryId { get; set; }
    public int EntryNumber { get; set; }
    public DateTime EntryDate { get; set; }
    public string JournalCode { get; set; }
    public string JournalName { get; set; }
    public string Reference { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public List<JournalLineDto> Lines { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? PostedAt { get; set; }
    public string? PostedBy { get; set; }
}
```

### Query Handler

```csharp
public class GetJournalEntryByIdQueryHandler 
    : IQueryHandler<GetJournalEntryByIdQuery, JournalEntryDto?>
{
    private readonly ApplicationDbContext _context;

    public async Task<JournalEntryDto?> Handle(
        GetJournalEntryByIdQuery request,
        CancellationToken cancellationToken)
    {
        // Direct database query (no domain model)
        return await _context.JournalEntries
            .Where(e => e.EntryId == request.EntryId)
            .Select(e => new JournalEntryDto
            {
                EntryId = e.EntryId,
                EntryNumber = e.EntryNumber,
                EntryDate = e.EntryDate,
                JournalCode = e.JournalCode.Code,
                JournalName = e.JournalCode.Name,
                Reference = e.Reference,
                Description = e.Description,
                Status = e.Status.ToString(),
                TotalDebit = e.Lines.Sum(l => l.Debit),
                TotalCredit = e.Lines.Sum(l => l.Credit),
                Lines = e.Lines.Select(l => new JournalLineDto
                {
                    LineId = l.LineId,
                    LineNumber = l.LineNumber,
                    AccountNumber = l.Account.AccountNumber,
                    AccountLabel = l.Account.AccountLabel,
                    ThirdPartyCode = l.ThirdParty.Code,
                    ThirdPartyName = l.ThirdParty.Name,
                    Label = l.Label,
                    Debit = l.Debit,
                    Credit = l.Credit
                }).ToList(),
                CreatedAt = e.CreatedAt,
                CreatedBy = e.CreatedByUser.FullName,
                PostedAt = e.PostedAt,
                PostedBy = e.PostedByUser != null ? e.PostedByUser.FullName : null
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
```

---

## MediatR Integration

### What is MediatR?

**MediatR** is a simple mediator pattern implementation that routes commands/queries to their handlers.

### Setup in Program.cs

```csharp
// Add MediatR
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(typeof(CreateJournalEntryCommand).Assembly);
});

// Add pipeline behaviors (cross-cutting concerns)
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
```

### Usage in Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class JournalEntriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public JournalEntriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJournalEntryCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Value },
                new { id = result.Value }
            );
        }

        return BadRequest(new { error = result.Error });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var query = new GetJournalEntryByIdQuery { EntryId = id };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound();

        return Ok(result);
    }
}
```

---

## Command Examples

### 1. Post Journal Entry Command

```csharp
public class PostJournalEntryCommand : ICommand
{
    public string EntryId { get; set; }
}

public class PostJournalEntryCommandHandler : ICommandHandler<PostJournalEntryCommand>
{
    private readonly IJournalEntryRepository _repository;
    private readonly ILedgerSecurityService _securityService;
    private readonly ICurrentUserService _currentUser;

    public async Task<Result> Handle(
        PostJournalEntryCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Get entry
        var entry = await _repository.GetByIdAsync(request.EntryId);
        if (entry == null)
            return Result.Failure("Entry not found");

        // 2. Calculate hash chain
        var previousHash = await _securityService.GetLastHashAsync();
        var validationHash = _securityService.CalculateHash(entry, previousHash);

        // 3. Post entry (domain method)
        var postResult = entry.Post(validationHash, previousHash, _currentUser.UserId);
        if (!postResult.IsSuccess)
            return postResult;

        // 4. Save changes
        await _repository.UpdateAsync(entry);

        return Result.Success();
    }
}
```

### 2. Void Journal Entry Command

```csharp
public class VoidJournalEntryCommand : ICommand
{
    public string EntryId { get; set; }
    public string Reason { get; set; }
}

public class VoidJournalEntryCommandHandler : ICommandHandler<VoidJournalEntryCommand>
{
    private readonly IJournalEntryRepository _repository;
    private readonly ICurrentUserService _currentUser;

    public async Task<Result> Handle(
        VoidJournalEntryCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Get entry
        var entry = await _repository.GetByIdAsync(request.EntryId);
        if (entry == null)
            return Result.Failure("Entry not found");

        // 2. Void entry (domain method)
        var voidResult = entry.Void(request.Reason, _currentUser.UserId);
        if (!voidResult.IsSuccess)
            return voidResult;

        // 3. Create reversal entry
        var reversalEntry = entry.CreateReversal(request.Reason);

        // 4. Save both
        await _repository.UpdateAsync(entry);
        await _repository.AddAsync(reversalEntry);

        return Result.Success();
    }
}
```

### 3. Create Third Party Command

```csharp
public class CreateThirdPartyCommand : ICommand
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string? NIF { get; set; }
    public string? NIS { get; set; }
    public string? RC { get; set; }
    public string ThirdPartyType { get; set; } // Client, Supplier, Employee
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class CreateThirdPartyCommandHandler : ICommandHandler<CreateThirdPartyCommand>
{
    private readonly IThirdPartyRepository _repository;

    public async Task<Result> Handle(
        CreateThirdPartyCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Check code uniqueness
        var existing = await _repository.GetByCodeAsync(request.Code);
        if (existing != null)
            return Result.Failure("Code already exists");

        // 2. Create entity
        var thirdParty = new ThirdParty
        {
            ThirdPartyId = Guid.NewGuid().ToString(),
            Code = request.Code,
            Name = request.Name,
            NIF = request.NIF,
            NIS = request.NIS,
            RC = request.RC,
            ThirdPartyType = Enum.Parse<ThirdPartyType>(request.ThirdPartyType),
            Address = request.Address,
            Phone = request.Phone,
            Email = request.Email
        };

        // 3. Save
        await _repository.AddAsync(thirdParty);

        return Result.Success(thirdParty.ThirdPartyId);
    }
}
```

---

## Query Examples

### 1. Get Trial Balance Query

```csharp
public class GetTrialBalanceQuery : IQuery<TrialBalanceDto>
{
    public string FiscalYearId { get; set; }
    public DateTime? AsOfDate { get; set; }
}

public class GetTrialBalanceQueryHandler 
    : IQueryHandler<GetTrialBalanceQuery, TrialBalanceDto>
{
    private readonly ApplicationDbContext _context;

    public async Task<TrialBalanceDto> Handle(
        GetTrialBalanceQuery request,
        CancellationToken cancellationToken)
    {
        // Use materialized view for performance
        var query = _context.TrialBalanceView
            .Where(tb => tb.FiscalYearId == request.FiscalYearId);

        if (request.AsOfDate.HasValue)
        {
            query = query.Where(tb => tb.AsOfDate <= request.AsOfDate.Value);
        }

        var balances = await query
            .OrderBy(tb => tb.AccountNumber)
            .Select(tb => new TrialBalanceLineDto
            {
                AccountNumber = tb.AccountNumber,
                AccountLabel = tb.AccountLabel,
                OpeningDebit = tb.OpeningDebit,
                OpeningCredit = tb.OpeningCredit,
                PeriodDebit = tb.PeriodDebit,
                PeriodCredit = tb.PeriodCredit,
                ClosingDebit = tb.ClosingDebit,
                ClosingCredit = tb.ClosingCredit
            })
            .ToListAsync(cancellationToken);

        return new TrialBalanceDto
        {
            FiscalYearId = request.FiscalYearId,
            AsOfDate = request.AsOfDate ?? DateTime.Today,
            Lines = balances,
            TotalOpeningDebit = balances.Sum(l => l.OpeningDebit),
            TotalOpeningCredit = balances.Sum(l => l.OpeningCredit),
            TotalPeriodDebit = balances.Sum(l => l.PeriodDebit),
            TotalPeriodCredit = balances.Sum(l => l.PeriodCredit),
            TotalClosingDebit = balances.Sum(l => l.ClosingDebit),
            TotalClosingCredit = balances.Sum(l => l.ClosingCredit)
        };
    }
}
```

### 2. Get General Ledger Query

```csharp
public class GetGeneralLedgerQuery : IQuery<GeneralLedgerDto>
{
    public string FiscalYearId { get; set; }
    public string? AccountId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class GetGeneralLedgerQueryHandler 
    : IQueryHandler<GetGeneralLedgerQuery, GeneralLedgerDto>
{
    private readonly ApplicationDbContext _context;

    public async Task<GeneralLedgerDto> Handle(
        GetGeneralLedgerQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.GeneralLedgerView
            .Where(gl => gl.FiscalYearId == request.FiscalYearId);

        if (!string.IsNullOrEmpty(request.AccountId))
            query = query.Where(gl => gl.AccountId == request.AccountId);

        if (request.StartDate.HasValue)
            query = query.Where(gl => gl.EntryDate >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(gl => gl.EntryDate <= request.EndDate.Value);

        var entries = await query
            .OrderBy(gl => gl.EntryDate)
            .ThenBy(gl => gl.EntryNumber)
            .Select(gl => new GeneralLedgerLineDto
            {
                EntryDate = gl.EntryDate,
                EntryNumber = gl.EntryNumber,
                AccountNumber = gl.AccountNumber,
                AccountLabel = gl.AccountLabel,
                ThirdPartyCode = gl.ThirdPartyCode,
                ThirdPartyName = gl.ThirdPartyName,
                Label = gl.Label,
                Debit = gl.Debit,
                Credit = gl.Credit,
                RunningBalance = gl.RunningBalance
            })
            .ToListAsync(cancellationToken);

        return new GeneralLedgerDto
        {
            FiscalYearId = request.FiscalYearId,
            AccountId = request.AccountId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Entries = entries
        };
    }
}
```

---

## Validation

### FluentValidation Integration

```csharp
public class CreateJournalEntryCommandValidator : AbstractValidator<CreateJournalEntryCommand>
{
    public CreateJournalEntryCommandValidator()
    {
        RuleFor(x => x.EntryDate)
            .NotEmpty()
            .WithMessage("Entry date is required");

        RuleFor(x => x.JournalCode)
            .NotEmpty()
            .WithMessage("Journal code is required")
            .MaximumLength(10);

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal year is required");

        RuleFor(x => x.Lines)
            .NotEmpty()
            .WithMessage("At least one line is required")
            .Must(lines => lines.Count >= 2)
            .WithMessage("Entry must have at least 2 lines");

        RuleForEach(x => x.Lines)
            .SetValidator(new JournalLineDtoValidator());

        RuleFor(x => x.Lines)
            .Must(BeBalanced)
            .WithMessage("Entry must be balanced (total debit = total credit)");
    }

    private bool BeBalanced(List<JournalLineDto> lines)
    {
        var totalDebit = lines.Sum(l => l.Debit);
        var totalCredit = lines.Sum(l => l.Credit);
        return Math.Abs(totalDebit - totalCredit) < 0.01m;
    }
}

public class JournalLineDtoValidator : AbstractValidator<JournalLineDto>
{
    public JournalLineDtoValidator()
    {
        RuleFor(x => x.AccountId)
            .NotEmpty()
            .WithMessage("Account is required");

        RuleFor(x => x.Label)
            .NotEmpty()
            .WithMessage("Label is required")
            .MaximumLength(200);

        RuleFor(x => x)
            .Must(line => (line.Debit > 0 && line.Credit == 0) || 
                         (line.Debit == 0 && line.Credit > 0))
            .WithMessage("Line must have either debit or credit, not both");
    }
}
```

### Validation Behavior

```csharp
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken))
        );

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
        {
            throw new ValidationException(failures);
        }

        return await next();
    }
}
```

---

## Error Handling

### Result Pattern

```csharp
public class Result
{
    public bool IsSuccess { get; }
    public string Error { get; }
    public object Value { get; }

    protected Result(bool isSuccess, string error, object value)
    {
        IsSuccess = isSuccess;
        Error = error;
        Value = value;
    }

    public static Result Success() => new(true, null, null);
    public static Result Success(object value) => new(true, null, value);
    public static Result Failure(string error) => new(false, error, null);
}

public class Result<T> : Result
{
    public new T Value { get; }

    private Result(bool isSuccess, string error, T value) 
        : base(isSuccess, error, value)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(true, null, value);
    public static new Result<T> Failure(string error) => new(false, error, default);
}
```

### Global Exception Handler

```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed");

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "ValidationError",
                title = "Validation failed",
                errors = ex.Errors.GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
            });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found");

            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "NotFound",
                title = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "InternalServerError",
                title = "An unexpected error occurred"
            });
        }
    }
}
```

---

## Testing

### Command Handler Test

```csharp
public class CreateJournalEntryCommandHandlerTests
{
    private readonly Mock<IJournalEntryRepository> _repositoryMock;
    private readonly Mock<IFiscalYearRepository> _fiscalYearRepositoryMock;
    private readonly Mock<IAccountRepository> _accountRepositoryMock;
    private readonly CreateJournalEntryCommandHandler _handler;

    public CreateJournalEntryCommandHandlerTests()
    {
        _repositoryMock = new Mock<IJournalEntryRepository>();
        _fiscalYearRepositoryMock = new Mock<IFiscalYearRepository>();
        _accountRepositoryMock = new Mock<IAccountRepository>();

        _handler = new CreateJournalEntryCommandHandler(
            _repositoryMock.Object,
            _accountRepositoryMock.Object,
            _fiscalYearRepositoryMock.Object,
            Mock.Of<ICurrentUserService>(),
            Mock.Of<IDateTimeService>()
        );
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccess()
    {
        // Arrange
        var command = new CreateJournalEntryCommand
        {
            EntryDate = new DateTime(2026, 2, 5),
            JournalCode = "VTE",
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>
            {
                new() { AccountId = "acc-411", Debit = 11900, Credit = 0 },
                new() { AccountId = "acc-700", Debit = 0, Credit = 10000 },
                new() { AccountId = "acc-4457", Debit = 0, Credit = 1900 }
            }
        };

        _fiscalYearRepositoryMock
            .Setup(r => r.GetByIdAsync("fy-2026"))
            .ReturnsAsync(new FiscalYear { Status = FiscalYearStatus.Open });

        _accountRepositoryMock
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(new List<Account>
            {
                new() { AccountId = "acc-411" },
                new() { AccountId = "acc-700" },
                new() { AccountId = "acc-4457" }
            });

        _repositoryMock
            .Setup(r => r.GetNextEntryNumberAsync("fy-2026"))
            .ReturnsAsync(123);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<JournalEntry>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ClosedFiscalYear_ReturnsFailure()
    {
        // Arrange
        var command = new CreateJournalEntryCommand
        {
            FiscalYearId = "fy-2025",
            Lines = new List<JournalLineDto>()
        };

        _fiscalYearRepositoryMock
            .Setup(r => r.GetByIdAsync("fy-2025"))
            .ReturnsAsync(new FiscalYear { Status = FiscalYearStatus.Closed });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("closed fiscal year", result.Error);
    }
}
```

---

## Conclusion

CQRS in TOTALFISC provides:

✅ **Clear Separation** - Commands change state, queries read data  
✅ **Optimized Reads** - Queries use materialized views for performance  
✅ **Testability** - Easy to test commands and queries independently  
✅ **Maintainability** - Each handler has single responsibility  
✅ **Scalability** - Read/write paths can scale independently  
✅ **MediatR Integration** - Clean mediator pattern with pipeline behaviors  

This CQRS implementation ensures clean architecture, excellent performance, and easy testing while maintaining clear separation between write and read operations.

---

**Related Documents:**
- [DOMAIN_DRIVEN_DESIGN.md](DOMAIN_DRIVEN_DESIGN.md) - Domain model and aggregates
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Materialized views for queries
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) - Unit and integration tests
