# TOTALFISC_MIGRATION_PLAN.md
# TotalFisc - Complete Migration & Development Plan

**Version:** 2.0  
**Last Updated:** February 6, 2026  
**Project:** TotalFisc (الشامل)  
**Strategy:** Desktop-First, Cloud-Ready Architecture  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase Overview](#phase-overview)
3. [Phase 1: MVP - Desktop Only](#phase-1-mvp---desktop-only)
4. [Phase 2: Cloud-Ready Preparation](#phase-2-cloud-ready-preparation)
5. [Phase 3: Cloud Sync (Future)](#phase-3-cloud-sync-future)
6. [Technical Architecture](#technical-architecture)
7. [Development Roadmap](#development-roadmap)

---

## Executive Summary

### The Strategy: "Build for Today, Prepare for Tomorrow"

**MVP Goal (Phase 1):** Ship a **fully functional desktop application** with ZERO cloud dependencies.

**Architecture Goal:** Build the MVP with a "cloud-ready" foundation so that adding cloud sync later is a **configuration change, not a rewrite**.

### Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT TIMELINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 1: MVP - Desktop Only                                │
│  Duration: 6 months                                          │
│  Goal: Ship working desktop app to 10 customers             │
│                                                              │
│  ├─ Month 1-2: Foundation (Database, API, Core Logic)      │
│  ├─ Month 3-4: UI Development (React, Forms, Reports)      │
│  ├─ Month 5: Testing & Polish                              │
│  └─ Month 6: Beta Launch (10 pilot customers)              │
│                                                              │
│  Phase 2: Cloud-Ready Preparation                           │
│  Duration: 3 months                                          │
│  Goal: Refactor for cloud without changing features         │
│                                                              │
│  ├─ Month 7-8: Add TenantId, Sync Infrastructure           │
│  └─ Month 9: Testing & Validation                          │
│                                                              │
│  Phase 3: Cloud Sync (Future Versions)                     │
│  Duration: 6 months                                          │
│  Goal: Enable multi-device sync                             │
│                                                              │
│  ├─ Month 10-12: Backend Sync Service                      │
│  ├─ Month 13-15: Client Sync Logic & Conflict Resolution   │
│  └─ Month 16: Cloud Beta Launch                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase Overview

### What Gets Built When

| Feature | Phase 1 (MVP) | Phase 2 (Prep) | Phase 3 (Cloud) |
|---------|---------------|----------------|-----------------|
| **Chart of Accounts** | ✅ Local only | ✅ Add TenantId | ✅ Sync enabled |
| **Journal Entries** | ✅ Local only | ✅ Add TenantId | ✅ Sync enabled |
| **Reports** | ✅ Local only | ✅ No changes | ✅ No changes |
| **Users** | ✅ Local auth | ✅ Add TenantId | ✅ Cloud auth |
| **Database** | ✅ SQLite | ✅ Add sync fields | ✅ + PostgreSQL |
| **Backup** | ✅ Local files | ✅ No changes | ✅ + Cloud backup |
| **Multi-Device** | ❌ Single device | ❌ Still single | ✅ Multiple devices |
| **Offline Mode** | ✅ Always offline | ✅ Still offline | ✅ Offline-first |

---

## Phase 1: MVP - Desktop Only

### Goal: Ship Working Desktop App (NO Cloud)

**Duration:** 6 months  
**Target:** 10 pilot customers  
**Revenue:** 0 DZD (beta testing)  

### What We Build

```
┌─────────────────────────────────────────────────────────────┐
│              MVP ARCHITECTURE (Desktop Only)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User's Computer (Windows 10/11)                            │
│  ┌────────────────────────────────────────────────┐         │
│  │  TotalFisc Desktop Application                 │         │
│  │                                                 │         │
│  │  ┌──────────────────────────────────────────┐ │         │
│  │  │  WPF Shell (Window Management)           │ │         │
│  │  │  - System tray                           │ │         │
│  │  │  - Window controls                       │ │         │
│  │  │  - Native notifications                  │ │         │
│  │  └──────────────────────────────────────────┘ │         │
│  │               │                                │         │
│  │               ▼                                │         │
│  │  ┌──────────────────────────────────────────┐ │         │
│  │  │  WebView2 (React UI)                     │ │         │
│  │  │  - All UI components                     │ │         │
│  │  │  - TanStack Router                       │ │         │
│  │  │  - TanStack Query (local API calls)      │ │         │
│  │  └──────────────────────────────────────────┘ │         │
│  │               │                                │         │
│  │               ▼ HTTP (localhost:5000)         │         │
│  │  ┌──────────────────────────────────────────┐ │         │
│  │  │  ASP.NET Core API (Kestrel)              │ │         │
│  │  │  - REST endpoints                        │ │         │
│  │  │  - Business logic                        │ │         │
│  │  │  - Validation                            │ │         │
│  │  └──────────────────────────────────────────┘ │         │
│  │               │                                │         │
│  │               ▼                                │         │
│  │  ┌──────────────────────────────────────────┐ │         │
│  │  │  SQLite Database (Encrypted)             │ │         │
│  │  │  - SQLCipher (AES-256)                   │ │         │
│  │  │  - Local file: totalfisc.db              │ │         │
│  │  │  - Location: %AppData%/TotalFisc/        │ │         │
│  │  └──────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  NO INTERNET REQUIRED ✅                                     │
│  NO CLOUD SERVICES ✅                                        │
│  100% OFFLINE ✅                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Month 1-2: Foundation

#### Week 1-2: Project Setup

**Create Solution Structure:**
```bash
TotalFisc/
├── src/
│   ├── TotalFisc.Domain/              # Pure business logic
│   │   ├── Aggregates/
│   │   │   ├── JournalEntryAggregate/
│   │   │   │   ├── JournalEntry.cs
│   │   │   │   └── JournalLine.cs
│   │   │   ├── AccountAggregate/
│   │   │   └── ThirdPartyAggregate/
│   │   ├── ValueObjects/
│   │   │   ├── Money.cs
│   │   │   ├── AccountNumber.cs
│   │   │   └── TaxId.cs
│   │   ├── Events/
│   │   └── Exceptions/
│   │
│   ├── TotalFisc.Application/         # Use cases, CQRS
│   │   ├── Commands/
│   │   │   ├── CreateJournalEntryCommand.cs
│   │   │   └── PostJournalEntryCommand.cs
│   │   ├── Queries/
│   │   │   ├── GetJournalEntryQuery.cs
│   │   │   └── GetTrialBalanceQuery.cs
│   │   ├── DTOs/
│   │   ├── Validators/
│   │   └── Interfaces/
│   │
│   ├── TotalFisc.Infrastructure/      # Data access
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Interceptors/
│   │   │   │   └── AuditableEntityInterceptor.cs
│   │   │   └── Configurations/
│   │   ├── Repositories/
│   │   ├── Migrations/
│   │   └── Services/
│   │
│   ├── TotalFisc.API/                 # Web API
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   │
│   ├── TotalFisc.Desktop/             # WPF Host
│   │   ├── MainWindow.xaml
│   │   ├── App.xaml
│   │   └── Services/
│   │
│   └── TotalFisc.UI/                  # React Frontend
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── routes/               # TanStack Router
│       │   └── App.tsx
│       ├── package.json
│       └── vite.config.ts
│
├── tests/
│   ├── TotalFisc.Domain.Tests/
│   ├── TotalFisc.Application.Tests/
│   ├── TotalFisc.API.Tests/
│   └── TotalFisc.E2E.Tests/          # Playwright
│
└── docs/
    └── (all your 30 documentation files)
```

**Initialize Projects:**
```bash
# Create solution
dotnet new sln -n TotalFisc

# Create projects
dotnet new classlib -n TotalFisc.Domain -f net9.0
dotnet new classlib -n TotalFisc.Application -f net9.0
dotnet new classlib -n TotalFisc.Infrastructure -f net9.0
dotnet new webapi -n TotalFisc.API -f net9.0
dotnet new wpf -n TotalFisc.Desktop -f net9.0-windows

# Add to solution
dotnet sln add src/**/*.csproj

# Frontend
cd src
npm create vite@latest TotalFisc.UI -- --template react-ts
```

#### Week 3-4: Core Domain Model

**BaseEntity (Phase 1 - MVP Version):**
```csharp
// TotalFisc.Domain/Common/BaseEntity.cs
public abstract class BaseEntity
{
    [Key]
    public Guid Id { get; set; }  // UUID v7

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModified { get; set; }

    public bool IsDeleted { get; set; }  // Soft delete

    [Timestamp]
    public byte[] RowVersion { get; set; }  // Concurrency

    // ⚠️ NOT YET: TenantId (will add in Phase 2)
    // public Guid? TenantId { get; set; }
}
```

**Money Value Object (Integer-based):**
```csharp
// TotalFisc.Domain/ValueObjects/Money.cs
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
```

**JournalEntry Aggregate:**
```csharp
// TotalFisc.Domain/Aggregates/JournalEntryAggregate/JournalEntry.cs
public class JournalEntry : BaseEntity, IAggregateRoot
{
    private readonly List<JournalLine> _lines = new();

    public int EntryNumber { get; private set; }
    public DateTime EntryDate { get; private set; }
    public string JournalCode { get; private set; }
    public string Reference { get; private set; }
    public string Description { get; private set; }
    public string FiscalYearId { get; private set; }
    public JournalEntryStatus Status { get; private set; }

    // Hash chain (Decree 09-110)
    public string ValidationHash { get; private set; }
    public string PreviousHash { get; private set; }

    public IReadOnlyCollection<JournalLine> Lines => _lines.AsReadOnly();

    // Factory method
    public static JournalEntry Create(/* params */)
    {
        var entry = new JournalEntry
        {
            Id = Guid.CreateVersion7(), // Time-sortable UUID
            // ... set properties
            Status = JournalEntryStatus.Draft
        };

        return entry;
    }

    // Business logic
    public void AddLine(string accountId, string label, Money debit, Money credit)
    {
        if (Status == JournalEntryStatus.Posted)
            throw new DomainException("Cannot modify posted entry");

        _lines.Add(JournalLine.Create(Id, accountId, label, debit, credit));
    }

    public bool IsBalanced()
    {
        var totalDebit = _lines.Sum(l => l.Debit.AmountInMillimes);
        var totalCredit = _lines.Sum(l => l.Credit.AmountInMillimes);
        return totalDebit == totalCredit;
    }

    public void Post(string previousHash)
    {
        if (!IsBalanced())
            throw new DomainException("Entry must be balanced");

        PreviousHash = previousHash;
        ValidationHash = CalculateHash();
        Status = JournalEntryStatus.Posted;
    }

    private string CalculateHash()
    {
        var data = $"{Id}|{EntryDate:O}|{JournalCode}|{Reference}|{PreviousHash}";
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hashBytes);
    }
}
```

#### Week 5-6: Database & EF Core

**DbContext:**
```csharp
// TotalFisc.Infrastructure/Data/ApplicationDbContext.cs
public class ApplicationDbContext : DbContext
{
    public DbSet<JournalEntry> JournalEntries { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<ThirdParty> ThirdParties { get; set; }
    public DbSet<FiscalYear> FiscalYears { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var dbPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "TotalFisc",
            "totalfisc.db"
        );

        // SQLCipher for encryption
        var connectionString = $"Data Source={dbPath};Password={GetEncryptionKey()}";
        optionsBuilder.UseSqlite(connectionString);

        // Add interceptor
        optionsBuilder.AddInterceptors(new AuditableEntityInterceptor());
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global query filter (hide soft-deleted)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
                var filter = Expression.Lambda(Expression.Not(property), parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }
        }
    }

    private string GetEncryptionKey()
    {
        // In MVP: Use machine-specific key
        // In Cloud: Use user-specific key
        return MachineKeyGenerator.GetOrCreate();
    }
}
```

**Money Storage (Integer millimes):**
```csharp
// TotalFisc.Infrastructure/Data/Configurations/JournalLineConfiguration.cs
public class JournalLineConfiguration : IEntityTypeConfiguration<JournalLine>
{
    public void Configure(EntityTypeBuilder<JournalLine> builder)
    {
        // Store Money as INTEGER (millimes)
        builder.Property(l => l.Debit)
            .HasConversion(
                v => v.AmountInMillimes,  // To database: long
                v => Money.FromMillimes(v) // From database: Money
            )
            .HasColumnType("INTEGER")
            .HasColumnName("DebitMillimes");

        builder.Property(l => l.Credit)
            .HasConversion(
                v => v.AmountInMillimes,
                v => Money.FromMillimes(v)
            )
            .HasColumnType("INTEGER")
            .HasColumnName("CreditMillimes");
    }
}
```

**Audit Interceptor:**
```csharp
// TotalFisc.Infrastructure/Data/Interceptors/AuditableEntityInterceptor.cs
public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateEntities(DbContext context)
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    // Generate UUID v7 if empty
                    if (entry.Entity.Id == Guid.Empty)
                        entry.Entity.Id = Guid.CreateVersion7();

                    entry.Entity.CreatedAt = now;
                    entry.Entity.LastModified = now;
                    break;

                case EntityState.Modified:
                    entry.Entity.LastModified = now;
                    break;

                case EntityState.Deleted:
                    // Convert hard delete to soft delete
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.LastModified = now;
                    break;
            }
        }
    }
}
```

#### Week 7-8: API Development

**Program.cs:**
```csharp
// TotalFisc.API/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<ApplicationDbContext>();
builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(CreateJournalEntryCommand).Assembly));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for WebView2
builder.Services.AddCors(options =>
{
    options.AddPolicy("WebView2Policy", policy =>
    {
        policy.WithOrigins("https://appassets.totalfisc")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("WebView2Policy");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Controller Example:**
```csharp
// TotalFisc.API/Controllers/JournalEntriesController.cs
[ApiController]
[Route("api/journal-entries")]
public class JournalEntriesController : ControllerBase
{
    private readonly IMediator _mediator;

    [HttpPost]
    public async Task<ActionResult<string>> Create(
        CreateJournalEntryCommand command)
    {
        var entryId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = entryId }, entryId);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JournalEntryDto>> GetById(Guid id)
    {
        var query = new GetJournalEntryQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
```

### Month 3-4: React Frontend

#### Week 9-10: Setup & Core Components

**Install Dependencies:**
```bash
cd src/TotalFisc.UI

# Core
npm install @tanstack/react-router @tanstack/react-query
npm install axios zustand

# UI
npm install @radix-ui/react-* tailwindcss
npx shadcn@latest init

# Internationalization
npm install i18next react-i18next

# Dev dependencies
npm install -D @types/node
```

**Router Setup (TanStack Router):**
```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})
```

```typescript
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/pages/Dashboard'

export const Route = createFileRoute('/')({
  component: Dashboard,
})
```

```typescript
// src/routes/journal-entries/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { JournalEntriesList } from '@/pages/JournalEntriesList'

export const Route = createFileRoute('/journal-entries/')({
  component: JournalEntriesList,
})
```

```typescript
// src/routes/journal-entries/$entryId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { JournalEntryDetail } from '@/pages/JournalEntryDetail'

export const Route = createFileRoute('/journal-entries/$entryId')({
  component: JournalEntryDetail,
})
```

**Main App:**
```typescript
// src/App.tsx
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen' // Auto-generated

const router = createRouter({ routeTree })
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
```

**API Client:**
```typescript
// src/services/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (add auth token when available)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**TanStack Query Hooks:**
```typescript
// src/services/api/journal-entries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export const useJournalEntries = () => {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/journal-entries')
      return data
    }
  })
}

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: CreateJournalEntryDto) => {
      const { data } = await apiClient.post('/api/journal-entries', entry)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    }
  })
}
```

#### Week 11-12: UI Components

**Journal Entry Form:**
```typescript
// src/pages/JournalEntryForm.tsx
import { useCreateJournalEntry } from '@/services/api/journal-entries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function JournalEntryForm() {
  const createEntry = useCreateJournalEntry()
  const [lines, setLines] = useState([
    { accountId: '', label: '', debit: 0, credit: 0 },
    { accountId: '', label: '', debit: 0, credit: 0 }
  ])

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0)
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const handleSubmit = () => {
    createEntry.mutate({
      entryDate: new Date(),
      journalCode: 'VTE',
      reference: 'FAC-001',
      description: 'Test entry',
      lines
    })
  }

  return (
    <div className="space-y-4">
      {/* Entry header */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Date" type="date" />
        <Input label="Journal" />
      </div>

      {/* Lines */}
      {lines.map((line, index) => (
        <div key={index} className="grid grid-cols-5 gap-2">
          <Input placeholder="Account" />
          <Input placeholder="Label" className="col-span-2" />
          <Input type="number" placeholder="Debit" />
          <Input type="number" placeholder="Credit" />
        </div>
      ))}

      {/* Balance indicator */}
      <div className={isBalanced ? 'bg-green-100' : 'bg-red-100'}>
        <span>Debit: {totalDebit}</span>
        <span>Credit: {totalCredit}</span>
        <span>{isBalanced ? '✅ Balanced' : '⚠️ Unbalanced'}</span>
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={!isBalanced}>
        Post Entry
      </Button>
    </div>
  )
}
```

### Month 5: Testing & Polish

#### Week 17-18: Unit & Integration Tests

```csharp
// TotalFisc.Domain.Tests/JournalEntryTests.cs
public class JournalEntryTests
{
    [Fact]
    public void Create_ShouldGenerateUuidV7()
    {
        var entry = JournalEntry.Create(/* params */);

        Assert.NotEqual(Guid.Empty, entry.Id);
        // UUID v7 has version bits set to 0111
        Assert.Equal(7, (entry.Id.ToByteArray()[7] & 0xF0) >> 4);
    }

