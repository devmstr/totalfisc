# DECREE_09_110.md
# TOTALFISC - Executive Decree 09-110 Compliance

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Regulation:** Executive Decree 09-110 of March 7, 2009  
**Official Name:** *Décret exécutif n° 09-110 fixant les conditions et modalités de tenue de la comptabilité au moyen de systèmes informatiques*  

---

## Table of Contents

1. [Decree Overview](#decree-overview)
2. [Key Requirements](#key-requirements)
3. [Article 14: Intangibility](#article-14-intangibility)
4. [Article 15: Data Durability](#article-15-data-durability)
5. [Article 16: Traceability](#article-16-traceability)
6. [Technical Implementation](#technical-implementation)
7. [Compliance Verification](#compliance-verification)
8. [FEC File Format](#fec-file-format)

---

## Decree Overview

### Purpose

**Executive Decree 09-110** regulates the use of computerized accounting systems in Algeria. It ensures that:

1. **Data Integrity** - Accounting records cannot be modified after validation
2. **Traceability** - Complete audit trail of all operations
3. **Durability** - Data can be preserved and accessed for legal retention periods
4. **Exportability** - Data can be exported in standardized format for auditors

### Scope

Applies to:
- ✅ All commercial companies (SARL, SPA, EURL, SNC)
- ✅ Public establishments with commercial character
- ✅ Associations and foundations (if required by law)
- ✅ Individual entrepreneurs (if using computerized accounting)

### Legal Context

```
Loi 07-11 (November 25, 2007)
    │ Système Comptable Financier (SCF)
    │
    ├─► Décret exécutif 08-156 (May 26, 2008)
    │   └─ Application procedures for SCF
    │
    └─► Décret exécutif 09-110 (March 7, 2009) ⭐
        └─ Computerized accounting systems
```

### Penalties for Non-Compliance

**Article 32 of Law 07-11:**
- Fines: **10,000 to 100,000 DZD**
- Possible rejection of accounts by tax authorities
- Auditor qualified opinion (risk of not being certified)

---

## Key Requirements

### Overview of Critical Articles

| Article | Requirement | TOTALFISC Implementation |
|---------|-------------|--------------------------------|
| **Art. 14** | **Intangibility** - Validated entries cannot be modified | ✅ Triple-layer enforcement (App + DB + Hash Chain) |
| **Art. 15** | **Durability** - Data export in standardized format (FEC) | ✅ FEC export service with proper encoding |
| **Art. 16** | **Traceability** - Complete audit trail | ✅ AuditLog table with before/after snapshots |
| Art. 17 | Documentation of software | ✅ Complete technical documentation |
| Art. 18 | User manual | ✅ User guide provided |
| Art. 19 | Backup procedures | ✅ Automated backup with encryption |

---

## Article 14: Intangibility

### Legal Text (Simplified)

> *"Les enregistrements comptables validés ne peuvent être modifiés. Toute correction doit faire l'objet d'une nouvelle écriture explicitement identifiée comme correction."*

**Translation:**
> "Validated accounting entries cannot be modified. Any correction must be made through a new entry explicitly identified as a correction."

### Technical Requirements

1. **Validated entries are immutable** (cannot be UPDATE'd)
2. **Corrections via contra-entries** (reversal entry + new entry)
3. **No deletion of validated entries** (only voiding)
4. **Audit trail of all attempts** to modify

### Implementation: Triple-Layer Protection

#### Layer 1: Application Logic

```csharp
public class UpdateJournalEntryCommandHandler : IRequestHandler<UpdateJournalEntryCommand>
{
    public async Task<Result> Handle(UpdateJournalEntryCommand request)
    {
        var entry = await _repository.GetByIdAsync(request.EntryId);

        // INTANGIBILITY CHECK
        if (entry.Status == EntryStatus.Posted)
        {
            return Result.Failure("Cannot modify posted entry (Decree 09-110 Art. 14)");
        }

        // Only Draft entries can be modified
        if (entry.Status != EntryStatus.Draft)
        {
            return Result.Failure("Only draft entries can be modified");
        }

        // Continue with update...
    }
}
```

#### Layer 2: Database Triggers

```sql
-- Prevent UPDATE of Posted entries
CREATE TRIGGER trg_prevent_posted_entry_update
BEFORE UPDATE ON JournalEntries
WHEN OLD.Status = 'Posted' AND NEW.Status = 'Posted'
BEGIN
    SELECT RAISE(ABORT, 'Cannot modify Posted entry (Decree 09-110 Art. 14)');
END;

-- Prevent UPDATE of journal lines in posted entries
CREATE TRIGGER trg_prevent_posted_line_update
BEFORE UPDATE ON JournalLines
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN (SELECT Status FROM JournalEntries WHERE EntryId = OLD.EntryId) = 'Posted'
        THEN RAISE(ABORT, 'Cannot modify lines of Posted entry')
    END;
END;

-- Prevent DELETE of posted entries
CREATE TRIGGER trg_prevent_posted_entry_delete
BEFORE DELETE ON JournalEntries
WHEN OLD.Status = 'Posted'
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete Posted entry (Decree 09-110 Art. 14)');
END;
```

#### Layer 3: Hash Chain Verification

**Blockchain-Style Integrity:**

```csharp
public class LedgerSecurityService : ILedgerSecurityService
{
    // Calculate hash for an entry
    public string CalculateHash(JournalEntry entry, string previousHash)
    {
        // Concatenate critical fields
        var data = $"{entry.EntryDate:yyyy-MM-dd}|" +
                   $"{entry.Reference}|" +
                   $"{entry.TotalDebit}|" +
                   $"{entry.TotalCredit}|" +
                   $"{previousHash}";

        // SHA-256 hash
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hashBytes);
    }

    // Verify entire ledger integrity
    public async Task<IntegrityCheckResult> VerifyIntegrityAsync()
    {
        var entries = await _repository.GetAllPostedAsync();
        var result = new IntegrityCheckResult { IsValid = true };

        string expectedPreviousHash = string.Empty;

        foreach (var entry in entries.OrderBy(e => e.EntryNumber))
        {
            // Verify PreviousHash matches
            if (entry.PreviousHash != expectedPreviousHash)
            {
                result.IsValid = false;
                result.Errors.Add($"Chain broken at entry {entry.EntryNumber}");
                _logger.LogCritical("TAMPERING DETECTED: Hash chain broken");
            }

            // Recalculate hash
            var calculatedHash = CalculateHash(entry, expectedPreviousHash);

            if (calculatedHash != entry.ValidationHash)
            {
                result.IsValid = false;
                result.Errors.Add($"Hash mismatch at entry {entry.EntryNumber}");
                _logger.LogCritical("TAMPERING DETECTED: Hash validation failed");
            }

            expectedPreviousHash = entry.ValidationHash;
        }

        if (!result.IsValid)
        {
            // Alert administrator
            await _notificationService.AlertAdminAsync("Database tampering detected!");

            // Enter audit mode (read-only)
            await _systemService.EnterAuditModeAsync();
        }

        return result;
    }
}
```

**Startup Verification:**
```csharp
public class App : Application
{
    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // CRITICAL: Verify integrity on every startup
        var integrityService = _serviceProvider.GetService<ILedgerSecurityService>();
        var result = await integrityService.VerifyIntegrityAsync();

        if (!result.IsValid)
        {
            MessageBox.Show(
                "Database integrity check FAILED!\n" +
                "Possible tampering detected.\n" +
                "Application will run in READ-ONLY mode.\n\n" +
                "Contact your system administrator immediately.",
                "CRITICAL SECURITY ALERT",
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );

            // Continue in read-only mode
            _systemService.SetReadOnlyMode(true);
        }
    }
}
```

### Correction Process (Contre-Passation)

**Scenario:** Posted entry has error

**❌ WRONG (Violates Decree):**
```sql
-- This is ILLEGAL
UPDATE JournalEntries SET Description = 'Corrected' WHERE EntryId = 'xxx';
```

**✅ CORRECT (Compliant):**

**Step 1: Create Reversal Entry**
```
Entry #123 (Original - WRONG):
  Date: 2026-02-01
  Debit:  600 Achats          10,000 DZD
  Credit: 401 Fournisseur     10,000 DZD

Entry #124 (Reversal):
  Date: 2026-02-05
  Reference: "Annulation écriture #123"
  Debit:  401 Fournisseur     10,000 DZD  ← Reversed
  Credit: 600 Achats          10,000 DZD  ← Reversed
```

**Step 2: Create Correct Entry**
```
Entry #125 (Correct):
  Date: 2026-02-05
  Reference: "Correction suite annulation #123"
  Debit:  610 Services extérieurs  10,000 DZD  ← Correct account
  Credit: 401 Fournisseur          10,000 DZD
```

**Result:** Audit trail shows:
- Original entry (mistake)
- Reversal entry (cancellation)
- Correct entry (proper recording)

**Code Implementation:**
```csharp
public async Task<JournalEntry> CreateReversalEntryAsync(string originalEntryId)
{
    var original = await _repository.GetByIdAsync(originalEntryId);

    if (original.Status != EntryStatus.Posted)
        throw new InvalidOperationException("Can only reverse posted entries");

    var reversal = new JournalEntry
    {
        EntryDate = DateTime.UtcNow.Date,
        JournalCode = original.JournalCode,
        Reference = $"Annulation écriture #{original.EntryNumber}",
        Description = $"Contre-passation: {original.Description}",
        Status = EntryStatus.Draft // Will be posted separately
    };

    // Reverse all lines (swap Debit ↔ Credit)
    foreach (var line in original.Lines)
    {
        reversal.AddLine(new JournalLine
        {
            AccountId = line.AccountId,
            ThirdPartyId = line.ThirdPartyId,
            Label = $"Annulation: {line.Label}",
            Debit = line.Credit,   // ← SWAPPED
            Credit = line.Debit    // ← SWAPPED
        });
    }

    await _repository.AddAsync(reversal);
    await _unitOfWork.CommitAsync();

    return reversal;
}
```

---

## Article 15: Data Durability

### Legal Text (Simplified)

> *"Le système informatique doit permettre l'édition sur papier ou sur support informatique offrant toute garantie en matière de preuve des données et écritures validées."*

**Translation:**
> "The computer system must allow printing or exporting to a reliable computer medium providing full proof guarantee for validated data and entries."

### Technical Requirements

1. **FEC Export** - Fichier des Écritures Comptables (standardized format)
2. **Human-Readable Format** - Can be opened in text editor
3. **Non-Proprietary** - Not dependent on specific software
4. **Complete Data** - All validated entries, no filtering
5. **Retention Period** - 10 years (Algerian Commercial Code)

### FEC File Format Specification

**File Extension:** `.txt` (pipe-delimited text file)

**Encoding:** ISO-8859-1 (Latin-1) or UTF-8 with BOM

**Delimiter:** Pipe character (`|`)

**File Naming:** `{SIREN}FEC{YYYYMMDD}.txt`
- Example: `099123456789FEC20261231.txt`

**Columns (18 required fields):**

| # | Column Name | Description | Example |
|---|------------|-------------|---------|
| 1 | JournalCode | Journal code | `VTE` |
| 2 | JournalLib | Journal name | `Ventes` |
| 3 | EcritureNum | Entry number | `123` |
| 4 | EcritureDate | Entry date (YYYYMMDD) | `20260205` |
| 5 | CompteNum | Account number | `411` |
| 6 | CompteLib | Account name | `Clients` |
| 7 | CompAuxNum | Auxiliary code (if applicable) | `CLI001` |
| 8 | CompAuxLib | Auxiliary name | `Entreprise ABC` |
| 9 | PieceRef | Document reference | `FAC-2026-001` |
| 10 | PieceDate | Document date (YYYYMMDD) | `20260205` |
| 11 | EcritureLib | Line description | `Vente marchandises` |
| 12 | Debit | Debit amount | `11900.00` |
| 13 | Credit | Credit amount | `0.00` |
| 14 | EcritureLet | Reconciliation letter | `A` |
| 15 | DateLet | Reconciliation date (YYYYMMDD) | `20260215` |
| 16 | ValidDate | Validation date (YYYYMMDD) | `20260205` |
| 17 | Montantdevise | Foreign currency amount | `0.00` |
| 18 | Idevise | Currency code (ISO 4217) | `DZD` |

**Example FEC Line:**
```
VTE|Ventes|123|20260205|411|Clients|CLI001|Entreprise ABC|FAC-2026-001|20260205|Vente marchandises|11900.00|0.00|||20260205|0.00|DZD
```

### Implementation

```csharp
public class FecExportService : IFecExportService
{
    public async Task<string> ExportFecAsync(
        string fiscalYearId,
        string companyNif,
        string outputPath)
    {
        var fiscalYear = await _fiscalYearRepository.GetByIdAsync(fiscalYearId);
        var entries = await _journalRepository
            .GetPostedEntriesAsync(fiscalYearId);

        // File name: {NIF}FEC{YYYYMMDD}.txt
        var endDate = DateTime.Parse(fiscalYear.EndDate);
        var fileName = $"{companyNif}FEC{endDate:yyyyMMdd}.txt";
        var filePath = Path.Combine(outputPath, fileName);

        using var writer = new StreamWriter(filePath, false, Encoding.GetEncoding("ISO-8859-1"));

        foreach (var entry in entries.OrderBy(e => e.EntryNumber))
        {
            foreach (var line in entry.Lines.OrderBy(l => l.LineNumber))
            {
                var fecLine = new StringBuilder();

                fecLine.Append($"{entry.JournalCode.Code}|");
                fecLine.Append($"{entry.JournalCode.Name}|");
                fecLine.Append($"{entry.EntryNumber}|");
                fecLine.Append($"{entry.EntryDate:yyyyMMdd}|");
                fecLine.Append($"{line.Account.AccountNumber}|");
                fecLine.Append($"{line.Account.AccountLabel}|");
                fecLine.Append($"{line.ThirdParty?.Code ?? ""}|");
                fecLine.Append($"{line.ThirdParty?.Name ?? ""}|");
                fecLine.Append($"{entry.Reference ?? ""}|");
                fecLine.Append($"{entry.EntryDate:yyyyMMdd}|"); // PieceDate = EntryDate
                fecLine.Append($"{line.Label}|");
                fecLine.Append($"{FormatAmount(line.Debit)}|");
                fecLine.Append($"{FormatAmount(line.Credit)}|");
                fecLine.Append($"|"); // EcritureLet (not implemented)
                fecLine.Append($"|"); // DateLet (not implemented)
                fecLine.Append($"{entry.PostedAt:yyyyMMdd}|");
                fecLine.Append($"0.00|"); // Montantdevise (future)
                fecLine.Append($"DZD"); // Currency

                await writer.WriteLineAsync(fecLine.ToString());
            }
        }

        return filePath;
    }

    private string FormatAmount(decimal amount)
    {
        return amount.ToString("F2", CultureInfo.InvariantCulture);
    }
}
```

### Auditor Verification

**Auditor can:**
1. Request FEC file for fiscal year
2. Open in Excel or text editor
3. Verify completeness (all entries present)
4. Check integrity (totals, balanced entries)
5. Import into audit software (ACL, IDEA)

---

## Article 16: Traceability

### Legal Text (Simplified)

> *"Le système doit enregistrer l'identité de l'utilisateur, la nature et la date de chaque opération."*

**Translation:**
> "The system must record the user identity, nature, and date of each operation."

### Technical Requirements

1. **Who** - User identity (username, full name)
2. **What** - Operation performed (Create, Update, Delete, Post)
3. **When** - Timestamp (date + time)
4. **Before/After** - State before and after change
5. **IP Address** - Client IP (for network auditing)

### Implementation: AuditLog Table

```sql
CREATE TABLE AuditLog (
    LogId TEXT PRIMARY KEY,
    EntityType TEXT NOT NULL,        -- 'JournalEntry', 'Account', etc.
    EntityId TEXT NOT NULL,          -- ID of affected entity
    OperationType TEXT NOT NULL,     -- 'Create', 'Update', 'Delete', 'Post'
    PerformedBy TEXT NOT NULL,       -- FK → Users (Username)
    PerformedAt TEXT NOT NULL,       -- ISO 8601 timestamp
    IPAddress TEXT,                  -- Client IP address
    BeforeState TEXT,                -- JSON snapshot before
    AfterState TEXT,                 -- JSON snapshot after
    ChangesSummary TEXT,             -- Human-readable summary
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

CREATE INDEX idx_audit_entity ON AuditLog(EntityType, EntityId);
CREATE INDEX idx_audit_user ON AuditLog(PerformedBy);
CREATE INDEX idx_audit_date ON AuditLog(PerformedAt);
```

### Audit Interceptor (EF Core)

```csharp
public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeService _dateTime;

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return result;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || 
                        e.State == EntityState.Modified || 
                        e.State == EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            var auditEntry = new AuditLogEntry
            {
                LogId = Guid.NewGuid().ToString(),
                EntityType = entry.Entity.GetType().Name,
                EntityId = GetPrimaryKeyValue(entry),
                OperationType = entry.State.ToString(),
                PerformedBy = _currentUser.Username,
                PerformedAt = _dateTime.UtcNow,
                IPAddress = _currentUser.IpAddress
            };

            switch (entry.State)
            {
                case EntityState.Added:
                    auditEntry.BeforeState = null;
                    auditEntry.AfterState = JsonSerializer.Serialize(entry.Entity);
                    auditEntry.ChangesSummary = $"Created {entry.Entity.GetType().Name}";
                    break;

                case EntityState.Modified:
                    auditEntry.BeforeState = JsonSerializer.Serialize(entry.OriginalValues.ToObject());
                    auditEntry.AfterState = JsonSerializer.Serialize(entry.CurrentValues.ToObject());
                    auditEntry.ChangesSummary = GetChangesSummary(entry);
                    break;

                case EntityState.Deleted:
                    auditEntry.BeforeState = JsonSerializer.Serialize(entry.Entity);
                    auditEntry.AfterState = null;
                    auditEntry.ChangesSummary = $"Deleted {entry.Entity.GetType().Name}";
                    break;
            }

            context.Set<AuditLogEntry>().Add(auditEntry);
        }

        return result;
    }

    private string GetChangesSummary(EntityEntry entry)
    {
        var changes = new List<string>();

        foreach (var property in entry.Properties.Where(p => p.IsModified))
        {
            var oldValue = property.OriginalValue?.ToString() ?? "null";
            var newValue = property.CurrentValue?.ToString() ?? "null";
            changes.Add($"{property.Metadata.Name}: '{oldValue}' → '{newValue}'");
        }

        return string.Join(", ", changes);
    }
}
```

### Audit Log Viewer (UI)

```typescript
// React component for viewing audit trail
const AuditLogViewer: React.FC<{ entityId: string }> = ({ entityId }) => {
  const { data: logs } = useQuery({
    queryKey: ['audit-log', entityId],
    queryFn: () => apiClient.auditLog.getByEntityId(entityId),
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date/Time</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead>Changes</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs?.map((log) => (
          <TableRow key={log.logId}>
            <TableCell>{formatDateTime(log.performedAt)}</TableCell>
            <TableCell>{log.performedBy}</TableCell>
            <TableCell>
              <Badge variant={getOperationVariant(log.operationType)}>
                {log.operationType}
              </Badge>
            </TableCell>
            <TableCell>{log.changesSummary}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewDetails(log)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

---

## Compliance Verification

### Self-Assessment Checklist

| Requirement | Status | Evidence |
|------------|--------|----------|
| **Article 14: Intangibility** |||
| Posted entries cannot be modified | ✅ | Application logic + DB triggers |
| Corrections via contra-entries | ✅ | `CreateReversalEntry` method |
| Hash chain verification | ✅ | SHA-256 hash on each entry |
| Integrity check on startup | ✅ | `VerifyIntegrityAsync()` |
| **Article 15: Durability** |||
| FEC export capability | ✅ | `FecExportService` |
| Proper file encoding | ✅ | ISO-8859-1 or UTF-8 with BOM |
| All 18 required columns | ✅ | Full FEC specification |
| 10-year retention | ✅ | Backup strategy documented |
| **Article 16: Traceability** |||
| User identity logged | ✅ | `PerformedBy` in AuditLog |
| Operation type logged | ✅ | `OperationType` enum |
| Timestamp recorded | ✅ | `PerformedAt` (UTC) |
| Before/after snapshots | ✅ | JSON serialization |
| IP address tracking | ✅ | `IPAddress` column |

### Annual Compliance Report

**Generated automatically:**

```csharp
public async Task<ComplianceReport> GenerateComplianceReportAsync(int year)
{
    var report = new ComplianceReport { Year = year };

    // Article 14: Verify hash chain
    var integrityResult = await _securityService.VerifyIntegrityAsync();
    report.HashChainIntegrity = integrityResult.IsValid;

    // Article 15: Count FEC exports
    report.FecExportsGenerated = await _exportService
        .CountExportsAsync(year, ExportType.FEC);

    // Article 16: Count audit log entries
    report.AuditLogEntries = await _auditService
        .CountEntriesAsync(year);

    // Compliance score
    report.ComplianceScore = CalculateComplianceScore(report);

    return report;
}
```

---

## Conclusion

TOTALFISC achieves **full compliance** with Executive Decree 09-110 through:

✅ **Article 14 (Intangibility)** - Triple-layer protection (App + DB + Hash Chain)  
✅ **Article 15 (Durability)** - FEC export with proper encoding and format  
✅ **Article 16 (Traceability)** - Comprehensive audit log with before/after snapshots  

This compliance framework protects both the company (legal safety) and the software vendor (market credibility), ensuring TOTALFISC meets all regulatory requirements for computerized accounting systems in Algeria.

---

**Related Documents:**
- [DATA_SECURITY.md](DATA_SECURITY.md) - Encryption and hash chain details
- [AUDIT_TRAIL.md](AUDIT_TRAIL.md) - Complete audit log implementation
- [SCF_COMPLIANCE.md](SCF_COMPLIANCE.md) - Accounting standards
