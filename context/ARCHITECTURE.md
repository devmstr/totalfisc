# ARCHITECTURE.md
# TOTALFISC - System Architecture

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Target Market:** Algeria (SCF Compliance / LF 2026)  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architectural Vision](#architectural-vision)
3. [The Hybrid Desktop Architecture](#the-hybrid-desktop-architecture)
4. [Technology Stack](#technology-stack)
5. [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
6. [Communication Patterns](#communication-patterns)
7. [Design Patterns & Principles](#design-patterns--principles)
8. [Data Flow](#data-flow)
9. [Security Architecture](#security-architecture)
10. [Deployment Architecture](#deployment-architecture)

---

## Executive Summary

TOTALFISC is a **hybrid desktop accounting system** specifically designed for the Algerian market. It combines the reliability of native desktop applications with the modern development experience of web technologies.

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Hybrid Architecture** | WPF provides hardware access; React provides modern UI; ASP.NET Core provides robust business logic |
| **Clean Architecture** | Enables maintainability, testability, and independence from frameworks |
| **CQRS Pattern** | Separates read/write operations for performance and scalability |
| **Domain-Driven Design** | Models complex accounting domain with rich business logic |
| **SQLite Database** | Zero-configuration, single-user, file-based database ideal for desktop apps |
| **Offline-First** | No internet dependency for core operations (critical for Algerian market) |

---

## Architectural Vision

### The Problem We're Solving

Traditional Algerian accounting software (like PCCOMPTA) suffers from:
- **File-based databases** (Paradox) prone to corruption
- **Lack of data integrity** (files can be manually edited)
- **Poor security** (no encryption, weak audit trails)
- **Outdated UI/UX** (DOS-era interfaces)
- **No regulatory compliance** (Decree 09-110 non-compliant)
- **Limited hardware integration** (poor barcode/printer support)

### Our Solution

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOTALFISC VISION                       │
│                                                                  │
│  ✓ Native Desktop Performance + Modern Web UI                   │
│  ✓ Enterprise-Grade Security (Encryption + Hash Chain)          │
│  ✓ Full Regulatory Compliance (SCF + Decree 09-110)            │
│  ✓ Seamless Hardware Integration (Barcode + Thermal Printers)   │
│  ✓ Offline-First Architecture (No Internet Required)            │
│  ✓ Clean, Maintainable Codebase (Clean Architecture + DDD)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Hybrid Desktop Architecture

### Three-Layer Architecture

The application runs as a **single Windows process** (`TOTALFISC.exe`) with three logical layers:

```
┌────────────────────────────────────────────────────────────────────┐
│                    TOTALFISC PROCESS                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  LAYER 1: WPF HOST (.NET 9)                                  │ │
│  │  • Native Windows Container                                   │ │
│  │  • WebView2 Control (Edge Chromium)                          │ │
│  │  • Hardware Integration (WndProc hooks)                       │ │
│  │  • System Tray Management                                     │ │
│  └────────────────┬─────────────────────────────────────────────┘ │
│                   │ Hosts                                          │
│  ┌────────────────▼─────────────────────────────────────────────┐ │
│  │  LAYER 2: ASP.NET CORE API (Kestrel Sidecar)                │ │
│  │  • Self-hosted on http://localhost:{random_port}             │ │
│  │  • RESTful API Controllers                                    │ │
│  │  • SignalR Hubs (Real-time)                                  │ │
│  │  • Business Logic & Validation                               │ │
│  └────────────────┬─────────────────────────────────────────────┘ │
│                   │ Serves                                         │
│  ┌────────────────▼─────────────────────────────────────────────┐ │
│  │  LAYER 3: REACT 19 FRONTEND                                  │ │
│  │  • Rendered in WebView2                                       │ │
│  │  • TanStack Table (Virtualized Grids)                        │ │
│  │  • Zustand (State Management)                                │ │
│  │  • shadcn/ui + Tailwind CSS                                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

| Component | Alternative Considered | Why We Chose This |
|-----------|----------------------|-------------------|
| **WPF Host** | Electron, Tauri | Native Windows APIs, WndProc access for hardware, better performance |
| **ASP.NET Core Sidecar** | Direct WPF→React bridge | Separation of concerns, testable business logic, future API reuse |
| **React Frontend** | Blazor, WPF XAML | Modern component ecosystem, developer productivity, rich UI libraries |
| **WebView2** | CEF (Chromium Embedded) | Official Microsoft support, automatic updates, smaller footprint |

---

## Technology Stack

### Backend Stack

```yaml
Framework: .NET 9.0
Language: C# 13
Architecture: Clean Architecture + Domain-Driven Design
Patterns: CQRS, Repository, Unit of Work, Specification

Core Libraries:
  - Microsoft.EntityFrameworkCore: 9.0.0
  - Microsoft.EntityFrameworkCore.Sqlite: 9.0.0
  - MediatR: 12.4.1
  - FluentValidation: 11.10.0
  - AutoMapper: 13.0.1
  - Dapper: 2.1.35 (for read-heavy queries)

Security:
  - BCrypt.Net-Next: 4.0.3 (password hashing)
  - System.IdentityModel.Tokens.Jwt: 8.2.1
  - SQLCipher (database encryption)

Hardware:
  - Microsoft.Web.WebView2: 1.0.2792.45
  - System.Management: 9.0.0 (WMI for hardware ID)
  - System.IO.Ports: 9.0.0 (thermal printer)

Utilities:
  - ClosedXML: 0.104.1 (Excel export)
  - NLog: 5.3.4 (logging)
```

### Frontend Stack

```yaml
Framework: React 19
Language: TypeScript 5.7
Build Tool: Vite 6.0
Styling: Tailwind CSS 4.0

Core Libraries:
  - react: 19.0.0
  - react-router-dom: 7.1.0
  - @tanstack/react-table: 8.20.5
  - @tanstack/react-virtual: 3.10.8
  - @tanstack/react-query: 5.62.3
  - zustand: 5.0.2

UI Components:
  - shadcn/ui (Radix UI primitives)
  - lucide-react: 0.468.0 (icons)
  - tailwindcss: 4.0.0

Real-time:
  - @microsoft/signalr: 9.0.0

Forms & Validation:
  - react-hook-form: 7.54.2
  - zod: 3.24.1
  - @hookform/resolvers: 3.9.1
```

### Database

```yaml
Engine: SQLite 3.x
ORM: Entity Framework Core 9.0
Encryption: SQLCipher
Migrations: EF Core Migrations
Seed Data: JSON files → EF Core seeder
```

---

## Layer-by-Layer Breakdown

### 1. Presentation Layer

#### WPF Host (Desktop Container)

**Purpose:** Native Windows application shell

**Responsibilities:**
- Launch and host Kestrel API server in background thread
- Embed WebView2 control for React UI
- Intercept hardware events (barcode scanners via WndProc)
- Manage system tray icon and window state
- Node-locked license validation

**Key Files:**
```
TotalFisc.Desktop/
├── App.xaml.cs                    # Application entry point
├── MainWindow.xaml.cs             # Main window with WebView2
├── Services/
│   ├── ApiHostingService.cs       # Kestrel hosting
│   └── HardwareService.cs         # USB/Printer integration
└── Hardware/
    ├── BarcodeScanner/
    └── ThermalPrinter/
```

#### ASP.NET Core API (Backend)

**Purpose:** Business logic and data access layer

**Responsibilities:**
- RESTful API endpoints (CRUD operations)
- SignalR hubs for real-time events
- JWT authentication and authorization
- Input validation (FluentValidation)
- Business rule enforcement
- Database transactions

**Key Files:**
```
TOTALFISC.Api/
├── Program.cs                     # Startup configuration
├── Controllers/                   # API endpoints
├── Hubs/                         # SignalR hubs
├── Middleware/                   # Custom middleware
└── Filters/                      # Action filters
```

#### React Frontend (UI)

**Purpose:** User interface and user experience

**Responsibilities:**
- Display data in virtualized grids (10,000+ rows)
- Handle user input and validation
- Manage client-side state (Zustand)
- Keyboard navigation (Excel-like)
- Real-time updates via SignalR
- Responsive layout

**Key Files:**
```
TotalFisc.UI/
├── src/
│   ├── features/                 # Feature modules
│   │   ├── accounting/
│   │   ├── chart-of-accounts/
│   │   └── reports/
│   ├── components/               # Reusable components
│   ├── api/                      # API client
│   └── stores/                   # Zustand stores
```

---

### 2. Application Layer (CQRS)

**Purpose:** Use case orchestration

**Pattern:** Command Query Responsibility Segregation (CQRS) with MediatR

```
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │  WRITE SIDE         │  │  READ SIDE              │  │
│  │  (Commands)         │  │  (Queries)              │  │
│  ├─────────────────────┤  ├─────────────────────────┤  │
│  │ • CreateJournalEntry│  │ • GetJournalEntryList   │  │
│  │ • PostJournalEntry  │  │ • GetGeneralLedger      │  │
│  │ • VoidJournalEntry  │  │ • GetTrialBalance       │  │
│  │                     │  │ • GetAccountStatement   │  │
│  └──────┬──────────────┘  └──────┬──────────────────┘  │
│         │ Validation            │ Lightweight DTOs     │
│         │ Transaction           │ Dapper (no tracking) │
│         │ Domain Events         │ Optimized SQL        │
│         ▼                       ▼                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │           MediatR Pipeline Behaviors              │  │
│  │  • ValidationBehavior (FluentValidation)         │  │
│  │  • TransactionBehavior (Auto-commit/rollback)    │  │
│  │  • LoggingBehavior (Request/response logging)    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Key Components:**
- **Commands:** Write operations that change state
- **Queries:** Read operations that return data
- **Handlers:** Execute commands/queries
- **Validators:** FluentValidation rules
- **DTOs:** Data Transfer Objects (no business logic)
- **Behaviors:** Cross-cutting concerns (validation, transactions, logging)

---

### 3. Domain Layer (DDD)

**Purpose:** Core business logic and rules

**Pattern:** Domain-Driven Design with Rich Domain Model

```
┌──────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                           │
│                    (No Dependencies)                      │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ENTITIES (Aggregate Roots)                       │   │
│  │  • JournalEntry (ensures Debit = Credit)         │   │
│  │  • Account (manages hierarchy, auxiliary rules)  │   │
│  │  • FiscalYear (controls period locking)          │   │
│  │  • ThirdParty (client/supplier validation)       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  VALUE OBJECTS (Immutable)                        │   │
│  │  • Money (amount + currency, prevents errors)    │   │
│  │  • AccountNumber (string-based for hierarchy)    │   │
│  │  • TaxIdentifier (NIF/NIS/RC validation)         │   │
│  │  • ValidationHash (SHA-256 hash chain)           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  DOMAIN SERVICES                                  │   │
│  │  • ILedgerSecurityService (hash chain)           │   │
│  │  • IIRGCalculator (tax calculation)              │   │
│  │  • IBalanceCalculator (account balances)         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  DOMAIN EVENTS                                    │   │
│  │  • JournalEntryPosted                            │   │
│  │  • FiscalPeriodLocked                            │   │
│  │  • FiscalYearClosed                              │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Key Principles:**
- **No external dependencies** (pure C# classes)
- **Rich domain model** (entities with behavior, not anemic)
- **Invariants enforced** (e.g., JournalEntry cannot be posted if unbalanced)
- **Immutable value objects** (Money, AccountNumber)
- **Domain events** (signal state changes)

---

### 4. Infrastructure Layer

**Purpose:** External services and hardware integration

**Responsibilities:**
- Security services (password hashing, JWT, encryption)
- Hardware services (barcode scanner, thermal printer)
- Export services (PDF, Excel, XML for Jibaya'tic)
- Tax calculation engines (IRG, VAT)
- Email notifications (future)

**Key Services:**
```
Infrastructure/
├── Services/
│   ├── Security/
│   │   ├── PasswordHasher.cs
│   │   ├── JwtTokenGenerator.cs
│   │   └── LedgerSecurityService.cs
│   ├── Hardware/
│   │   ├── BarcodeService.cs
│   │   └── PrinterService.cs
│   ├── Export/
│   │   ├── PdfExportService.cs
│   │   ├── ExcelExportService.cs
│   │   └── XmlExportService.cs
│   └── Tax/
│       ├── IRGCalculatorService.cs
│       └── VATCalculatorService.cs
```

---

### 5. Persistence Layer

**Purpose:** Data access and database operations

**Components:**
- **DbContext:** Entity Framework Core configuration
- **Repositories:** Data access abstraction
- **Migrations:** Database schema versioning
- **Seed Data:** Initial data population

**Special Configurations:**
```csharp
// CRITICAL: Decimal precision in SQLite
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Force SQLite to store Decimals as TEXT
    foreach (var entity in modelBuilder.Model.GetEntityTypes())
    {
        foreach (var prop in entity.GetProperties()
            .Where(p => p.ClrType == typeof(decimal)))
        {
            prop.SetProviderClrType(typeof(string));
        }
    }
}
```

---

## Communication Patterns

### 1. REST API (Data Plane)

**Protocol:** HTTP/1.1  
**Format:** JSON  
**Client:** Axios with TypeScript client (generated by NSwag)

```typescript
// Example: Create journal entry
const response = await apiClient.journalEntries.create({
  fiscalYearId: '2026',
  entryDate: '2026-02-05',
  journalCode: 'VTE',
  description: 'Vente marchandises',
  lines: [
    { accountNumber: '411', debit: '11900', credit: '0', label: 'Client X' },
    { accountNumber: '4457', debit: '0', credit: '1900', label: 'TVA 19%' },
    { accountNumber: '700', debit: '0', credit: '10000', label: 'Ventes' }
  ]
});
```

### 2. SignalR (Control Plane)

**Protocol:** WebSocket (with fallback to SSE, Long Polling)  
**Purpose:** Real-time events from hardware and system

```typescript
// Example: Listen for barcode scans
signalRConnection.on('BarcodeScanned', (barcode: string) => {
  console.log('Scanned:', barcode);
  // Auto-fill product in form
  setProductCode(barcode);
});

// Example: Printer status
signalRConnection.on('PrinterStatus', (status: PrinterStatus) => {
  if (status.error) {
    toast.error('Printer error: ' + status.message);
  }
});
```

---

## Design Patterns & Principles

### SOLID Principles

| Principle | Implementation |
|-----------|---------------|
| **S**ingle Responsibility | Each class has one reason to change (JournalEntry handles entry logic, not persistence) |
| **O**pen/Closed | Extend behavior via interfaces (IExportService → PdfExportService, ExcelExportService) |
| **L**iskov Substitution | All repositories implement IRepository<T>, interchangeable |
| **I**nterface Segregation | Small, focused interfaces (IReadRepository vs IWriteRepository) |
| **D**ependency Inversion | Depend on abstractions (Domain → IRepository interface, not EF DbContext) |

### Design Patterns Used

1. **Repository Pattern**
   - Abstracts data access
   - Enables testing without database
   - Located in Domain layer (interface) and Persistence layer (implementation)

2. **Unit of Work Pattern**
   - Groups database operations into single transaction
   - All-or-nothing commit
   - `await _unitOfWork.CommitAsync()`

3. **Aggregate Root Pattern**
   - JournalEntry is aggregate root, controls JournalLines
   - Lines cannot exist without parent entry
   - Enforces business invariants

4. **Specification Pattern**
   - Encapsulates query logic
   - `var spec = new ActiveAccountsSpecification();`
   - Reusable, testable query conditions

5. **Strategy Pattern**
   - Tax calculation strategies (IRG, VAT, TAP)
   - Export strategies (PDF, Excel, XML)

6. **Observer Pattern**
   - Domain events → Event handlers
   - Decouples side effects from core logic

7. **Factory Pattern**
   - `ValidationHashFactory.Create(entry)`
   - Encapsulates complex object creation

---

## Data Flow

### Write Flow (Creating a Journal Entry)

```
User Input (React)
    │
    ▼
┌─────────────────────────┐
│ 1. POST /api/journals   │ ◄── REST API
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ 2. CreateJournalEntryCommand                │
│    • Validation (FluentValidation)          │
│    • Check fiscal period not locked         │
│    • Verify Debit = Credit                  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ 3. Domain Layer (JournalEntry entity)      │
│    • Create aggregate root                  │
│    • Add lines (child entities)             │
│    • Enforce invariants                     │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ 4. Repository (Save to database)            │
│    • EF Core Add()                          │
│    • Triggers calculate totals              │
│    • UnitOfWork.Commit()                    │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ 5. Domain Event: JournalEntryCreated       │
│    • Update cache                           │
│    • SignalR notification to UI             │
└─────────────────────────────────────────────┘
```

### Read Flow (Getting General Ledger)

```
User Request (React)
    │
    ▼
┌─────────────────────────┐
│ 1. GET /api/ledger      │ ◄── REST API
│    ?year=2026&period=1  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ 2. GetGeneralLedgerQuery                    │
│    • Parse filters                          │
│    • Build specification                    │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ 3. Repository (Optimized query)            │
│    • Use Dapper (no EF tracking)            │
│    • Direct SQL to vw_GeneralLedger         │
│    • Return lightweight DTOs                │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ 4. React UI (Virtualized Grid)             │
│    • TanStack Table renders visible rows    │
│    • Virtual scrolling (10,000+ rows)       │
└─────────────────────────────────────────────┘
```

---

## Security Architecture

### Defense in Depth

```
┌────────────────────────────────────────────────────────────┐
│  Layer 1: Application Security                             │
│  • License validation on startup                           │
│  • JWT authentication                                      │
│  • Role-based authorization (RBAC)                        │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  Layer 2: Data Security                                    │
│  • SQLCipher database encryption                          │
│  • DPAPI key derivation (User + Machine)                 │
│  • Password hashing (BCrypt, cost factor 12)             │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  Layer 3: Integrity Protection                             │
│  • Hash chain (SHA-256) on journal entries                │
│  • Triggers prevent modification of posted entries         │
│  • Audit log (append-only)                                │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  Layer 4: Code Protection                                  │
│  • Obfuscation (Obfuscar)                                 │
│  • Code signing certificate                               │
│  • No sensitive data in logs                              │
└────────────────────────────────────────────────────────────┘
```

### Hash Chain Implementation

```csharp
// Blockchain-style integrity chain
public string CalculateValidationHash(JournalEntry entry, string previousHash)
{
    var data = $"{entry.EntryDate:yyyy-MM-dd}|{entry.Reference}|" +
               $"{entry.TotalDebit}|{entry.TotalCredit}|{previousHash}";

    using var sha256 = SHA256.Create();
    var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
    return Convert.ToBase64String(hashBytes);
}

// On startup: Verify entire chain
public bool VerifyIntegrity()
{
    var entries = _repository.GetAll().OrderBy(e => e.EntryNumber);
    string expectedHash = null;

    foreach (var entry in entries)
    {
        var calculatedHash = CalculateValidationHash(entry, expectedHash);
        if (calculatedHash != entry.ValidationHash)
        {
            _logger.Error($"Integrity breach detected at entry {entry.EntryNumber}");
            return false; // TAMPERING DETECTED
        }
        expectedHash = entry.ValidationHash;
    }

    return true;
}
```

---

## Deployment Architecture

### Single Executable Deployment

```
TOTALFISC.exe (WPF Host)
    │
    ├─ Embedded: TOTALFISC.Api.dll
    ├─ Embedded: React build (wwwroot/)
    ├─ Embedded: SQLite database (first run creates)
    └─ External Dependencies:
        ├─ WebView2 Runtime (auto-installed by Inno Setup)
        └─ .NET 9 Runtime (bundled in installer)

Installation Directory:
C:\Program Files\TOTALFISC    ├─ TOTALFISC.exe
    ├─ *.dll (all dependencies)
    ├─ database    │   └─ totalfisc.db (encrypted)
    ├─ logs    │   └─ app-{date}.log
    └─ license.key (RSA-signed)
```

### Startup Sequence

1. **WPF Application Starts**
   - Validate license file
   - Check WebView2 Runtime
   - Initialize hardware services

2. **Kestrel API Starts**
   - Self-host on random port (5000-5999)
   - Load configuration
   - Initialize DbContext
   - Verify database integrity (hash chain)

3. **WebView2 Loads React**
   - Navigate to `http://localhost:{port}`
   - Establish SignalR connection
   - Load user preferences
   - Display login screen

---

## Performance Considerations

### Database Performance

- **Indexes:** 30+ covering frequently queried columns
- **Materialized Balances:** `AccountBalances` table updated on post
- **Dapper for Reads:** Bypass EF Core tracking for reports
- **WAL Mode:** SQLite Write-Ahead Logging for concurrency

### Frontend Performance

- **Virtualization:** Only render visible rows (60fps with 100,000 rows)
- **Code Splitting:** Lazy load feature modules
- **Memoization:** `React.memo`, `useMemo`, `useCallback`
- **Debouncing:** Search inputs debounced (300ms)
- **Service Workers:** (Future) Cache static assets

### Memory Management

- **Dispose Pattern:** Properly dispose DbContext, connections
- **WeakReferences:** For cached data that can be GC'd
- **Pagination:** API responses limited to 1000 records per page
- **Virtual Scrolling:** React Virtual keeps DOM nodes minimal

---

## Conclusion

The TOTALFISC architecture achieves the perfect balance between:

✅ **Desktop Performance** (native WPF host)  
✅ **Modern UX** (React with cutting-edge libraries)  
✅ **Enterprise Security** (encryption, hash chain, audit trail)  
✅ **Regulatory Compliance** (SCF, Decree 09-110, Jibaya'tic)  
✅ **Maintainability** (Clean Architecture, SOLID principles)  
✅ **Testability** (Unit, Integration, E2E tests)  

This architecture will serve Algerian SMEs for years to come, replacing legacy PCCOMPTA systems with a modern, secure, and compliant solution.

---

**Next Steps:**
- Review [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) for data model details
- Review [SCF_COMPLIANCE.md](SCF_COMPLIANCE.md) for accounting standards
- Review [DECREE_09_110.md](DECREE_09_110.md) for regulatory requirements
- Review [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) to start coding