    [Fact]
    public void Post_WhenUnbalanced_ShouldThrowException()
    {
        var entry = JournalEntry.Create(/* params */);
        entry.AddLine("acc1", "Test", Money.FromDZD(1000), Money.FromDZD(0));
        entry.AddLine("acc2", "Test", Money.FromDZD(0), Money.FromDZD(500));

        var ex = Assert.Throws<DomainException>(() => entry.Post("hash"));
        Assert.Equal("Entry must be balanced", ex.Message);
    }
}
```

#### Week 19-20: E2E Tests (Playwright)

```typescript
// TotalFisc.E2E.Tests/journal-entry.spec.ts
import { test, expect } from '@playwright/test'

test('create journal entry', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Navigate to journal entries
  await page.click('text=Journal Entries')
  await page.click('text=New Entry')

  // Fill form
  await page.fill('[name="reference"]', 'FAC-001')
  await page.fill('[name="description"]', 'Test sale')

  // Add lines
  await page.fill('[data-line="0"][data-field="debit"]', '1000')
  await page.fill('[data-line="1"][data-field="credit"]', '1000')

  // Should show balanced
  await expect(page.locator('text=✅ Balanced')).toBeVisible()

  // Submit
  await page.click('button:text("Post Entry")')

  // Should redirect to entry list
  await expect(page).toHaveURL(/\/journal-entries$/)
})
```

### Month 6: Beta Launch

#### Week 21-22: Installer (WiX)

```xml
<!-- TotalFisc.Desktop/Installer/Product.wxs -->
<Product Id="*" Name="TotalFisc" Version="1.0.0" Manufacturer="TotalFisc">
  <Package InstallerVersion="200" Compressed="yes" />

  <Directory Id="TARGETDIR" Name="SourceDir">
    <Directory Id="ProgramFilesFolder">
      <Directory Id="INSTALLFOLDER" Name="TotalFisc" />
    </Directory>
  </Directory>

  <ComponentGroup Id="ProductComponents">
    <Component Directory="INSTALLFOLDER">
      <File Source="TotalFisc.Desktop.exe" KeyPath="yes" />
      <File Source="TotalFisc.API.dll" />
      <!-- ... all DLLs -->
    </Component>
  </ComponentGroup>

  <Feature Id="ProductFeature" Title="TotalFisc" Level="1">
    <ComponentGroupRef Id="ProductComponents" />
  </Feature>
