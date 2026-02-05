# FISCAL_YEAR_MANAGEMENT.md
# TOTALFISC - Fiscal Year Management

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Compliance:** SCF + Decree 09-110  

---

## Table of Contents

1. [Fiscal Year Overview](#fiscal-year-overview)
2. [Creating a Fiscal Year](#creating-a-fiscal-year)
3. [Opening Balances](#opening-balances)
4. [Year-End Closing](#year-end-closing)
5. [Result Transfer](#result-transfer)
6. [Reopening a Year](#reopening-a-year)
7. [Multi-Year Operations](#multi-year-operations)

---

## Fiscal Year Overview

### What is a Fiscal Year?

In Algeria, the **fiscal year (exercice comptable)** corresponds to the calendar year:
- **Start Date:** January 1
- **End Date:** December 31
- **Duration:** 12 months

### Fiscal Year Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│              FISCAL YEAR LIFECYCLE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CREATION                                                │
│     ├─► Create fiscal year entity                           │
│     ├─► Set start/end dates                                 │
│     └─► Status: Pending                                     │
│                                                              │
│  2. OPENING                                                 │
│     ├─► Import opening balances (à-nouveaux)                │
│     ├─► Verify balance sheet accounts                       │
│     └─► Status: Open                                        │
│                                                              │
│  3. OPERATIONS (12 months)                                  │
│     ├─► Daily journal entries                               │
│     ├─► Monthly reconciliations                             │
│     └─► Interim reporting                                   │
│                                                              │
│  4. PRE-CLOSING                                             │
│     ├─► Verify all entries posted                           │
│     ├─► Generate final reports                              │
│     ├─► Auditor review                                      │
│     └─► Status: Locked                                      │
│                                                              │
│  5. CLOSING                                                 │
│     ├─► Close revenue/expense accounts (6 & 7)              │
│     ├─► Calculate net result                                │
│     ├─► Transfer result to capital (Class 1)                │
│     └─► Status: Closed                                      │
│                                                              │
│  6. NEW YEAR OPENING                                        │
│     ├─► Create next fiscal year                             │
│     ├─► Transfer closing balances → opening balances        │
│     └─► Begin new cycle                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fiscal Year States

| State | Description | Can Create Entries? | Can Modify? |
|-------|-------------|---------------------|-------------|
| **Pending** | Created, not yet opened | ❌ No | ✅ Yes |
| **Open** | Active, accepting entries | ✅ Yes | ✅ Yes (drafts) |
| **Locked** | Pre-closing verification | ❌ No | ❌ No |
| **Closed** | Year-end closed | ❌ No | ❌ No |

---

## Creating a Fiscal Year

### Prerequisites

✅ Previous year closed (if exists)  
✅ Chart of accounts configured  
✅ Opening balances prepared  

### Step-by-Step Creation

#### Step 1: Navigate to Fiscal Years

Click **"Fiscal Years"** in sidebar

#### Step 2: Create New Year

Click **[+ New Fiscal Year]**

#### Step 3: Fill Form

```
Year Number:         2027
Start Date:          01/01/2027 📅
End Date:            31/12/2027 📅
Description:         Exercice comptable 2027
Status:              Pending ▼
```

#### Step 4: Save

Click **[Create]**

### Domain Model

```csharp
public class FiscalYear
{
    public string FiscalYearId { get; set; }
    public int YearNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public FiscalYearStatus Status { get; set; }

    // Calculated fields
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public decimal NetResult { get; set; }

    // Audit trail
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? ClosedBy { get; set; }
}

public enum FiscalYearStatus
{
    Pending,   // Created but not opened
    Open,      // Active, accepting entries
    Locked,    // Pre-closing, read-only
    Closed     // Year-end closed, archived
}
```

---

## Opening Balances

### What are Opening Balances (À-Nouveaux)?

Opening balances are the **starting values** for balance sheet accounts (Classes 1-5) at the beginning of a fiscal year. They come from the **closing balances** of the previous year.

### Accounts Carried Forward

✅ **Yes - Balance Sheet Accounts (Classes 1-5):**
- Class 1: Capital, reserves, retained earnings
- Class 2: Fixed assets
- Class 3: Inventory
- Class 4: Third party accounts (clients, suppliers)
- Class 5: Financial accounts (bank, cash)

❌ **No - Income Statement Accounts (Classes 6-7):**
- Class 6: Expenses (start at zero)
- Class 7: Revenue (start at zero)

### Creating Opening Balances

#### Method 1: Automatic (From Previous Year)

**If previous year exists in system:**

```sql
-- Automatically transfer closing → opening
INSERT INTO JournalLines (
    EntryId,
    AccountId,
    Debit,
    Credit,
    Label
)
SELECT 
    @NewEntryId,
    AccountId,
    ClosingDebit,
    ClosingCredit,
    'À-nouveau exercice ' || @NewYear
FROM TrialBalanceView
WHERE FiscalYearId = @PreviousYearId
  AND AccountClass IN (1, 2, 3, 4, 5)
  AND (ClosingDebit != 0 OR ClosingCredit != 0);
```

#### Method 2: Manual Entry (First Year)

**Steps:**
1. Create journal entry with code **"AN"** (À-nouveaux)
2. Enter opening balance for each account:

```
Entry Date:    01/01/2027
Journal:       AN - À-nouveaux
Reference:     AN-2027
Description:   Balances d'ouverture 2027

Lines:
┌──────────┬─────────────────────┬────────────┬────────────┐
│ Account  │ Label               │ Debit      │ Credit     │
├──────────┼─────────────────────┼────────────┼────────────┤
│ 411      │ Clients (solde)     │ 150,000.00 │       -    │
│ 512      │ Banque BADR         │  50,000.00 │       -    │
│ 53       │ Caisse              │   5,000.00 │       -    │
│ 401      │ Fournisseurs        │       -    │  80,000.00 │
│ 10       │ Capital             │       -    │ 100,000.00 │
│ 12       │ Résultat N-1        │       -    │  25,000.00 │
├──────────┴─────────────────────┼────────────┼────────────┤
│ TOTAUX                         │ 205,000.00 │ 205,000.00 │
└────────────────────────────────┴────────────┴────────────┘
```

3. **Important:** Entry must be balanced!
4. Post entry

#### Method 3: Import (From External System)

**For migration from PCCOMPTA or other systems:**

1. Export trial balance from old system (CSV)
2. Click **Import** → **Opening Balances**
3. Map columns:
   ```
   CSV Column          → System Field
   ──────────────────────────────────
   "N° Compte"         → Account Number
   "Libellé"           → Account Label
   "Solde Débiteur"    → Debit
   "Solde Créditeur"   → Credit
   ```
4. Preview import
5. Confirm and create entry

---

## Year-End Closing

### Pre-Closing Checklist

Before closing the fiscal year, verify:

✅ **All entries posted**
```sql
SELECT COUNT(*) 
FROM JournalEntries 
WHERE FiscalYearId = 'fy-2026' 
  AND Status = 'Draft';
-- Must return 0
```

✅ **All entries balanced**
```sql
SELECT EntryId, TotalDebit, TotalCredit
FROM JournalEntries
WHERE FiscalYearId = 'fy-2026'
  AND ABS(TotalDebit - TotalCredit) > 0.01;
-- Must return 0 rows
```

✅ **Trial balance equals zero**
```sql
SELECT 
    SUM(TotalDebit) AS TotalDebit,
    SUM(TotalCredit) AS TotalCredit,
    SUM(TotalDebit) - SUM(TotalCredit) AS Difference
FROM JournalEntries
WHERE FiscalYearId = 'fy-2026';
-- Difference must be 0
```

✅ **Bank reconciliations complete**
✅ **Inventory count finalized**
✅ **Depreciation calculated**
✅ **VAT declarations filed**

### Closing Process

#### Step 1: Lock Fiscal Year

```
Click: Fiscal Years → 2026 → [Lock Year]

This prevents:
- Creating new entries
- Modifying existing entries
- Deleting entries
```

#### Step 2: Generate Final Reports

Generate all mandatory reports:
1. Trial Balance (Balance finale)
2. General Ledger (Grand livre)
3. Balance Sheet (Bilan)
4. Income Statement (Compte de résultat)
5. Cash Flow Statement (Tableau de flux)

**Export to PDF for archiving**

#### Step 3: Auditor Review

If required:
- Provide reports to external auditor
- Address any findings
- Obtain approval to close

#### Step 4: Execute Closing

```
Click: Fiscal Years → 2026 → [Close Year]

Warning Dialog:
┌────────────────────────────────────────────┐
│ ⚠️  ATTENTION - OPÉRATION IRRÉVERSIBLE     │
├────────────────────────────────────────────┤
│                                            │
│ Vous êtes sur le point de clôturer        │
│ l'exercice comptable 2026.                │
│                                            │
│ Cette opération :                          │
│ • Fermera définitivement l'exercice       │
│ • Créera les écritures de clôture         │
│ • Transférera le résultat en réserves     │
│ • Générera les à-nouveaux pour 2027       │
│                                            │
│ Êtes-vous sûr de vouloir continuer ?      │
│                                            │
│         [Annuler]      [Confirmer]         │
└────────────────────────────────────────────┘
```

Click **[Confirmer]**

#### Step 5: System Executes Closing

The system automatically:

**5.1. Close Revenue Accounts (Class 7)**

Create closing entry to transfer all revenue to account **130** (Résultat):

```
Entry Date:    31/12/2026
Journal:       OD
Reference:     CLO-2026-REV
Description:   Clôture comptes produits

Lines:
┌──────────┬─────────────────────┬────────────┬────────────┐
│ Account  │ Label               │ Debit      │ Credit     │
├──────────┼─────────────────────┼────────────┼────────────┤
│ 700      │ Ventes marchandises │ 500,000.00 │       -    │
│ 74       │ Subventions         │  20,000.00 │       -    │
│ 130      │ Résultat exercice   │       -    │ 520,000.00 │
└──────────┴─────────────────────┴────────────┴────────────┘
```

**5.2. Close Expense Accounts (Class 6)**

```
Entry Date:    31/12/2026
Journal:       OD
Reference:     CLO-2026-EXP
Description:   Clôture comptes charges

Lines:
┌──────────┬─────────────────────┬────────────┬────────────┐
│ Account  │ Label               │ Debit      │ Credit     │
├──────────┼─────────────────────┼────────────┼────────────┤
│ 130      │ Résultat exercice   │ 450,000.00 │       -    │
│ 60       │ Achats              │       -    │ 300,000.00 │
│ 61       │ Services extérieurs │       -    │ 100,000.00 │
│ 63       │ Charges personnel   │       -    │  50,000.00 │
└──────────┴─────────────────────┴────────────┴────────────┘
```

**5.3. Calculate Net Result**

```
Result = Revenue - Expenses
       = 520,000 - 450,000
       = 70,000 DZD (Profit)
```

**5.4. Transfer Result**

Transfer from temporary account (130) to permanent account (120):

```
Entry Date:    31/12/2026
Journal:       OD
Reference:     CLO-2026-RES
Description:   Affectation résultat

Lines:
┌──────────┬─────────────────────┬────────────┬────────────┐
│ Account  │ Label               │ Debit      │ Credit     │
├──────────┼─────────────────────┼────────────┼────────────┤
│ 130      │ Résultat exercice   │  70,000.00 │       -    │
│ 120      │ Résultat net N      │       -    │  70,000.00 │
└──────────┴─────────────────────┴────────────┴────────────┘
```

**5.5. Generate Opening Balances for 2027**

Transfer closing balances → opening balances (see Opening Balances section)

**5.6. Update Fiscal Year Status**

```sql
UPDATE FiscalYears
SET Status = 'Closed',
    ClosedAt = CURRENT_TIMESTAMP,
    ClosedBy = @CurrentUserId,
    NetResult = 70000.00
WHERE FiscalYearId = 'fy-2026';
```

---

## Result Transfer

### What is Result Transfer?

After closing, the **net result** (profit or loss) must be allocated according to company bylaws:

### Allocation Options

#### Option 1: Retained Earnings

Transfer entire result to retained earnings:

```
Account 120 → Account 110 (Retained Earnings)
```

#### Option 2: Reserves

Transfer to legal or statutory reserves:

```
Account 120 → Account 106 (Reserves)
```

#### Option 3: Dividend Distribution

Distribute to shareholders:

```
Account 120 → Account 457 (Dividends Payable)
```

#### Option 4: Mixed Allocation

Example: 50% reserves, 50% dividends

```
Entry:
┌──────────┬─────────────────────┬────────────┬────────────┐
│ Account  │ Label               │ Debit      │ Credit     │
├──────────┼─────────────────────┼────────────┼────────────┤
│ 120      │ Résultat net 2026   │  70,000.00 │       -    │
│ 106      │ Réserves            │       -    │  35,000.00 │
│ 457      │ Dividendes à payer  │       -    │  35,000.00 │
└──────────┴─────────────────────┴────────────┴────────────┘
```

### Loss Treatment

If net result is **negative (loss)**:

```
Entry:
┌──────────┬─────────────────────┬────────────┬────────────┐
│ Account  │ Label               │ Debit      │ Credit     │
├──────────┼─────────────────────┼────────────┼────────────┤
│ 119      │ Report à nouveau    │  20,000.00 │       -    │
│ 120      │ Résultat net (perte)│       -    │  20,000.00 │
└──────────┴─────────────────────┴────────────┴────────────┘
```

---

## Reopening a Year

### When to Reopen?

**Reasons:**
- Auditor found errors
- Missing transactions discovered
- Tax authority adjustments required

**Requirements:**
- Next year must not be closed
- Authorization from administrator
- Valid business reason

### Reopening Process

```
Click: Fiscal Years → 2026 → [Reopen Year]

Warning Dialog:
┌────────────────────────────────────────────┐
│ ⚠️  RÉOUVERTURE D'EXERCICE                 │
├────────────────────────────────────────────┤
│                                            │
│ Vous allez rouvrir l'exercice 2026.       │
│                                            │
│ Cette opération :                          │
│ • Annulera les écritures de clôture       │
│ • Permettra les modifications             │
│ • Nécessitera une nouvelle clôture        │
│                                            │
│ Raison : [____________________________]    │
│                                            │
│         [Annuler]      [Confirmer]         │
└────────────────────────────────────────────┘
```

System will:
1. Void closing entries
2. Change status: Closed → Open
3. Log reopening in audit trail
4. Notify users

**After corrections:**
- Re-close fiscal year
- Update reports
- Notify affected parties

---

## Multi-Year Operations

### Comparative Reports

Generate reports comparing multiple years:

```
Report: Income Statement
Years:  2024, 2025, 2026

┌─────────────────┬───────────┬───────────┬───────────┐
│ Account         │ 2024      │ 2025      │ 2026      │
├─────────────────┼───────────┼───────────┼───────────┤
│ 70 - Ventes     │ 400,000   │ 450,000   │ 500,000   │
│ 60 - Achats     │ 250,000   │ 280,000   │ 300,000   │
│ Résultat        │  50,000   │  60,000   │  70,000   │
└─────────────────┴───────────┴───────────┴───────────┘
```

### Cross-Year Queries

Query journal entries across multiple years:

```sql
SELECT 
    fy.YearNumber,
    COUNT(je.EntryId) AS TotalEntries,
    SUM(je.TotalDebit) AS TotalAmount
FROM JournalEntries je
JOIN FiscalYears fy ON je.FiscalYearId = fy.FiscalYearId
WHERE fy.YearNumber BETWEEN 2024 AND 2026
GROUP BY fy.YearNumber;
```

### Archiving Old Years

For years older than 10 years:

1. Export complete data (database + PDFs)
2. Store on external media
3. (Optional) Remove from active database
4. Maintain audit trail of archive

---

## Best Practices

### DO ✅

- Close fiscal year within 3 months of year-end
- Generate all reports before closing
- Keep PDF exports of all reports
- Document any reopening reasons
- Maintain consistent closing procedures

### DON'T ❌

- Close year with unposted entries
- Skip auditor review (if required)
- Forget to backup before closing
- Reopen year without valid reason
- Modify closed year entries

---

## Conclusion

Fiscal year management is **critical** for compliance and accurate financial reporting. Follow this guide carefully to ensure proper year-end procedures and maintain audit trail integrity.

**Key Takeaways:**
- ✅ One fiscal year per calendar year
- ✅ Open with à-nouveaux entries
- ✅ Close with result transfer
- ✅ Closing is irreversible (normally)
- ✅ Maintain complete documentation

---

**Related Documents:**
- [USER_GUIDE.md](USER_GUIDE.md) - Daily operations
- [REPORTING_GUIDE.md](REPORTING_GUIDE.md) - Report generation
- [SCF_COMPLIANCE.md](SCF_COMPLIANCE.md) - Accounting standards
