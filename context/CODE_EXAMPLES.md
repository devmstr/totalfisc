# CODE_EXAMPLES.md
# TOTALFISC - Code Examples

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Purpose:** Practical implementation examples  

---

## Table of Contents

1. [Domain Model Examples](#domain-model-examples)
2. [Command Handlers](#command-handlers)
3. [Query Handlers](#query-handlers)
4. [API Controllers](#api-controllers)
5. [Frontend Components](#frontend-components)
6. [Testing Examples](#testing-examples)

---

## Domain Model Examples

### 1. Journal Entry Aggregate

```csharp
// Domain/Aggregates/JournalEntryAggregate/JournalEntry.cs
namespace TOTALFISC.Domain.Aggregates.JournalEntryAggregate;

public class JournalEntry : Entity, IAggregateRoot
{
    private readonly List<JournalLine> _lines = new();
    private readonly List<IDomainEvent> _domainEvents = new();

    public string EntryId { get; private set; }
    public int EntryNumber { get; private set; }
    public DateTime EntryDate { get; private set; }
    public string JournalCode { get; private set; }
    public string Reference { get; private set; }
    public string Description { get; private set; }
    public string FiscalYearId { get; private set; }
    public JournalEntryStatus Status { get; private set; }

    // Value objects
    public Money TotalDebit => new(_lines.Sum(l => l.Debit.Amount));
    public Money TotalCredit => new(_lines.Sum(l => l.Credit.Amount));

    // Hash chain for tamper-proof ledger
    public string ValidationHash { get; private set; }
    public string PreviousHash { get; private set; }

    public IReadOnlyCollection<JournalLine> Lines => _lines.AsReadOnly();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // Private constructor for EF Core
    private JournalEntry() { }

    // Factory method
    public static JournalEntry Create(
        DateTime entryDate,
        string journalCode,
        string reference,
        string description,
        string fiscalYearId)
    {
        var entry = new JournalEntry
        {
            EntryId = Guid.NewGuid().ToString(),
            EntryDate = entryDate,
            JournalCode = journalCode,
            Reference = reference,
            Description = description,
            FiscalYearId = fiscalYearId,
            Status = JournalEntryStatus.Draft
        };

        entry.AddDomainEvent(new JournalEntryCreatedEvent(entry.EntryId));

        return entry;
    }

    // Add line
    public void AddLine(
        string accountId,
        string label,
        decimal debit,
        decimal credit,
        string? thirdPartyId = null)
    {
        if (Status == JournalEntryStatus.Posted)
            throw new DomainException("Cannot modify posted entry");

        var line = JournalLine.Create(
            EntryId,
            _lines.Count + 1,
            accountId,
            label,
            debit,
            credit,
            thirdPartyId
        );

        _lines.Add(line);
    }

    // Post entry (make immutable)
    public void Post(string previousHash)
    {
        // Validate
        if (Status == JournalEntryStatus.Posted)
            throw new DomainException("Entry already posted");

        if (!IsBalanced())
            throw new DomainException("Entry must be balanced before posting");

        if (_lines.Count == 0)
            throw new DomainException("Entry must have at least one line");

        // Calculate hash
        PreviousHash = previousHash;
        ValidationHash = CalculateHash();

        // Change status
        Status = JournalEntryStatus.Posted;

        // Raise event
        AddDomainEvent(new JournalEntryPostedEvent(EntryId, ValidationHash));
    }

    // Check if balanced
    public bool IsBalanced()
    {
        return Math.Abs(TotalDebit.Amount - TotalCredit.Amount) < 0.01m;
    }

    // Calculate SHA-256 hash
    private string CalculateHash()
    {
        var data = $"{EntryId}|{EntryDate:O}|{JournalCode}|{Reference}|" +
                   $"{TotalDebit.Amount}|{TotalCredit.Amount}|{PreviousHash}";

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hashBytes);
    }

    // Domain events
    private void AddDomainEvent(IDomainEvent eventItem)
    {
        _domainEvents.Add(eventItem);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}

// Status enum
public enum JournalEntryStatus
{
    Draft = 0,
    Posted = 1,
    Voided = 2
}
```

### 2. Journal Line Entity

```csharp
// Domain/Aggregates/JournalEntryAggregate/JournalLine.cs
public class JournalLine : Entity
{
    public string LineId { get; private set; }
    public string EntryId { get; private set; }
    public int LineNumber { get; private set; }
    public string AccountId { get; private set; }
    public string Label { get; private set; }
    public string? ThirdPartyId { get; private set; }

    // Value objects
    public Money Debit { get; private set; }
    public Money Credit { get; private set; }

    // Navigation properties
    public Account Account { get; private set; }
    public ThirdParty? ThirdParty { get; private set; }

    private JournalLine() { }

    public static JournalLine Create(
        string entryId,
        int lineNumber,
        string accountId,
        string label,
        decimal debit,
        decimal credit,
        string? thirdPartyId = null)
    {
        // Validation
        if (debit < 0 || credit < 0)
            throw new DomainException("Amounts cannot be negative");

        if (debit > 0 && credit > 0)
            throw new DomainException("Line cannot have both debit and credit");

        return new JournalLine
        {
            LineId = Guid.NewGuid().ToString(),
            EntryId = entryId,
            LineNumber = lineNumber,
            AccountId = accountId,
            Label = label,
            ThirdPartyId = thirdPartyId,
            Debit = new Money(debit),
            Credit = new Money(credit)
        };
    }
}
```

### 3. Money Value Object

```csharp
// Domain/ValueObjects/Money.cs
public record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "DZD")
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative", nameof(amount));

        Amount = Math.Round(amount, 2);
        Currency = currency ?? "DZD";
    }

    // Operators
    public static Money operator +(Money left, Money right)
    {
        if (left.Currency != right.Currency)
            throw new InvalidOperationException("Cannot add money with different currencies");

        return new Money(left.Amount + right.Amount, left.Currency);
    }

    public static Money operator -(Money left, Money right)
    {
        if (left.Currency != right.Currency)
            throw new InvalidOperationException("Cannot subtract money with different currencies");

        return new Money(left.Amount - right.Amount, left.Currency);
    }

    public static bool operator >(Money left, Money right) => left.Amount > right.Amount;
    public static bool operator <(Money left, Money right) => left.Amount < right.Amount;

    public override string ToString() => $"{Amount:N2} {Currency}";
}
```

---

## Command Handlers

### 1. Create Journal Entry Command

```csharp
// Application/Commands/CreateJournalEntryCommand.cs
public record CreateJournalEntryCommand : IRequest<string>
{
    public DateTime EntryDate { get; init; }
    public string JournalCode { get; init; }
    public string Reference { get; init; }
    public string Description { get; init; }
    public string FiscalYearId { get; init; }
    public List<CreateJournalLineDto> Lines { get; init; } = new();
}

public record CreateJournalLineDto
{
    public string AccountId { get; init; }
    public string Label { get; init; }
    public decimal Debit { get; init; }
    public decimal Credit { get; init; }
    public string? ThirdPartyId { get; init; }
}

// Command Handler
public class CreateJournalEntryCommandHandler
    : IRequestHandler<CreateJournalEntryCommand, string>
{
    private readonly IJournalEntryRepository _repository;
    private readonly IFiscalYearRepository _fiscalYearRepository;
    private readonly IAccountRepository _accountRepository;
    private readonly ILogger<CreateJournalEntryCommandHandler> _logger;

    public CreateJournalEntryCommandHandler(
        IJournalEntryRepository repository,
        IFiscalYearRepository fiscalYearRepository,
        IAccountRepository accountRepository,
        ILogger<CreateJournalEntryCommandHandler> logger)
    {
        _repository = repository;
        _fiscalYearRepository = fiscalYearRepository;
        _accountRepository = accountRepository;
        _logger = logger;
    }

    public async Task<string> Handle(
        CreateJournalEntryCommand request,
        CancellationToken cancellationToken)
    {
        // Validate fiscal year
        var fiscalYear = await _fiscalYearRepository.GetByIdAsync(request.FiscalYearId);
        if (fiscalYear == null)
            throw new NotFoundException($"Fiscal year {request.FiscalYearId} not found");

        if (fiscalYear.Status != FiscalYearStatus.Open)
            throw new BusinessRuleViolationException("Cannot create entries in closed fiscal year");

        // Validate accounts exist
        foreach (var line in request.Lines)
        {
            var account = await _accountRepository.GetByIdAsync(line.AccountId);
            if (account == null)
                throw new NotFoundException($"Account {line.AccountId} not found");
        }

        // Create entry
        var entry = JournalEntry.Create(
            request.EntryDate,
            request.JournalCode,
            request.Reference,
            request.Description,
            request.FiscalYearId
        );

        // Add lines
        foreach (var line in request.Lines)
        {
            entry.AddLine(
                line.AccountId,
                line.Label,
                line.Debit,
                line.Credit,
                line.ThirdPartyId
            );
        }

        // Validate balanced
        if (!entry.IsBalanced())
            throw new BusinessRuleViolationException("Entry must be balanced");

        // Save
        await _repository.AddAsync(entry);

        _logger.LogInformation(
            "Journal entry {EntryId} created with {LineCount} lines",
            entry.EntryId,
            entry.Lines.Count
        );

        return entry.EntryId;
    }
}
```

### 2. Post Journal Entry Command

```csharp
// Application/Commands/PostJournalEntryCommand.cs
public record PostJournalEntryCommand(string EntryId) : IRequest;

public class PostJournalEntryCommandHandler : IRequestHandler<PostJournalEntryCommand>
{
    private readonly IJournalEntryRepository _repository;
    private readonly IHashChainService _hashChainService;
    private readonly ILogger<PostJournalEntryCommandHandler> _logger;

    public async Task Handle(
        PostJournalEntryCommand request,
        CancellationToken cancellationToken)
    {
        // Get entry
        var entry = await _repository.GetByIdAsync(request.EntryId);
        if (entry == null)
            throw new NotFoundException($"Entry {request.EntryId} not found");

        // Get previous hash
        var previousHash = await _hashChainService.GetLatestHashAsync(entry.FiscalYearId);

        // Post entry
        entry.Post(previousHash);

        // Update
        await _repository.UpdateAsync(entry);

        _logger.LogInformation(
            "Journal entry {EntryId} posted with hash {Hash}",
            entry.EntryId,
            entry.ValidationHash
        );
    }
}
```

---

## Query Handlers

### 1. Get Journal Entry Query

```csharp
// Application/Queries/GetJournalEntryQuery.cs
public record GetJournalEntryQuery(string EntryId) : IRequest<JournalEntryDto>;

public class GetJournalEntryQueryHandler
    : IRequestHandler<GetJournalEntryQuery, JournalEntryDto>
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public async Task<JournalEntryDto> Handle(
        GetJournalEntryQuery request,
        CancellationToken cancellationToken)
    {
        var entry = await _context.JournalEntries
            .AsNoTracking()
            .Include(e => e.Lines)
                .ThenInclude(l => l.Account)
            .Include(e => e.Lines)
                .ThenInclude(l => l.ThirdParty)
            .FirstOrDefaultAsync(e => e.EntryId == request.EntryId, cancellationToken);

        if (entry == null)
            throw new NotFoundException($"Entry {request.EntryId} not found");

        return _mapper.Map<JournalEntryDto>(entry);
    }
}

// DTO
public class JournalEntryDto
{
    public string EntryId { get; set; }
    public int EntryNumber { get; set; }
    public DateTime EntryDate { get; set; }
    public string JournalCode { get; set; }
    public string Reference { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public string ValidationHash { get; set; }
    public string PreviousHash { get; set; }
    public List<JournalLineDto> Lines { get; set; }
}
```

### 2. Get Trial Balance Query

```csharp
// Application/Queries/GetTrialBalanceQuery.cs
public record GetTrialBalanceQuery(
    string FiscalYearId,
    DateTime? AsOfDate = null) : IRequest<TrialBalanceDto>;

public class GetTrialBalanceQueryHandler
    : IRequestHandler<GetTrialBalanceQuery, TrialBalanceDto>
{
    private readonly ApplicationDbContext _context;

    public async Task<TrialBalanceDto> Handle(
        GetTrialBalanceQuery request,
        CancellationToken cancellationToken)
    {
        var asOfDate = request.AsOfDate ?? DateTime.Now;

        // Query trial balance view (materialized)
        var balances = await _context.TrialBalanceView
            .Where(tb => tb.FiscalYearId == request.FiscalYearId)
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
            AsOfDate = asOfDate,
            Lines = balances,
            TotalOpeningDebit = balances.Sum(b => b.OpeningDebit),
            TotalOpeningCredit = balances.Sum(b => b.OpeningCredit),
            TotalPeriodDebit = balances.Sum(b => b.PeriodDebit),
            TotalPeriodCredit = balances.Sum(b => b.PeriodCredit),
            TotalClosingDebit = balances.Sum(b => b.ClosingDebit),
            TotalClosingCredit = balances.Sum(b => b.ClosingCredit)
        };
    }
}
```

---

## API Controllers

### Journal Entries Controller

```csharp
// API/Controllers/JournalEntriesController.cs
[ApiController]
[Route("api/journal-entries")]
[Authorize]
public class JournalEntriesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<JournalEntriesController> _logger;

    public JournalEntriesController(IMediator mediator, ILogger<JournalEntriesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get journal entry by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(JournalEntryDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
    {
        var query = new GetJournalEntryQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create new journal entry
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "CanCreateEntries")]
    [ProducesResponseType(typeof(CreateJournalEntryResponse), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateJournalEntryCommand command)
    {
        var entryId = await _mediator.Send(command);

        return CreatedAtAction(
            nameof(GetById),
            new { id = entryId },
            new CreateJournalEntryResponse { EntryId = entryId }
        );
    }

    /// <summary>
    /// Post journal entry (make immutable)
    /// </summary>
    [HttpPost("{id}/post")]
    [Authorize(Policy = "CanPostEntries")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Post(string id)
    {
        var command = new PostJournalEntryCommand(id);
        await _mediator.Send(command);

        return Ok(new { Message = "Entry posted successfully" });
    }
}
```

---

## Frontend Components

### Journal Entry Form (React + TypeScript)

```typescript
// components/journal-entry-form.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const lineSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  label: z.string().min(1, 'Label is required'),
  debit: z.number().min(0),
  credit: z.number().min(0),
  thirdPartyId: z.string().optional(),
});

const entrySchema = z.object({
  entryDate: z.date(),
  journalCode: z.string().min(1),
  reference: z.string().min(1),
  description: z.string().min(1),
  fiscalYearId: z.string().min(1),
  lines: z.array(lineSchema).min(2, 'At least 2 lines required'),
});

type EntryFormData = z.infer<typeof entrySchema>;

export function JournalEntryForm() {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<LineData[]>([
    { accountId: '', label: '', debit: 0, credit: 0 },
    { accountId: '', label: '', debit: 0, credit: 0 },
  ]);

  const { register, handleSubmit, formState: { errors } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
  });

  // Create entry mutation
  const createMutation = useMutation({
    mutationFn: async (data: EntryFormData) => {
      const response = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({ title: 'Entry created successfully' });
    },
  });

  const onSubmit = (data: EntryFormData) => {
    createMutation.mutate(data);
  };

  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="entryDate">Date</Label>
          <Input type="date" {...register('entryDate')} />
          {errors.entryDate && (
            <p className="text-sm text-red-500">{errors.entryDate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="journalCode">Journal</Label>
          <select {...register('journalCode')} className="w-full">
            <option value="VTE">VTE - Ventes</option>
            <option value="ACH">ACH - Achats</option>
            <option value="BQ">BQ - Banque</option>
          </select>
        </div>
      </div>

      {/* Lines */}
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-6 gap-2">
            <Input placeholder="Account" {...register(`lines.${index}.accountId`)} />
            <Input placeholder="Label" {...register(`lines.${index}.label`)} className="col-span-2" />
            <Input type="number" placeholder="Debit" {...register(`lines.${index}.debit`, { valueAsNumber: true })} />
            <Input type="number" placeholder="Credit" {...register(`lines.${index}.credit`, { valueAsNumber: true })} />
            <Button type="button" variant="ghost" onClick={() => removeLine(index)}>×</Button>
          </div>
        ))}

        <Button type="button" onClick={addLine}>+ Add Line</Button>
      </div>

      {/* Balance Indicator */}
      <div className={`p-4 rounded ${isBalanced ? 'bg-green-100' : 'bg-red-100'}`}>
        <div className="flex justify-between">
          <span>Total Debit: {totalDebit.toFixed(2)}</span>
          <span>Total Credit: {totalCredit.toFixed(2)}</span>
          <span className="font-bold">
            {isBalanced ? '✅ Balanced' : '⚠️ Unbalanced'}
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-2">
        <Button type="submit" disabled={!isBalanced}>
          Save & Post
        </Button>
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
      </div>
    </form>
  );
}
```

---

## Testing Examples

### Unit Test (xUnit)

```csharp
// Tests/Domain/JournalEntryTests.cs
public class JournalEntryTests
{
    [Fact]
    public void Create_ShouldCreateValidEntry()
    {
        // Arrange
        var entryDate = DateTime.Now;
        var journalCode = "VTE";
        var reference = "FAC-001";
        var description = "Test sale";
        var fiscalYearId = "fy-2026";

        // Act
        var entry = JournalEntry.Create(
            entryDate,
            journalCode,
            reference,
            description,
            fiscalYearId
        );

        // Assert
        Assert.NotNull(entry);
        Assert.NotEmpty(entry.EntryId);
        Assert.Equal(journalCode, entry.JournalCode);
        Assert.Equal(JournalEntryStatus.Draft, entry.Status);
        Assert.Single(entry.DomainEvents);
    }

    [Fact]
    public void AddLine_ShouldAddLineToEntry()
    {
        // Arrange
        var entry = CreateTestEntry();

        // Act
        entry.AddLine("acc-411", "Client invoice", 1000m, 0m);

        // Assert
        Assert.Single(entry.Lines);
        Assert.Equal(1000m, entry.TotalDebit.Amount);
    }

    [Fact]
    public void Post_WhenUnbalanced_ShouldThrowException()
    {
        // Arrange
        var entry = CreateTestEntry();
        entry.AddLine("acc-411", "Client", 1000m, 0m);
        entry.AddLine("acc-700", "Revenue", 0m, 500m); // Unbalanced!

        // Act & Assert
        var exception = Assert.Throws<DomainException>(() =>
            entry.Post("previous-hash")
        );

        Assert.Equal("Entry must be balanced before posting", exception.Message);
    }

    [Fact]
    public void Post_WhenBalanced_ShouldSetHashAndStatus()
    {
        // Arrange
        var entry = CreateTestEntry();
        entry.AddLine("acc-411", "Client", 1000m, 0m);
        entry.AddLine("acc-700", "Revenue", 0m, 1000m);

        // Act
        entry.Post("previous-hash");

        // Assert
        Assert.Equal(JournalEntryStatus.Posted, entry.Status);
        Assert.NotEmpty(entry.ValidationHash);
        Assert.Equal("previous-hash", entry.PreviousHash);
    }

    private JournalEntry CreateTestEntry()
    {
        return JournalEntry.Create(
            DateTime.Now,
            "VTE",
            "TEST-001",
            "Test entry",
            "fy-2026"
        );
    }
}
```

---

## Conclusion

These code examples demonstrate:

✅ **Domain Model** - Proper aggregate design with invariants  
✅ **CQRS** - Separate commands and queries  
✅ **API** - RESTful endpoints with proper HTTP semantics  
✅ **Frontend** - Modern React with TypeScript and React Query  
✅ **Testing** - Unit tests with xUnit  

Use these as templates for implementing additional features!

---

**Related Documents:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [DOMAIN_DRIVEN_DESIGN.md](DOMAIN_DRIVEN_DESIGN.md) - DDD patterns
- [CQRS_IMPLEMENTATION.md](CQRS_IMPLEMENTATION.md) - Command/Query separation
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) - Testing approach