</Product>
```

#### Week 23-24: Pilot Deployment

**Deploy to 10 customers:**
1. Send installer (TotalFiscSetup.exe)
2. Schedule installation call
3. Provide 2-hour training
4. Collect feedback

---

## Phase 2: Cloud-Ready Preparation

### Goal: Refactor for Cloud (NO NEW FEATURES)

**Duration:** 3 months  
**Target:** Same 10 customers (no new users)  
**Revenue:** 0 DZD (still beta)  

### What Changes

```
Before (Phase 1):          After (Phase 2):
─────────────────         ─────────────────
public Guid Id;     →     public Guid Id;
                          public Guid TenantId;  ← NEW
public DateTimeOffset     public DateTimeOffset
  CreatedAt;                CreatedAt;
public DateTimeOffset     public DateTimeOffset
  LastModified;             LastModified;
                          public string SyncStatus;  ← NEW
public bool IsDeleted;    public bool IsDeleted;
```

### Month 7-8: Add TenantId

**Updated BaseEntity:**
```csharp
// Phase 2 version
public abstract class BaseEntity
{
    [Key]
    public Guid Id { get; set; }

    // NEW: Multi-tenancy support
    public Guid TenantId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastModified { get; set; }

    public bool IsDeleted { get; set; }

    // NEW: Sync support
    public SyncStatus SyncStatus { get; set; } = SyncStatus.Synced;
    public DateTimeOffset? LastSyncedAt { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; }
}

