# DOMAIN_DRIVEN_DESIGN.md
# TOTALFISC - Domain-Driven Design

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Architecture Pattern:** Domain-Driven Design (DDD)  

---

## Table of Contents

1. [DDD Overview](#ddd-overview)
2. [Bounded Contexts](#bounded-contexts)
3. [Domain Model](#domain-model)
4. [Entities vs Value Objects](#entities-vs-value-objects)
5. [Aggregates](#aggregates)
6. [Domain Events](#domain-events)
7. [Repository Pattern](#repository-pattern)
8. [Domain Services](#domain-services)
9. [Ubiquitous Language](#ubiquitous-language)

---

## DDD Overview

### What is Domain-Driven Design?

**Domain-Driven Design (DDD)** is a software development approach that focuses on modeling the **business domain** and its logic, rather than focusing on technical concerns.

### Core Principles

1. **Focus on Domain** - Business logic is the heart of the application
2. **Ubiquitous Language** - Common vocabulary between developers and domain experts
3. **Bounded Contexts** - Clear boundaries between different parts of the system
4. **Rich Domain Model** - Business rules encapsulated in domain objects
5. **Persistence Ignorance** - Domain model independent of database

### Benefits for TOTALFISC

| Benefit | Impact |
|---------|--------|
| **Clear Business Logic** | Accounting rules encapsulated in domain |
| **Maintainability** | Changes isolated to specific contexts |
| **Testability** | Domain logic testable without infrastructure |
| **Collaboration** | Shared language with accountants |
| **Scalability** | Easy to add new features |

---

## Bounded Contexts

### Context Map

```
┌─────────────────────────────────────────────────────────────┐
│              TOTALFISC BOUNDED CONTEXTS               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │  Accounting     │───────►│  Reporting      │            │
│  │  Context        │        │  Context        │            │
│  └─────────────────┘        └─────────────────┘            │
│         │                            │                      │
│         │                            │                      │
│         ▼                            ▼                      │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │  Fiscal Year    │        │  Tax            │            │
│  │  Context        │        │  Context        │            │
│  └─────────────────┘        └─────────────────┘            │
│         │                                                   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │  Identity &     │◄───────│  Licensing      │            │
│  │  Access         │        │  Context        │            │
│  └─────────────────┘        └─────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1. Accounting Context (Core Domain)

**Responsibility:** Manage journal entries, accounts, and transactions

**Key Concepts:**
- `JournalEntry` - A complete accounting transaction
- `JournalLine` - Individual debit/credit line
- `Account` - Chart of accounts element
- `ThirdParty` - Client, supplier, employee
- `FiscalYear` - Accounting period

**Ubiquitous Language:**
- **Écriture** (Entry) - Journal entry
- **Débit** (Debit) - Debit amount
- **Crédit** (Credit) - Credit amount
- **Compte** (Account) - Account number
- **Auxiliaire** (Auxiliary) - Third party sub-account
- **Valider** (Post) - Make entry immutable

---

### 2. Reporting Context

**Responsibility:** Generate financial reports and statements

**Key Concepts:**
- `GeneralLedger` - Complete transaction history
- `TrialBalance` - Account balance summary
- `BalanceSheet` - Bilan (Assets/Liabilities)
- `IncomeStatement` - Compte de résultat (P&L)
- `CashFlowStatement` - Tableau de flux de trésorerie

**Dependency:** Reads from Accounting Context (read-only)

---

### 3. Fiscal Year Context

**Responsibility:** Manage fiscal periods and year-end closing

**Key Concepts:**
- `FiscalYear` - Accounting year (01/01 - 31/12)
- `FiscalPeriod` - Month within year
- `YearEndClosing` - Close expenses/revenue accounts
- `OpeningBalance` - Starting balances for new year

**Business Rules:**
- Cannot post entries to closed fiscal year
- Fiscal year must be locked before closing
- Closing creates contra-entries for Class 6/7

---

### 4. Tax Context

**Responsibility:** Calculate and manage Algerian taxes

**Key Concepts:**
- `TVA` (VAT) - Tax on goods/services (19%, 9%, 0%)
- `TAP` - Professional activity tax (2%)
- `IBS` - Corporate income tax (progressive rates)
- `IRG` - Individual income tax (payroll)
- `TaxDeclaration` - G50, Série G forms

**Dependency:** Reads from Accounting Context

---

### 5. Identity & Access Context

**Responsibility:** Authentication, authorization, user management

**Key Concepts:**
- `User` - System user
- `Role` - Administrator, Accountant, Viewer, Auditor
- `Permission` - Granular access control
- `Session` - JWT token-based session

---

### 6. Licensing Context

**Responsibility:** License validation and enforcement

**Key Concepts:**
- `License` - Software license
- `HardwareId` - Computer fingerprint
- `LicenseTier` - Starter, Professional, Enterprise
- `LicenseValidation` - Verify license integrity

---

## Domain Model

### Accounting Context Model

```
┌────────────────────────────────────────────────────────────┐
│                    ACCOUNTING AGGREGATE                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────┐                  │
│  │  JournalEntry (Aggregate Root)      │                  │
│  │  ─────────────────────────────────  │                  │
│  │  - EntryId                          │                  │
│  │  - EntryNumber                      │                  │
│  │  - EntryDate                        │                  │
│  │  - Status (Draft/Posted)            │                  │
│  │  - TotalDebit                       │                  │
│  │  - TotalCredit                      │                  │
│  │  ─────────────────────────────────  │                  │
│  │  + AddLine()                        │                  │
│  │  + Post()                           │                  │
│  │  + Void()                           │                  │
│  │  + ValidateBalance()                │                  │
│  └──────────────┬──────────────────────┘                  │
│                 │ 1                                        │
│                 │                                          │
│                 │ *                                        │
│  ┌──────────────▼──────────────────────┐                  │
│  │  JournalLine (Entity)               │                  │
│  │  ─────────────────────────────────  │                  │
│  │  - LineId                           │                  │
│  │  - LineNumber                       │                  │
│  │  - AccountId                        │                  │
│  │  - ThirdPartyId (optional)          │                  │
│  │  - Label                            │                  │
│  │  - Debit                            │                  │
│  │  - Credit                           │                  │
│  └─────────────────────────────────────┘                  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Entities vs Value Objects

### Entity

**Definition:** An object with a **unique identity** that persists over time

**Characteristics:**
- Has an ID (primary key)
- Mutable (can change properties)
- Compared by ID, not properties
- Tracked by database

**Examples in TOTALFISC:**

```csharp
public class JournalEntry : Entity
{
    public string EntryId { get; private set; } // Unique ID
    public int EntryNumber { get; private set; }
    public DateTime EntryDate { get; private set; }
    public EntryStatus Status { get; private set; }

    // Even if all properties are same, different EntryId = different entity

    public override bool Equals(object obj)
    {
        if (obj is not JournalEntry other) return false;
        return EntryId == other.EntryId; // Compare by ID only
    }
}
```

**Other Entities:**
- `Account`
- `ThirdParty`
- `User`
- `FiscalYear`

---

### Value Object

**Definition:** An object with **no identity**, defined only by its properties

**Characteristics:**
- No ID
- Immutable (cannot change after creation)
- Compared by value, not identity
- Can be shared

**Examples in TOTALFISC:**

```csharp
public class Money : ValueObject
{
    public decimal Amount { get; }
    public Currency Currency { get; }

    public Money(decimal amount, Currency currency)
    {
        if (amount < 0)
            throw new ArgumentException("Amount cannot be negative");

        Amount = amount;
        Currency = currency;
    }

    // Immutable: no setters, only constructor

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    // Two Money objects with same amount/currency are equal
    // var money1 = new Money(100, Currency.DZD);
    // var money2 = new Money(100, Currency.DZD);
    // money1 == money2 → TRUE
}
```

**Other Value Objects:**
```csharp
public class AccountNumber : ValueObject
{
    public string Value { get; }

    public AccountNumber(string value)
    {
        if (!IsValid(value))
            throw new ArgumentException("Invalid account number");

        Value = value;
    }

    private bool IsValid(string value)
    {
        // SCF: 1-5 digits, starts with 1-7
        return !string.IsNullOrEmpty(value) &&
               value.Length >= 1 && value.Length <= 5 &&
               value[0] >= '1' && value[0] <= '7';
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}

public class TaxIdentifier : ValueObject
{
    public string NIF { get; }
    public string NIS { get; }
    public string RC { get; }

    public TaxIdentifier(string nif, string nis, string rc)
    {
        // Validation logic
        NIF = nif;
        NIS = nis;
        RC = rc;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return NIF;
        yield return NIS;
        yield return RC;
    }
}
```

---

## Aggregates

### What is an Aggregate?

**Aggregate** = A cluster of entities and value objects treated as a single unit, with one **Aggregate Root**

### Aggregate Rules

1. **One Entry Point** - All access through aggregate root
2. **Consistency Boundary** - All business rules enforced within aggregate
3. **Transactional Boundary** - Save/load entire aggregate atomically
4. **Reference by ID** - External objects reference aggregate by ID, not object

### JournalEntry Aggregate

```csharp
public class JournalEntry : AggregateRoot
{
    // Aggregate Root
    private readonly List<JournalLine> _lines = new();

    public string EntryId { get; private set; }
    public int EntryNumber { get; private set; }
    public DateTime EntryDate { get; private set; }
    public EntryStatus Status { get; private set; }
    public IReadOnlyList<JournalLine> Lines => _lines.AsReadOnly();

    // Enforce business rules through aggregate root
    public void AddLine(JournalLine line)
    {
        // Business Rule: Cannot modify posted entries
        if (Status == EntryStatus.Posted)
            throw new InvalidOperationException("Cannot modify posted entry");

        // Business Rule: Each line must have debit XOR credit
        if (line.Debit > 0 && line.Credit > 0)
            throw new InvalidOperationException("Line cannot have both debit and credit");

        // Business Rule: Auxiliary account required for 411/401
        if (RequiresAuxiliary(line.AccountId) && line.ThirdPartyId == null)
            throw new InvalidOperationException("Auxiliary account required");

        _lines.Add(line);
    }

    public Result Post()
    {
        // Business Rule: Entry must be balanced
        if (!IsBalanced())
            return Result.Failure("Entry is not balanced");

        // Business Rule: Entry must have at least 2 lines
        if (_lines.Count < 2)
            return Result.Failure("Entry must have at least 2 lines");

        // Business Rule: Cannot post already posted entry
        if (Status == EntryStatus.Posted)
            return Result.Failure("Entry already posted");

        // Change state
        Status = EntryStatus.Posted;
        PostedAt = DateTime.UtcNow;

        // Raise domain event
        AddDomainEvent(new JournalEntryPosted(EntryId));

        return Result.Success();
    }

    private bool IsBalanced()
    {
        var totalDebit = _lines.Sum(l => l.Debit);
        var totalCredit = _lines.Sum(l => l.Credit);
        return Math.Abs(totalDebit - totalCredit) < 0.01m;
    }

    // Aggregate invariants enforced here
}
```

**Key Points:**
- ✅ All access to `JournalLine` goes through `JournalEntry`
- ✅ Business rules enforced in `JournalEntry` methods
- ✅ Transaction boundary: save entire entry + lines together
- ✅ Consistency: entry is always in valid state

---

## Domain Events

### What are Domain Events?

**Domain Event** = Something significant that happened in the domain

**Purpose:**
- Decouple aggregates
- Trigger side effects
- Audit trail
- Integration with other contexts

### Example Domain Events

```csharp
public abstract class DomainEvent
{
    public string EventId { get; } = Guid.NewGuid().ToString();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}

public class JournalEntryPosted : DomainEvent
{
    public string EntryId { get; }
    public int EntryNumber { get; }
    public decimal TotalDebit { get; }

    public JournalEntryPosted(string entryId, int entryNumber, decimal totalDebit)
    {
        EntryId = entryId;
        EntryNumber = entryNumber;
        TotalDebit = totalDebit;
    }
}

public class FiscalYearClosed : DomainEvent
{
    public string FiscalYearId { get; }
    public int YearNumber { get; }
    public DateTime ClosedAt { get; }

    public FiscalYearClosed(string fiscalYearId, int yearNumber, DateTime closedAt)
    {
        FiscalYearId = fiscalYearId;
        YearNumber = yearNumber;
        ClosedAt = closedAt;
    }
}

public class ThirdPartyCreated : DomainEvent
{
    public string ThirdPartyId { get; }
    public string Code { get; }
    public string Name { get; }

    public ThirdPartyCreated(string thirdPartyId, string code, string name)
    {
        ThirdPartyId = thirdPartyId;
        Code = code;
        Name = name;
    }
}
```

### Domain Event Handling

```csharp
public interface IDomainEventHandler<TEvent> where TEvent : DomainEvent
{
    Task Handle(TEvent domainEvent);
}

public class JournalEntryPostedHandler : IDomainEventHandler<JournalEntryPosted>
{
    private readonly IAuditService _auditService;
    private readonly INotificationService _notificationService;

    public async Task Handle(JournalEntryPosted domainEvent)
    {
        // 1. Log to audit trail
        await _auditService.LogAsync(
            "JournalEntry.Posted",
            domainEvent.EntryId,
            $"Entry #{domainEvent.EntryNumber} posted with total {domainEvent.TotalDebit:N2}"
        );

        // 2. Update account balances (materialized view)
        await _balanceService.UpdateBalancesAsync(domainEvent.EntryId);

        // 3. Notify subscribers (future: real-time notifications)
        await _notificationService.NotifyAsync(
            $"Journal entry #{domainEvent.EntryNumber} has been posted"
        );
    }
}
```

### Aggregate Event Publishing

```csharp
public abstract class AggregateRoot : Entity
{
    private readonly List<DomainEvent> _domainEvents = new();

    public IReadOnlyList<DomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(DomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}

// In repository after saving
public async Task SaveAsync(JournalEntry entry)
{
    // 1. Save to database
    await _dbContext.JournalEntries.AddAsync(entry);
    await _dbContext.SaveChangesAsync();

    // 2. Dispatch domain events
    foreach (var domainEvent in entry.DomainEvents)
    {
        await _mediator.Publish(domainEvent);
    }

    // 3. Clear events
    entry.ClearDomainEvents();
}
```

---

## Repository Pattern

### What is a Repository?

**Repository** = A collection-like interface for accessing aggregates

**Purpose:**
- Abstract database access
- Provide domain-centric API
- Enable testability (mock repositories)

### Repository Interface

```csharp
public interface IRepository<TAggregate> where TAggregate : AggregateRoot
{
    Task<TAggregate?> GetByIdAsync(string id);
    Task<IEnumerable<TAggregate>> GetAllAsync();
    Task AddAsync(TAggregate aggregate);
    Task UpdateAsync(TAggregate aggregate);
    Task DeleteAsync(string id);
}

public interface IJournalEntryRepository : IRepository<JournalEntry>
{
    // Domain-specific queries
    Task<IEnumerable<JournalEntry>> GetByFiscalYearAsync(string fiscalYearId);
    Task<IEnumerable<JournalEntry>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<JournalEntry>> GetByStatusAsync(EntryStatus status);
    Task<int> GetNextEntryNumberAsync(string fiscalYearId);
}
```

### Repository Implementation

```csharp
public class JournalEntryRepository : IJournalEntryRepository
{
    private readonly ApplicationDbContext _context;

    public async Task<JournalEntry?> GetByIdAsync(string id)
    {
        return await _context.JournalEntries
            .Include(e => e.Lines)
                .ThenInclude(l => l.Account)
            .Include(e => e.Lines)
                .ThenInclude(l => l.ThirdParty)
            .FirstOrDefaultAsync(e => e.EntryId == id);
    }

    public async Task AddAsync(JournalEntry entry)
    {
        await _context.JournalEntries.AddAsync(entry);
        await _context.SaveChangesAsync();

        // Dispatch domain events
        foreach (var domainEvent in entry.DomainEvents)
        {
            await _mediator.Publish(domainEvent);
        }

        entry.ClearDomainEvents();
    }

    public async Task<int> GetNextEntryNumberAsync(string fiscalYearId)
    {
        var maxNumber = await _context.JournalEntries
            .Where(e => e.FiscalYearId == fiscalYearId)
            .MaxAsync(e => (int?)e.EntryNumber) ?? 0;

        return maxNumber + 1;
    }
}
```

---

## Domain Services

### What is a Domain Service?

**Domain Service** = Business logic that doesn't naturally fit in an entity or value object

**Use When:**
- Operation involves multiple aggregates
- Stateless operation (no data stored)
- Complex calculation or algorithm

### Example Domain Services

```csharp
public interface IFiscalYearClosingService
{
    Task<JournalEntry> CloseFiscalYearAsync(string fiscalYearId);
}

public class FiscalYearClosingService : IFiscalYearClosingService
{
    private readonly IFiscalYearRepository _fiscalYearRepository;
    private readonly IJournalEntryRepository _journalEntryRepository;
    private readonly IAccountRepository _accountRepository;

    public async Task<JournalEntry> CloseFiscalYearAsync(string fiscalYearId)
    {
        // 1. Get fiscal year
        var fiscalYear = await _fiscalYearRepository.GetByIdAsync(fiscalYearId);
        if (fiscalYear == null)
            throw new NotFoundException("Fiscal year not found");

        // 2. Calculate balances for Class 6 & 7
        var expenseAccounts = await _accountRepository.GetByClassAsync(6);
        var revenueAccounts = await _accountRepository.GetByClassAsync(7);

        // 3. Create closing entry
        var closingEntry = new JournalEntry
        {
            EntryDate = fiscalYear.EndDate,
            JournalCode = "OD",
            Description = $"Clôture exercice {fiscalYear.YearNumber}"
        };

        // 4. Close expense accounts
        foreach (var account in expenseAccounts)
        {
            var balance = await GetAccountBalanceAsync(account.AccountId, fiscalYearId);
            if (balance != 0)
            {
                closingEntry.AddLine(new JournalLine
                {
                    AccountId = "130", // Résultat
                    Debit = balance,
                    Credit = 0
                });

                closingEntry.AddLine(new JournalLine
                {
                    AccountId = account.AccountId,
                    Debit = 0,
                    Credit = balance
                });
            }
        }

        // 5. Close revenue accounts (similar logic)
        // ...

        // 6. Save and return
        await _journalEntryRepository.AddAsync(closingEntry);

        return closingEntry;
    }
}
```

---

## Ubiquitous Language

### Accounting Terms (French/English)

| French (SCF) | English | Description |
|--------------|---------|-------------|
| **Écriture comptable** | Journal Entry | A complete transaction |
| **Débit** | Debit | Left side (assets, expenses) |
| **Crédit** | Credit | Right side (liabilities, revenue) |
| **Compte** | Account | Chart of accounts element |
| **Compte auxiliaire** | Auxiliary Account | Sub-account for 411/401 |
| **Journal** | Journal | VTE (Sales), ACH (Purchases), etc. |
| **Grand livre** | General Ledger | All transactions by account |
| **Balance** | Trial Balance | Account balance summary |
| **Bilan** | Balance Sheet | Assets & Liabilities |
| **Compte de résultat** | Income Statement | Profit & Loss |
| **Exercice comptable** | Fiscal Year | Accounting period |
| **Clôture** | Closing | Year-end close |
| **Validation** | Posting | Make entry immutable |
| **Contre-passation** | Reversal | Correct posted entry |

### Usage in Code

```csharp
// Good: Uses ubiquitous language
public class JournalEntry
{
    public void Valider() { /* Post entry */ }
    public void ContrePassation() { /* Reversal */ }
}

// Bad: Technical language
public class Transaction
{
    public void SetStatusToFinal() { /* ??? */ }
}
```

---

## Conclusion

Domain-Driven Design in TOTALFISC provides:

✅ **Rich Domain Model** - Business rules encapsulated in entities  
✅ **Clear Boundaries** - Bounded contexts separate concerns  
✅ **Aggregate Consistency** - Data integrity enforced  
✅ **Domain Events** - Loosely coupled side effects  
✅ **Testable** - Domain logic testable without infrastructure  
✅ **Ubiquitous Language** - Shared vocabulary with accountants  

This DDD implementation ensures the software accurately reflects the accounting domain, making it maintainable and extensible as requirements evolve.

---

**Related Documents:**
- [CQRS_IMPLEMENTATION.md](CQRS_IMPLEMENTATION.md) - Command/Query separation
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Data persistence
- [SCF_COMPLIANCE.md](SCF_COMPLIANCE.md) - Accounting business rules
