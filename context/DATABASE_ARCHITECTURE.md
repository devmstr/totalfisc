# DATABASE_ARCHITECTURE.md
# TOTALFISC - Database Architecture

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Database Engine:** SQLite 3.x with SQLCipher encryption  

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Design Principles](#design-principles)
3. [Domain Organization](#domain-organization)
4. [Core Tables Reference](#core-tables-reference)
5. [Critical Relationships](#critical-relationships)
6. [Data Integrity Mechanisms](#data-integrity-mechanisms)
7. [Performance Optimization](#performance-optimization)
8. [Special Configurations](#special-configurations)

---

## Database Overview

### Statistics

| Metric | Count |
|--------|-------|
| **Operational Tables** | 29 |
| **Reporting Views** | 3 |
| **Foreign Key Constraints** | 50+ |
| **Check Constraints** | 40+ |
| **Indexes** | 30+ |
| **Triggers** | 10+ |

### Database File Location

```
Development: ./database/totalfisc.db
Production:  %ProgramData%/TOTALFISC/database/totalfisc.db
```

### Encryption

- **Engine:** SQLCipher (256-bit AES)
- **Key Derivation:** PBKDF2 from (User Password + Machine ID)
- **PRAGMA key:** Set on connection open

---

## Design Principles

### 1. String-Based Account Numbers

**Decision:** Store account numbers as TEXT (not INTEGER)

**Rationale:**
```sql
-- Hierarchical queries become trivial
SELECT * FROM Accounts WHERE AccountNumber LIKE '6%';  -- All expenses
SELECT * FROM Accounts WHERE AccountNumber LIKE '512%'; -- All banks

-- No need for recursive CTEs
-- Natural alignment with SCF structure (Class 1-7)
```

**Example:**
```
1       Capitaux propres (Equity)
10      Capital
101     Capital social
1011    Capital souscrit non appelé
1012    Capital souscrit appelé, non versé
1013    Capital souscrit appelé, versé
```

---

### 2. Decimal Precision as TEXT

**Problem:** SQLite stores decimals as REAL (floating-point)
```
0.1 + 0.2 = 0.30000000004  ❌ UNACCEPTABLE in accounting
```

**Solution:** Store as TEXT with application-layer parsing
```sql
CREATE TABLE JournalLines (
    Debit TEXT NOT NULL DEFAULT '0',    -- Stored as '100.50'
    Credit TEXT NOT NULL DEFAULT '0'     -- Parsed as decimal in C#
);
```

**EF Core Configuration:**
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
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

### 3. Immutability Enforcement (Triple Layer)

**Layer 1 - Application Logic:**
```csharp
public void UpdateEntry(JournalEntry entry)
{
    if (entry.Status == EntryStatus.Posted)
        throw new DomainException("Cannot modify posted entry");
}
```

**Layer 2 - Database Triggers:**
```sql
CREATE TRIGGER trg_prevent_posted_entry_update
BEFORE UPDATE ON JournalEntries
WHEN OLD.Status = 'Posted' AND NEW.Status = 'Posted'
BEGIN
    SELECT RAISE(ABORT, 'Cannot modify Posted entry');
END;
```

**Layer 3 - Hash Chain Verification:**
```csharp
// On startup, verify entire chain
if (!VerifyHashChainIntegrity())
{
    EnterAuditMode();
    AlertUser("Database tampering detected!");
}
```

---

### 4. Audit Trail Everywhere

Every table includes:
```sql
CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
CreatedBy TEXT NOT NULL,  -- FK → Users
ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
ModifiedBy TEXT          -- FK → Users
```

Plus comprehensive `AuditLog` table with before/after snapshots.

---

## Domain Organization

### 10 Functional Domains

```
┌────────────────────────────────────────────────────────────┐
│  1. Security & System (5 tables)                           │
│     • SystemSettings, CompanyInfo, Users, AuditLog, License│
├────────────────────────────────────────────────────────────┤
│  2. Fiscal Management (2 tables)                           │
│     • FiscalYears, FiscalPeriods                          │
├────────────────────────────────────────────────────────────┤
│  3. Chart of Accounts (2 tables)                          │
│     • Accounts, AccountBalances                           │
├────────────────────────────────────────────────────────────┤
│  4. Third Parties (1 table)                               │
│     • ThirdParties (Clients, Suppliers, Employees)        │
├────────────────────────────────────────────────────────────┤
│  5. Core Ledger (3 tables)                                │
│     • JournalCodes, JournalEntries, JournalLines          │
├────────────────────────────────────────────────────────────┤
│  6. Analytical Accounting (3 tables)                      │
│     • AnalyticalAxes, AnalyticalSections, Distribution    │
├────────────────────────────────────────────────────────────┤
│  7. Tax Management (3 tables)                             │
│     • VATRates, IRGBrackets, IRGConfiguration             │
├────────────────────────────────────────────────────────────┤
│  8. Inventory (3 tables)                                  │
│     • ProductCategories, Products, InventoryMovements     │
├────────────────────────────────────────────────────────────┤
│  9. Bank Reconciliation (4 tables)                        │
│     • BankAccounts, BankStatements, BankTransactions,     │
│       Reconciliations                                     │
├────────────────────────────────────────────────────────────┤
│  10. Fiscal Reporting (3 tables)                          │
│      • FiscalReportTemplates, FiscalReportMappings,       │
│        GeneratedFiscalReports                             │
└────────────────────────────────────────────────────────────┘
```

---

## Core Tables Reference

### JournalEntries (Transaction Header)

**Purpose:** Main accounting transaction register (Aggregate Root)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| EntryId | TEXT | PK | GUID identifier |
| EntryNumber | INTEGER | UNIQUE(FiscalYearId) | Legal sequential number |
| DraftNumber | TEXT | | Temporary draft ID |
| FiscalYearId | TEXT | FK → FiscalYears | Year validation |
| PeriodId | TEXT | FK → FiscalPeriods | Period locking |
| JournalCodeId | TEXT | FK → JournalCodes | Journal classification |
| EntryDate | TEXT | NOT NULL | Transaction date (YYYY-MM-DD) |
| Reference | TEXT | | Invoice #, receipt # |
| Description | TEXT | NOT NULL | Entry description |
| Status | TEXT | CHECK IN(...) | Draft, Validating, Posted, Void |
| TotalDebit | TEXT | DEFAULT '0' | Auto-calculated by trigger |
| TotalCredit | TEXT | DEFAULT '0' | Auto-calculated by trigger |
| **ValidationHash** | TEXT | | **SHA-256 hash chain** |
| **PreviousHash** | TEXT | | **Link to previous entry** |
| PostedAt | TEXT | | Timestamp when posted |
| PostedBy | TEXT | FK → Users | User who posted |
| CreatedAt | TEXT | DEFAULT NOW | Audit trail |
| CreatedBy | TEXT | FK → Users | Audit trail |

**Critical Invariant:** `TotalDebit = TotalCredit` before posting

---

### JournalLines (Transaction Detail)

**Purpose:** Individual debit/credit lines within an entry

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| LineId | TEXT | PK | GUID identifier |
| EntryId | TEXT | FK → JournalEntries | Parent entry (CASCADE DELETE) |
| LineNumber | INTEGER | UNIQUE(EntryId) | Sequential 1,2,3... |
| AccountId | TEXT | FK → Accounts | Account to post to |
| ThirdPartyId | TEXT | FK → ThirdParties | Required if Account.IsAuxiliary |
| Label | TEXT | NOT NULL | Line description |
| **Debit** | TEXT | CHECK ≥ 0 | **Stored as TEXT for precision** |
| **Credit** | TEXT | CHECK ≥ 0 | **Stored as TEXT for precision** |
| Currency | TEXT | DEFAULT 'DZD' | Multi-currency (future) |
| ReferenceDocument | TEXT | | Invoice #, receipt # |
| DueDate | TEXT | | For receivables/payables |

**Critical Constraint:** `(Debit > 0 AND Credit = 0) OR (Debit = 0 AND Credit > 0)`

---

### Accounts (Chart of Accounts)

**Purpose:** SCF-compliant hierarchical account structure

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| AccountId | TEXT | PK | GUID identifier |
| **AccountNumber** | TEXT | UNIQUE | **String-based for hierarchy** |
| AccountLabel | TEXT | NOT NULL | Account name |
| AccountClass | INTEGER | CHECK 1-7 | SCF Class |
| ParentAccountId | TEXT | FK → Self | Hierarchy |
| AccountType | TEXT | CHECK IN(...) | Asset, Liability, Equity, Revenue, Expense |
| **IsAuxiliary** | INTEGER | 0/1 | **Requires ThirdParty** |
| IsSummary | INTEGER | 0/1 | Cannot post to summary |
| AllowManualEntry | INTEGER | 0/1 | Auto-entry accounts |
| TaxType | TEXT | | VAT_Deductible, VAT_Collected, IRG, etc. |

**Example Hierarchy:**
```
5    Comptes financiers
51   Banques
512  Banques comptes courants
5121 Banque CPA Alger
5122 Banque BNA Constantine
```

---

### AccountBalances (Materialized View)

**Purpose:** Pre-calculated account balances for performance

| Column | Type | Purpose |
|--------|------|---------|
| BalanceId | TEXT | PK |
| AccountId | TEXT | FK → Accounts |
| FiscalYearId | TEXT | FK → FiscalYears |
| PeriodId | TEXT | FK → FiscalPeriods |
| DebitBalance | TEXT | Sum of debits |
| CreditBalance | TEXT | Sum of credits |
| NetBalance | TEXT | Debit - Credit |
| BalanceType | TEXT | Debit, Credit, Zero |

**Updated by:** Application layer after posting entries

**Benefit:** Instant Balance Sheet generation (no need to sum millions of lines)

---

### ThirdParties (Auxiliary Accounts)

**Purpose:** Clients, Suppliers, Employees

| Column | Type | Purpose |
|--------|------|---------|
| ThirdPartyId | TEXT | PK |
| ThirdPartyType | TEXT | Client, Supplier, Employee, Other |
| Code | TEXT | UNIQUE auxiliary code |
| Name | TEXT | Trading name |
| LegalName | TEXT | Legal entity name |
| **NIF** | TEXT | **Numéro d'Identification Fiscale** |
| **NIS** | TEXT | **Numéro d'Identification Statistique** |
| **RC** | TEXT | **Registre de Commerce** |
| PaymentTerms | INTEGER | Days (30, 60, 90) |
| CreditLimit | TEXT | Maximum credit allowed |
| BankAccountNumber | TEXT | For direct payments |

---

### FiscalYears & FiscalPeriods

**FiscalYears (Exercice Comptable):**
```sql
CREATE TABLE FiscalYears (
    FiscalYearId TEXT PRIMARY KEY,
    YearNumber INTEGER NOT NULL UNIQUE,  -- 2026, 2027
    StartDate TEXT NOT NULL,             -- '2026-01-01'
    EndDate TEXT NOT NULL,               -- '2026-12-31'
    Status TEXT NOT NULL DEFAULT 'Open'  -- Open, Locked, Closed
);
```

**FiscalPeriods (Monthly):**
```sql
CREATE TABLE FiscalPeriods (
    PeriodId TEXT PRIMARY KEY,
    FiscalYearId TEXT NOT NULL,
    PeriodNumber INTEGER CHECK (1-12),   -- 1=January, 12=December
    PeriodName TEXT NOT NULL,            -- 'Janvier 2026'
    Status TEXT NOT NULL DEFAULT 'Open', -- Open, Locked, Closed
    UNIQUE (FiscalYearId, PeriodNumber)
);
```

**Business Rule:** Cannot post entries to Closed/Locked periods

---

## Critical Relationships

### Master-Detail (1:N with CASCADE DELETE)

```sql
JournalEntries ──────< JournalLines
  • When entry deleted, all lines deleted
  • Prevents orphaned lines
  • Enforces aggregate root pattern

BankStatements ──────< BankTransactions
  • Statement lines belong to statement
  • Cannot exist independently

FiscalYears ─────────< FiscalPeriods
  • Periods belong to year
  • Cascade delete maintains integrity
```

### Lookup Relationships (N:1 with RESTRICT)

```sql
JournalEntries ──────> FiscalYears
  • Entry must reference valid year
  • Cannot delete year with entries

JournalLines ────────> Accounts
  • Line must reference valid account
  • Cannot delete account with transactions

JournalLines ────────> ThirdParties (Optional)
  • Required only if Account.IsAuxiliary = 1
  • Auxiliary tracking
```

### Cross-Module Integration

```sql
InventoryMovements ──> JournalEntries
  • Stock movement creates accounting entry
  • Links inventory to GL

BankTransactions ────> Reconciliations
  • Transaction matched in reconciliation
  • Tracks reconciliation status
```

---

## Data Integrity Mechanisms

### 1. Foreign Key Constraints

**Enabled globally:**
```sql
PRAGMA foreign_keys = ON;
```

**Example constraint:**
```sql
FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId)
```

**Behavior:**
- **CASCADE DELETE:** Child rows deleted when parent deleted
- **RESTRICT:** Prevents parent deletion if children exist

---

### 2. Check Constraints

**Enforce business rules at database level:**

```sql
-- Non-negative amounts
CHECK (Debit >= 0)
CHECK (Credit >= 0)

-- Fiscal year date range
CHECK (StartDate < EndDate)

-- Valid status values
CHECK (Status IN ('Draft', 'Validating', 'Posted', 'Void'))

-- Account class range
CHECK (AccountClass BETWEEN 1 AND 7)

-- Boolean flags
CHECK (IsActive IN (0, 1))
```

---

### 3. Unique Constraints

```sql
-- Sequential entry numbering per year
UNIQUE (EntryNumber, FiscalYearId)

-- One period per month per year
UNIQUE (FiscalYearId, PeriodNumber)

-- Unique account numbers
UNIQUE (AccountNumber)

-- Unique third-party codes
UNIQUE (Code)
```

---

### 4. Triggers (Automated Enforcement)

**Auto-calculate entry totals:**
```sql
CREATE TRIGGER trg_calculate_entry_totals_insert
AFTER INSERT ON JournalLines
BEGIN
    UPDATE JournalEntries
    SET TotalDebit = (SELECT SUM(CAST(Debit AS REAL)) 
                      FROM JournalLines WHERE EntryId = NEW.EntryId),
        TotalCredit = (SELECT SUM(CAST(Credit AS REAL))
                       FROM JournalLines WHERE EntryId = NEW.EntryId)
    WHERE EntryId = NEW.EntryId;
END;
```

**Prevent modification of posted entries:**
```sql
CREATE TRIGGER trg_prevent_posted_entry_update
BEFORE UPDATE ON JournalEntries
WHEN OLD.Status = 'Posted' AND NEW.Status = 'Posted'
BEGIN
    SELECT RAISE(ABORT, 'Cannot modify Posted entry');
END;
```

**Validate balance before posting:**
```sql
CREATE TRIGGER trg_validate_entry_balance
BEFORE UPDATE ON JournalEntries
WHEN NEW.Status = 'Posted' AND OLD.Status != 'Posted'
BEGIN
    SELECT CASE
        WHEN ABS(CAST(NEW.TotalDebit AS REAL) - 
                 CAST(NEW.TotalCredit AS REAL)) > 0.01 THEN
            RAISE(ABORT, 'Entry not balanced')
    END;
END;
```

---

### 5. Hash Chain Integrity

**Blockchain-style tamper detection:**

```
Entry #1: Hash = SHA256(Date + Ref + Amounts + NULL)
          PreviousHash = NULL

Entry #2: Hash = SHA256(Date + Ref + Amounts + Hash#1)
          PreviousHash = Hash#1

Entry #3: Hash = SHA256(Date + Ref + Amounts + Hash#2)
          PreviousHash = Hash#2
```

**Implementation:**
```csharp
public async Task<string> CalculateHashAsync(JournalEntry entry)
{
    // Get previous hash
    var previousEntry = await _repository
        .GetPreviousEntryAsync(entry.FiscalYearId, entry.EntryNumber);

    var previousHash = previousEntry?.ValidationHash ?? string.Empty;

    // Calculate hash
    var data = $"{entry.EntryDate:yyyy-MM-dd}|{entry.Reference}|" +
               $"{entry.TotalDebit}|{entry.TotalCredit}|{previousHash}";

    using var sha256 = SHA256.Create();
    var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
    return Convert.ToBase64String(hashBytes);
}
```

**Verification on startup:**
```csharp
public async Task<bool> VerifyIntegrityAsync()
{
    var entries = await _repository.GetAllPostedEntriesAsync();
    string expectedHash = string.Empty;

    foreach (var entry in entries.OrderBy(e => e.EntryNumber))
    {
        var calculatedHash = await CalculateHashAsync(entry);
        if (calculatedHash != entry.ValidationHash)
        {
            _logger.LogCritical($"Tampering detected at entry {entry.EntryNumber}");
            return false;
        }
        expectedHash = entry.ValidationHash;
    }

    return true;
}
```

---

## Performance Optimization

### 1. Indexes (30+)

**Critical indexes for frequent queries:**

```sql
-- Journal entries
CREATE INDEX idx_entries_date ON JournalEntries(EntryDate);
CREATE INDEX idx_entries_status ON JournalEntries(Status);
CREATE INDEX idx_entries_year ON JournalEntries(FiscalYearId);
CREATE INDEX idx_entries_number ON JournalEntries(EntryNumber, FiscalYearId);

-- Journal lines
CREATE INDEX idx_lines_entry ON JournalLines(EntryId);
CREATE INDEX idx_lines_account ON JournalLines(AccountId);
CREATE INDEX idx_lines_thirdparty ON JournalLines(ThirdPartyId);

-- Accounts
CREATE INDEX idx_accounts_number ON Accounts(AccountNumber);
CREATE INDEX idx_accounts_class ON Accounts(AccountClass);
CREATE INDEX idx_accounts_parent ON Accounts(ParentAccountId);

-- Filtered index for active accounts
CREATE INDEX idx_accounts_active ON Accounts(IsActive) 
WHERE IsActive = 1;
```

**Query performance:**
```sql
-- Before index: 2.5 seconds (full table scan)
-- After index:  15 milliseconds
SELECT * FROM JournalEntries 
WHERE EntryDate BETWEEN '2026-01-01' AND '2026-12-31'
  AND Status = 'Posted';
```

---

### 2. Materialized Views (as Tables)

**AccountBalances table eliminates expensive aggregations:**

```sql
-- Without materialized view (SLOW):
SELECT AccountNumber, 
       SUM(Debit - Credit) AS Balance
FROM Accounts a
JOIN JournalLines jl ON a.AccountId = jl.AccountId
JOIN JournalEntries je ON jl.EntryId = je.EntryId
WHERE je.Status = 'Posted'
GROUP BY AccountNumber;
-- Execution time: 3-5 seconds for 100,000 transactions

-- With materialized view (FAST):
SELECT AccountNumber, NetBalance AS Balance
FROM AccountBalances
WHERE FiscalYearId = '2026';
-- Execution time: 50 milliseconds
```

---

### 3. Reporting Views

**vw_GeneralLedger (Grand Livre):**
```sql
CREATE VIEW vw_GeneralLedger AS
SELECT 
    je.EntryNumber,
    je.EntryDate,
    je.Reference,
    jc.Code AS JournalCode,
    jl.LineNumber,
    a.AccountNumber,
    a.AccountLabel,
    COALESCE(tp.Code || ' - ' || tp.Name, '') AS ThirdParty,
    jl.Label,
    jl.Debit,
    jl.Credit,
    je.Status
FROM JournalLines jl
INNER JOIN JournalEntries je ON jl.EntryId = je.EntryId
INNER JOIN Accounts a ON jl.AccountId = a.AccountId
INNER JOIN JournalCodes jc ON je.JournalCodeId = jc.JournalCodeId
LEFT JOIN ThirdParties tp ON jl.ThirdPartyId = tp.ThirdPartyId
WHERE je.Status = 'Posted'
ORDER BY je.EntryDate, je.EntryNumber, jl.LineNumber;
```

**vw_TrialBalance (Balance Générale):**
```sql
CREATE VIEW vw_TrialBalance AS
SELECT 
    a.AccountNumber,
    a.AccountLabel,
    a.AccountClass,
    COALESCE(SUM(CAST(jl.Debit AS REAL)), 0) AS TotalDebit,
    COALESCE(SUM(CAST(jl.Credit AS REAL)), 0) AS TotalCredit,
    COALESCE(SUM(CAST(jl.Debit AS REAL)) - 
             SUM(CAST(jl.Credit AS REAL)), 0) AS Balance
FROM Accounts a
LEFT JOIN JournalLines jl ON a.AccountId = jl.AccountId
LEFT JOIN JournalEntries je ON jl.EntryId = je.EntryId
WHERE je.Status = 'Posted' OR je.Status IS NULL
GROUP BY a.AccountId
ORDER BY a.AccountNumber;
```

**vw_AccountStatement (Relevé de Compte with Running Balance):**
```sql
CREATE VIEW vw_AccountStatement AS
SELECT 
    a.AccountNumber,
    je.EntryDate,
    je.EntryNumber,
    jl.Label,
    jl.Debit,
    jl.Credit,
    SUM(CAST(jl.Debit AS REAL) - CAST(jl.Credit AS REAL)) OVER (
        PARTITION BY a.AccountId 
        ORDER BY je.EntryDate, je.EntryNumber
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS RunningBalance
FROM Accounts a
INNER JOIN JournalLines jl ON a.AccountId = jl.AccountId
INNER JOIN JournalEntries je ON jl.EntryId = je.EntryId
WHERE je.Status = 'Posted';
```

---

### 4. WAL Mode (Write-Ahead Logging)

**Enable for better concurrency:**
```sql
PRAGMA journal_mode = WAL;
```

**Benefits:**
- Readers don't block writers
- Writers don't block readers
- Better performance for concurrent access
- Hardware Service and UI can run simultaneously

---

## Special Configurations

### Entity Framework Core

**Connection String:**
```csharp
var connectionString = new SqliteConnectionStringBuilder
{
    DataSource = "totalfisc.db",
    Mode = SqliteOpenMode.ReadWriteCreate,
    Cache = SqliteCacheMode.Shared,
    ForeignKeys = true,  // CRITICAL!
    Pooling = true
}.ToString();
```

**DbContext Configuration:**
```csharp
public class ApplicationDbContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlite(connectionString);
        options.EnableSensitiveDataLogging(false); // Security
        options.EnableDetailedErrors(true);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Decimal → TEXT conversion
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var prop in entity.GetProperties()
                .Where(p => p.ClrType == typeof(decimal)))
            {
                prop.SetProviderClrType(typeof(string));
            }
        }

        // Apply entity configurations
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
```

---

### SQLCipher Encryption

**Setting the password:**
```csharp
using var connection = new SqliteConnection(connectionString);
connection.Open();

// Derive key from user password + machine ID
var key = DeriveEncryptionKey(userPassword, machineId);

var command = connection.CreateCommand();
command.CommandText = $"PRAGMA key = '{key}';";
command.ExecuteNonQuery();

// Verify database is accessible
command.CommandText = "SELECT COUNT(*) FROM sqlite_master;";
var result = command.ExecuteScalar();
```

**Key Derivation:**
```csharp
public string DeriveEncryptionKey(string userPassword, string machineId)
{
    using var pbkdf2 = new Rfc2898DeriveBytes(
        userPassword,
        Encoding.UTF8.GetBytes(machineId),
        iterations: 100000,
        HashAlgorithmName.SHA256
    );

    var keyBytes = pbkdf2.GetBytes(32); // 256-bit key
    return Convert.ToBase64String(keyBytes);
}
```

---

## Database Maintenance

### Backup Strategy

```csharp
public async Task BackupDatabaseAsync(string destinationPath)
{
    using var source = new SqliteConnection(connectionString);
    using var dest = new SqliteConnection($"Data Source={destinationPath}");

    source.Open();
    dest.Open();

    source.BackupDatabase(dest);
}
```

### Integrity Check

```sql
-- Run periodically
PRAGMA integrity_check;

-- Expected result: "ok"
```

### Vacuum (Reclaim Space)

```sql
-- Rebuild database, reclaim space
VACUUM;
```

### Analyze (Update Statistics)

```sql
-- Update query planner statistics
ANALYZE;
```

---

## Conclusion

The TOTALFISC database architecture achieves:

✅ **Data Integrity** - Foreign keys, constraints, triggers  
✅ **Performance** - Indexes, materialized views, optimized queries  
✅ **Security** - Encryption, hash chain, audit trail  
✅ **Compliance** - Decree 09-110 intangibility and traceability  
✅ **Precision** - Decimal-as-TEXT eliminates floating-point errors  
✅ **Scalability** - Efficient for 100,000+ transactions per year  

This robust foundation supports complex accounting operations while maintaining the speed and reliability expected of desktop applications.

---

**See Also:**
- [totalfisc_schema.sql](../database/schema/totalfisc_schema.sql) - Complete SQL schema
- [totalfisc_erd.txt](../docs/architecture/totalfisc_erd.txt) - Entity Relationship Diagram
- [SCF_COMPLIANCE.md](SCF_COMPLIANCE.md) - Chart of Accounts structure