public enum SyncStatus
{
    Synced = 0,        // No changes
    Modified = 1,      // Local changes not synced
    Conflicted = 2     // Conflict detected
}
```

**Migration:**
```csharp
// Migration to add TenantId
public partial class AddTenantId : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add column with default value
        migrationBuilder.AddColumn<Guid>(
            name: "TenantId",
            table: "JournalEntries",
            nullable: false,
            defaultValue: Guid.Parse("00000000-0000-0000-0000-000000000001"));

        // Same for all tables...
    }
}
```

**Global Query Filter:**
```csharp
// Updated DbContext
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Tenant isolation (disabled in Phase 2, enabled in Phase 3)
    if (_enableTenantIsolation)
    {
        modelBuilder.Entity<BaseEntity>()
            .HasQueryFilter(e => e.TenantId == _currentTenant.Id);
    }
}
```

### Month 9: Testing

**Verify no regressions:**
1. Run all unit tests ✅
2. Run all integration tests ✅
3. Run all E2E tests ✅
4. Manual testing with pilot customers ✅

---

## Phase 3: Cloud Sync (Future)

### Goal: Enable Multi-Device Sync

**Duration:** 6 months  
**Target:** 100+ customers  
**Revenue:** 1M DZD/month  

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              CLOUD SYNC ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Desktop 1 (Algiers)                Desktop 2 (Oran)        │
│  ┌────────────────────┐             ┌────────────────────┐ │
│  │  SQLite (Local)    │             │  SQLite (Local)    │ │
│  └────────────────────┘             └────────────────────┘ │
│           │                                   │             │
│           ▼                                   ▼             │
│  ┌────────────────────┐             ┌────────────────────┐ │
│  │  Sync Service      │             │  Sync Service      │ │
│  │  (Background)      │             │  (Background)      │ │
│  └────────────────────┘             └────────────────────┘ │
│           │                                   │             │
│           └───────────────┬───────────────────┘             │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │      Cloud Sync Server (Azure)                  │       │
│  │  ┌──────────────────────────────────────────┐  │       │
│  │  │  ASP.NET Core Sync API                   │  │       │
│  │  │  - /api/sync/pull (get changes)          │  │       │
│  │  │  - /api/sync/push (send changes)         │  │       │
│  │  │  - /api/sync/conflicts (resolve)         │  │       │
│  │  └──────────────────────────────────────────┘  │       │
│  │               │                                 │       │
│  │               ▼                                 │       │
│  │  ┌──────────────────────────────────────────┐  │       │
│  │  │  PostgreSQL (Cloud Database)             │  │       │
│  │  │  - All tenant data                       │  │       │
│  │  │  - Sync metadata                         │  │       │
│  │  │  - Conflict logs                         │  │       │
│  │  └──────────────────────────────────────────┘  │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Sync Algorithm (Last Write Wins + Conflict Detection)

```csharp
// Desktop Sync Service
public class SyncService
{
    public async Task SyncAsync()
    {
        // 1. Pull changes from cloud
        var lastSyncTime = await GetLastSyncTimeAsync();
        var remoteChanges = await _api.GetChanges(lastSyncTime);

        // 2. Apply remote changes locally
        foreach (var change in remoteChanges)
        {
            var localEntity = await _db.FindAsync(change.Id);

            if (localEntity == null)
            {
                // New entity, just insert
                await _db.AddAsync(change.Entity);
            }
            else if (localEntity.SyncStatus == SyncStatus.Synced)
            {
                // No local changes, safe to update
                localEntity = change.Entity;
            }
            else
            {
                // CONFLICT! Both changed
                if (change.LastModified > localEntity.LastModified)
                {
                    // Remote wins (Last Write Wins)
                    localEntity = change.Entity;
                }
                else
                {
                    // Local wins, will push to cloud
                    localEntity.SyncStatus = SyncStatus.Conflicted;
                }
            }
        }

        await _db.SaveChangesAsync();

        // 3. Push local changes to cloud
        var localChanges = await _db.Set<BaseEntity>()
            .Where(e => e.SyncStatus == SyncStatus.Modified)
            .ToListAsync();

        await _api.PushChanges(localChanges);

        // 4. Mark as synced
        foreach (var entity in localChanges)
        {
            entity.SyncStatus = SyncStatus.Synced;
            entity.LastSyncedAt = DateTimeOffset.UtcNow;
        }

        await _db.SaveChangesAsync();
    }
}
```

### Conflict Resolution UI

```typescript
// src/pages/ConflictResolution.tsx
export function ConflictResolution() {
  const conflicts = useConflicts()

  return (
    <div>
      <h1>Sync Conflicts</h1>
      {conflicts.data?.map(conflict => (
        <div key={conflict.id} className="border p-4">
          <h3>Entry #{conflict.local.entryNumber}</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Local version */}
            <div className="border-l-4 border-blue-500">
              <h4>Your Version (This Device)</h4>
              <p>Amount: {conflict.local.totalDebit} DZD</p>
              <p>Modified: {conflict.local.lastModified}</p>
              <Button onClick={() => resolveConflict(conflict.id, 'local')}>
                Keep This Version
              </Button>
            </div>

            {/* Remote version */}
            <div className="border-l-4 border-green-500">
              <h4>Cloud Version (Other Device)</h4>
              <p>Amount: {conflict.remote.totalDebit} DZD</p>
              <p>Modified: {conflict.remote.lastModified}</p>
              <Button onClick={() => resolveConflict(conflict.id, 'remote')}>
                Use Cloud Version
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Technical Architecture

### TanStack Router Benefits

**Why TanStack Router is Better:**

1. **Type Safety** ⭐⭐⭐⭐⭐
   ```typescript
   // Auto-generated types for routes and params
   const { entryId } = Route.useParams() // Fully typed!
   ```

2. **Code Splitting Built-in**
   ```typescript
   // Automatic lazy loading
   export const Route = createFileRoute('/reports')({
     component: () => import('./ReportPage').then(m => m.ReportPage)
   })
   ```

3. **Data Loading**
   ```typescript
   export const Route = createFileRoute('/journal-entries/$entryId')({
     loader: async ({ params }) => {
       return await fetchEntry(params.entryId)
     },
     component: EntryDetail
   })
   ```

4. **Search Params Validation**
   ```typescript
   const searchSchema = z.object({
     page: z.number().default(1),
     filter: z.enum(['draft', 'posted']).optional()
   })

   export const Route = createFileRoute('/journal-entries')({
     validateSearch: searchSchema
   })
   ```

### Money Storage (Integer Millimes)

**Database Schema:**
```sql
CREATE TABLE JournalLines (
    Id TEXT PRIMARY KEY,
    EntryId TEXT NOT NULL,
    AccountId TEXT NOT NULL,
    Label TEXT NOT NULL,
    DebitMillimes INTEGER NOT NULL,   -- Store as INTEGER
    CreditMillimes INTEGER NOT NULL,  -- Perfect precision
    FOREIGN KEY (EntryId) REFERENCES JournalEntries(Id)
);

-- Queries work perfectly
SELECT 
    SUM(DebitMillimes) / 1000.0 AS TotalDebit,
    SUM(CreditMillimes) / 1000.0 AS TotalCredit
FROM JournalLines
WHERE EntryId = 'xxx';
```

---

## Development Roadmap

### Sprint Schedule (6-month MVP)

```
Month 1:
├─ Sprint 1 (Week 1-2): Project setup, BaseEntity, Domain model
└─ Sprint 2 (Week 3-4): EF Core, Migrations, Interceptors

Month 2:
├─ Sprint 3 (Week 5-6): API Controllers, CQRS handlers
└─ Sprint 4 (Week 7-8): Authentication, Authorization

Month 3:
├─ Sprint 5 (Week 9-10): React setup, TanStack Router, UI components
└─ Sprint 6 (Week 11-12): Journal entry forms, Account management

Month 4:
├─ Sprint 7 (Week 13-14): Reports (Trial Balance, General Ledger)
└─ Sprint 8 (Week 15-16): Financial statements (Balance Sheet, Income Statement)

Month 5:
├─ Sprint 9 (Week 17-18): Unit tests, Integration tests
└─ Sprint 10 (Week 19-20): E2E tests (Playwright), Bug fixes

Month 6:
├─ Sprint 11 (Week 21-22): WPF Desktop, Installer, Deployment
└─ Sprint 12 (Week 23-24): Beta launch, Training, Feedback
```

---

## Conclusion

This migration plan provides:

✅ **Clear Phases:** Desktop-only MVP → Cloud-ready prep → Cloud sync  
✅ **Realistic Timeline:** 6 months to MVP, 15 months to cloud  
✅ **Technical Excellence:** UUID v7, soft deletes, integer money storage  
✅ **Future-Proof:** TenantId and sync fields ready but not active  
✅ **Practical:** Build what users need NOW, prepare for LATER  

**Start with Phase 1. Ship the MVP. Validate the market. Then scale.**

---

**Related Documents:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture details
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Complete schema
- [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) - Business timeline
- [CODE_EXAMPLES.md](CODE_EXAMPLES.md) - Implementation examples
