# SCF_COMPLIANCE.md
# TOTALFISC - SCF Compliance Guide

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Regulation:** Système Comptable Financier (Law 07-11 of November 25, 2007)  

---

## Table of Contents

1. [SCF Overview](#scf-overview)
2. [SCF vs PCN](#scf-vs-pcn)
3. [Chart of Accounts (Classes 1-7)](#chart-of-accounts-classes-1-7)
4. [Account Structure & Hierarchy](#account-structure--hierarchy)
5. [Auxiliary Accounts (Comptes Auxiliaires)](#auxiliary-accounts-comptes-auxiliaires)
6. [Year-End Closing Procedures](#year-end-closing-procedures)
7. [Implementation in TOTALFISC](#implementation-in-TOTALFISC)
8. [Tableau de Passage (PCN → SCF)](#tableau-de-passage-pcn--scf)

---

## SCF Overview

### What is SCF?

The **Système Comptable Financier** (SCF) is Algeria's accounting framework, adopted via **Law 07-11** on November 25, 2007, and implemented starting January 1, 2010.

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Framework** | Based on International Financial Reporting Standards (IFRS) |
| **Approach** | Principles-based (vs rules-based PCN) |
| **Scope** | All economic entities (companies, associations, public establishments) |
| **Language** | Official version in French; Arabic translation available |
| **Classes** | 7 main classes (1-7) with detailed sub-accounts |
| **Basis** | Accrual accounting (comptabilité d'engagement) |

### SCF Components

1. **Accounting Framework** - Conceptual basis, principles, conventions
2. **Financial Statements** - Balance Sheet, Income Statement, Cash Flow, Notes
3. **Chart of Accounts** - Standardized account numbering (Classes 1-7)
4. **Recording Rules** - How to record transactions
5. **Recognition & Measurement** - Asset valuation, depreciation, provisions

---

## SCF vs PCN

### Evolution from PCN to SCF

| Aspect | PCN (Pre-2010) | SCF (2010+) |
|--------|----------------|-------------|
| **Inspiration** | French Plan Comptable Général (1982) | IFRS/IAS |
| **Philosophy** | Rules-based | Principles-based |
| **Classes** | 8 classes (0-8) | 7 classes (1-7) |
| **Account 0** | Capital commitments (off-balance) | Eliminated |
| **Account 8** | Special accounts | Eliminated |
| **Fair Value** | Not allowed | Permitted for certain assets |
| **Consolidation** | Limited guidance | Comprehensive IFRS-based rules |
| **Notes** | Minimal disclosure | Extensive narrative disclosures |

### Why the Change?

1. **Globalization** - Align with international standards for foreign investment
2. **Transparency** - More detailed financial reporting
3. **Economic Reality** - Fair value reflects market conditions
4. **Comparability** - Enables comparison with international companies

---

## Chart of Accounts (Classes 1-7)

### Overview

```
┌────────────────────────────────────────────────────────────┐
│  CLASS 1: Capitaux propres (Equity)                        │
│  • Capital, Reserves, Retained Earnings                    │
├────────────────────────────────────────────────────────────┤
│  CLASS 2: Comptes d'immobilisations (Non-Current Assets)  │
│  • Tangible, Intangible, Financial Investments            │
├────────────────────────────────────────────────────────────┤
│  CLASS 3: Comptes de stocks (Inventory)                   │
│  • Raw materials, WIP, Finished goods                     │
├────────────────────────────────────────────────────────────┤
│  CLASS 4: Comptes de tiers (Third Parties)                │
│  • Clients (411), Suppliers (401), Taxes, Social Security │
├────────────────────────────────────────────────────────────┤
│  CLASS 5: Comptes financiers (Financial Accounts)         │
│  • Bank (512), Cash (53), Securities                      │
├────────────────────────────────────────────────────────────┤
│  CLASS 6: Comptes de charges (Expenses)                   │
│  • Operating expenses, Depreciation, Financial charges    │
├────────────────────────────────────────────────────────────┤
│  CLASS 7: Comptes de produits (Revenue)                   │
│  • Sales, Financial income, Extraordinary income          │
└────────────────────────────────────────────────────────────┘
```

---

## Detailed Account Classes

### Class 1: Capitaux propres (Equity)

**Nature:** Balance Sheet - Liabilities (Passi)

**Purpose:** Owner's equity, capital, reserves, retained earnings

#### Key Accounts

```
10  Capital (Share Capital)
    101 Capital social
    102 Capital non appelé (-)
    103 Capital souscrit appelé, non versé
    104 Capital souscrit appelé, versé
    105 Primes liées au capital

11  Réserves (Reserves)
    111 Réserve légale
    112 Réserves statutaires
    113 Réserves réglementées
    118 Autres réserves

12  Report à nouveau (Retained Earnings)
    120 Report à nouveau créditeur
    129 Report à nouveau débiteur (-)

13  Résultat net de l'exercice (Net Income)
    130 Résultat net: bénéfice
    139 Résultat net: perte (-)

15  Provisions (Long-term Provisions)
    151 Provisions pour risques
    153 Provisions pour pensions
```

**Year-End Behavior:** **Carry forward to next year** (not reset to zero)

---

### Class 2: Comptes d'immobilisations (Non-Current Assets)

**Nature:** Balance Sheet - Assets (Actif)

**Purpose:** Long-term assets used in operations

#### Key Accounts

```
20  Immobilisations incorporelles (Intangible Assets)
    201 Frais de développement
    203 Logiciels (Software)
    204 Brevets, licences (Patents, Licenses)
    205 Fonds commercial (Goodwill)
    208 Autres immobilisations incorporelles

21  Immobilisations corporelles (Tangible Assets)
    211 Terrains (Land)
    213 Constructions (Buildings)
    215 Installations techniques (Equipment)
    218 Matériel de transport (Vehicles)
    2183 Matériel informatique (IT Equipment)

23  Immobilisations en cours (Assets under Construction)
    232 Immobilisations corporelles en cours
    237 Avances et acomptes versés

24  Immobilisations financières (Financial Investments)
    241 Titres de participation (Equity investments)
    267 Créances rattachées à des participations

28  Amortissements des immobilisations (Accumulated Depreciation)
    280 Amortissements incorporelles (-)
    281 Amortissements corporelles (-)

29  Pertes de valeur (Impairment Losses)
    290 Pertes de valeur incorporelles (-)
    291 Pertes de valeur corporelles (-)
```

**Depreciation Example:**
```
Debit:  681 Dotations aux amortissements (Expense)
Credit: 281xx Amortissement du matériel (Accumulated Depreciation)
```

**Year-End Behavior:** **Carry forward** (Net Book Value = Cost - Accumulated Depreciation)

---

### Class 3: Comptes de stocks (Inventory)

**Nature:** Balance Sheet - Assets (Actif)

**Purpose:** Goods held for sale or production

#### Key Accounts

```
30  Stocks de marchandises (Goods for Resale)
    300 Marchandises

31  Matières premières (Raw Materials)
    310 Matières premières

32  Autres approvisionnements (Other Supplies)
    321 Matières consommables
    322 Fournitures consommables

33  En-cours de production de biens (WIP - Goods)
    331 Produits en cours

34  En-cours de production de services (WIP - Services)
    341 Études en cours

35  Stocks de produits finis (Finished Goods)
    355 Produits finis

39  Pertes de valeur sur stocks (Inventory Write-downs)
    390 Marchandises (-)
    391 Matières premières (-)
```

**Valuation Methods:**
- **FIFO** (First In, First Out) - Most common
- **Weighted Average Cost** - Acceptable
- **LIFO** (Last In, First Out) - **NOT allowed under SCF**

**Year-End Behavior:** **Carry forward** (physical count + valuation adjustment)

---

### Class 4: Comptes de tiers (Third Parties)

**Nature:** Balance Sheet - Assets & Liabilities

**Purpose:** Amounts owed by or to third parties

#### Key Accounts

```
40  Fournisseurs (Suppliers/Vendors)
    401 Fournisseurs de stocks (Inventory suppliers)
    404 Fournisseurs d'immobilisations (Asset suppliers)
    408 Fournisseurs - Factures non parvenues (Accrued expenses)
    409 Fournisseurs débiteurs (Supplier advances)

41  Clients (Customers)
    411 Clients (Accounts receivable)
    413 Clients - Effets à recevoir (Notes receivable)
    416 Clients douteux (Doubtful accounts)
    419 Clients créditeurs (Customer advances)

42  Personnel et comptes rattachés (Employees & Payroll)
    421 Personnel - Rémunérations dues (Salaries payable)
    422 Fonds des œuvres sociales (Social fund)
    425 Personnel - Avances et acomptes (Employee advances)
    428 Personnel - Charges à payer (Accrued payroll)

43  Organismes sociaux (Social Security)
    431 Sécurité sociale (CNAS, CASNOS)
    437 Autres organismes sociaux

44  État et collectivités publiques (Government & Taxes)
    441 État - Subventions à recevoir (Government grants receivable)
    442 État - Impôts et taxes recouvrables (Tax recoverable)
    444 État - Impôts sur les résultats (Corporate income tax)
    445 État - Taxes sur le chiffre d'affaires (VAT)
        4456 TVA déductible (VAT deductible) [DEBIT]
        4457 TVA collectée (VAT collected) [CREDIT]
    447 Autres impôts, taxes et versements assimilés

45  Groupe et associés (Group & Partners)
    451 Opérations groupe (Intercompany)
    455 Associés - Comptes courants (Partner current accounts)
    456 Associés - Opérations sur le capital (Capital operations)
```

**Special Rules:**

**Auxiliary Accounts:**
- Account 411 (Clients) must be detailed per client: `411001, 411002, ...`
- Account 401 (Fournisseurs) must be detailed per supplier: `401001, 401002, ...`
- Each auxiliary account links to a `ThirdParty` record (NIF, NIS, RC)

**TVA (VAT) Mechanism:**
```
Sale Example (19% TVA):
  Debit:  411 Client                  11,900 DZD (Total TTC)
  Credit: 4457 TVA collectée           1,900 DZD (VAT collected)
  Credit: 700 Ventes marchandises    10,000 DZD (Net HT)

Purchase Example (19% TVA):
  Debit:  600 Achats                  10,000 DZD (Net HT)
  Debit:  4456 TVA déductible          1,900 DZD (VAT deductible)
  Credit: 401 Fournisseur             11,900 DZD (Total TTC)

TVA Payment to Tax Authority:
  Debit:  4457 TVA collectée          10,000 DZD
  Credit: 4456 TVA déductible          7,000 DZD
  Credit: 512 Banque                   3,000 DZD (Net payment)
```

**Year-End Behavior:** **Carry forward** (outstanding balances continue)

---

### Class 5: Comptes financiers (Financial Accounts)

**Nature:** Balance Sheet - Assets (Actif)

**Purpose:** Cash and cash equivalents

#### Key Accounts

```
50  Valeurs mobilières de placement (Marketable Securities)
    503 Actions
    506 Obligations

51  Banques, établissements financiers (Banks)
    512 Banques comptes courants (Bank current accounts)
        5121 Banque CPA Alger
        5122 Banque BNA Constantine
        5123 Banque BEA Oran
    514 Chèques postaux (Postal checks)

53  Caisse (Cash on Hand)
    530 Caisse siège (Head office cash)
    531 Caisse succursale (Branch cash)

54  Régies d'avances et accréditifs (Petty Cash)
    540 Régies d'avances (Advance funds)

58  Virements internes (Internal Transfers)
    580 Virements internes (Inter-account transfers)
```

**Bank Reconciliation:**
- Compare `512xxx` balances with bank statements
- Identify timing differences (outstanding checks, deposits in transit)
- Adjust for bank errors or fees

**Year-End Behavior:** **Carry forward** (cash balances continue)

---

### Class 6: Comptes de charges (Expenses)

**Nature:** Income Statement (Profit & Loss)

**Purpose:** Operating and non-operating expenses

#### Key Accounts

```
60  Achats consommés (Purchases Consumed)
    600 Achats de marchandises vendues
    601 Matières premières
    602 Autres approvisionnements

61  Services extérieurs (External Services)
    611 Sous-traitance générale
    613 Locations (Rent)
    614 Charges locatives
    615 Entretien et réparations
    616 Primes d'assurances

62  Autres services extérieurs (Other External Services)
    622 Rémunérations d'intermédiaires (Commissions)
    623 Publicité, publications (Advertising)
    625 Déplacements, missions (Travel)
    626 Frais postaux et de télécommunications
    628 Frais bancaires (Bank charges)

63  Charges de personnel (Personnel Expenses)
    631 Salaires, appointements (Wages & salaries)
    635 Cotisations aux organismes sociaux (Social security)

64  Impôts, taxes et versements assimilés (Taxes)
    641 Impôts et taxes directs (Direct taxes)
    645 Autres impôts et taxes (Other taxes)
        TAP (Taxe sur l'Activité Professionnelle)

65  Autres charges opérationnelles (Other Operating Expenses)
    655 Amendes et pénalités (Fines & penalties)
    658 Charges diverses de gestion courante

66  Charges financières (Financial Expenses)
    661 Charges d'intérêt (Interest expense)
    666 Pertes de change (Foreign exchange losses)

68  Dotations aux amortissements et provisions (Depreciation & Provisions)
    681 Dotations aux amortissements (Depreciation expense)
    685 Dotations aux provisions (Provision expense)

69  Impôts sur les bénéfices (Income Tax)
    695 IBS (Impôt sur les Bénéfices des Sociétés)
```

**Year-End Behavior:** **RESET TO ZERO** (transferred to Class 1 - Result)

---

### Class 7: Comptes de produits (Revenue)

**Nature:** Income Statement (Profit & Loss)

**Purpose:** Operating and non-operating income

#### Key Accounts

```
70  Ventes de marchandises et de produits (Sales)
    700 Ventes de marchandises
    701 Ventes de produits finis
    702 Ventes de produits intermédiaires
    704 Ventes de travaux
    705 Ventes d'études
    706 Prestations de services

71  Production stockée (Change in Inventory)
    713 Variation des stocks (en-cours de production)
    714 Variation des stocks (produits finis)

72  Production immobilisée (Capitalized Production)
    721 Immobilisations incorporelles
    722 Immobilisations corporelles

73  Produits des activités annexes (Ancillary Income)
    732 Produits des immeubles non affectés (Rental income)

75  Autres produits opérationnels (Other Operating Income)
    755 Quotes-parts de résultat (Profit sharing)
    758 Produits divers de gestion courante

76  Produits financiers (Financial Income)
    761 Produits de participations (Dividend income)
    762 Revenus des actifs financiers (Interest income)
    766 Gains de change (Foreign exchange gains)

78  Reprises sur pertes de valeur et provisions (Reversal of Provisions)
    781 Reprises d'amortissements (Reversal of depreciation)
    785 Reprises de provisions (Reversal of provisions)
```

**Year-End Behavior:** **RESET TO ZERO** (transferred to Class 1 - Result)

---

## Account Structure & Hierarchy

### Numbering System

**Format:** Hierarchical with increasing precision

```
X       Class (1-7)
XX      Division (10, 11, 12)
XXX     Subdivision (101, 102, 103)
XXXX    Detail (1011, 1012, 1013)
XXXXX+  Enterprise-specific extensions
```

**Example: Cash Accounts**

```
5       Comptes financiers
53      Caisse
530     Caisse siège
5301    Caisse principale
5302    Caisse secondaire
```

### Summary vs Detail Accounts

| Type | Definition | Posting Allowed? | Example |
|------|-----------|------------------|---------|
| **Summary** | Parent account with children | ❌ No | `51 Banques` |
| **Detail** | Leaf account (no children) | ✅ Yes | `5121 Banque CPA` |

**Implementation:**
```sql
Accounts Table:
  • IsSummary = 1 → Cannot post to this account
  • IsSummary = 0 → Can post journal entries
```

---

## Auxiliary Accounts (Comptes Auxiliaires)

### Concept

Certain accounts require detailed tracking per third party:

| Account | Type | Auxiliary Required |
|---------|------|-------------------|
| **411** | Clients | ✅ Yes (per client) |
| **401** | Fournisseurs | ✅ Yes (per supplier) |
| **421** | Personnel | ✅ Yes (per employee) |
| **455** | Associés | ✅ Yes (per partner) |
| **512** | Banques | ❌ No (each bank is an account) |

### Implementation

**Database Structure:**
```
Accounts Table:
  • IsAuxiliary = 1 (e.g., 411)

JournalLines Table:
  • AccountId = '411-id'
  • ThirdPartyId = 'client-xyz-id' ← REQUIRED when IsAuxiliary=1
```

**Example:**

```sql
-- Account 411 (Clients) is marked as auxiliary
INSERT INTO Accounts (AccountId, AccountNumber, IsAuxiliary)
VALUES ('acc-411', '411', 1);

-- Third party: Client "Entreprise ABC"
INSERT INTO ThirdParties (ThirdPartyId, Code, Name, NIF)
VALUES ('tp-abc', 'CLI001', 'Entreprise ABC', '099123456789012');

-- Journal line MUST link both account and third party
INSERT INTO JournalLines (LineId, EntryId, AccountId, ThirdPartyId, Debit)
VALUES ('line-1', 'entry-1', 'acc-411', 'tp-abc', '10000');
```

**Business Rule:**
```csharp
if (account.IsAuxiliary && line.ThirdPartyId == null)
    throw new ValidationException("Auxiliary account requires ThirdParty");
```

---

## Year-End Closing Procedures

### Closing Process

**Purpose:** Transfer profit/loss to equity and prepare for new year

### Step 1: Close Expense Accounts (Class 6)

```
Debit:  13x Résultat de l'exercice
Credit: 6xx All expense accounts (to zero them out)
```

**Example:**
```
Debit:  130 Résultat (bénéfice)         500,000 DZD
Credit: 600 Achats                      300,000 DZD
Credit: 631 Salaires                    150,000 DZD
Credit: 681 Dotations aux amortissements 50,000 DZD
```

### Step 2: Close Revenue Accounts (Class 7)

```
Debit:  7xx All revenue accounts (to zero them out)
Credit: 13x Résultat de l'exercice
```

**Example:**
```
Debit:  700 Ventes marchandises         800,000 DZD
Credit: 130 Résultat (bénéfice)         800,000 DZD
```

### Step 3: Calculate Net Income

```
Net Income = Total Revenue (Class 7) - Total Expenses (Class 6)
           = 800,000 - 500,000
           = 300,000 DZD (Profit)
```

**Result Account:**
- If profit: `130 Résultat net: bénéfice` (Credit balance)
- If loss: `139 Résultat net: perte` (Debit balance)

### Step 4: Allocate Net Income (Next Year)

**Legal Requirements (Algerian Commercial Code):**

1. **Reserve légale (5%)** - Mandatory until it reaches 10% of capital
2. **Statutory reserves** - Per company statutes
3. **Dividends** - Distribution to shareholders
4. **Retained earnings** - Keep in business

**Example Allocation:**
```
Debit:  130 Résultat (bénéfice)           300,000 DZD
Credit: 111 Réserve légale                 15,000 DZD (5%)
Credit: 455 Associés - Dividendes         200,000 DZD
Credit: 120 Report à nouveau               85,000 DZD
```

### Step 5: Carry Forward Balances (A Nouveau)

**Classes 1-5:** Balances carry forward to new year  
**Classes 6-7:** Reset to zero (already closed)

**Balance Sheet Accounts Continue:**
```
Assets (2, 3, 4, 5):  Debit balances → New Year
Liabilities (1, 4):   Credit balances → New Year
Equity (1):           Includes prior year result
```

---

## Implementation in TOTALFISC

### Database Design

**FiscalYears Table:**
```sql
CREATE TABLE FiscalYears (
    FiscalYearId TEXT PRIMARY KEY,
    YearNumber INTEGER NOT NULL UNIQUE,  -- 2026
    StartDate TEXT NOT NULL,             -- '2026-01-01'
    EndDate TEXT NOT NULL,               -- '2026-12-31'
    Status TEXT NOT NULL DEFAULT 'Open', -- Open, Locked, Closed
    ClosingEntryId TEXT                  -- FK to closing journal entry
);
```

**Year-End Closing Service:**
```csharp
public async Task<JournalEntry> CloseFiscalYearAsync(string fiscalYearId)
{
    var year = await _fiscalYearRepository.GetByIdAsync(fiscalYearId);
    if (year.Status == FiscalYearStatus.Closed)
        throw new InvalidOperationException("Year already closed");

    // Step 1: Calculate balances for Class 6 & 7
    var expenseTotal = await _balanceCalculator
        .GetClassTotalAsync(fiscalYearId, accountClass: 6);
    var revenueTotal = await _balanceCalculator
        .GetClassTotalAsync(fiscalYearId, accountClass: 7);

    var netIncome = revenueTotal - expenseTotal;

    // Step 2: Create closing entry
    var closingEntry = new JournalEntry
    {
        EntryDate = year.EndDate,
        JournalCode = "OD", // Opérations Diverses
        Description = $"Clôture exercice {year.YearNumber}",
        Status = EntryStatus.Posted
    };

    // Step 3: Close Class 6 (Expenses)
    var expenseAccounts = await _accountRepository
        .GetByClassAsync(accountClass: 6);

    foreach (var account in expenseAccounts)
    {
        var balance = await _balanceCalculator
            .GetAccountBalanceAsync(account.AccountId, fiscalYearId);

        if (balance != 0)
        {
            closingEntry.AddLine(new JournalLine
            {
                AccountId = "130", // Résultat
                Debit = balance,
                Credit = 0,
                Label = $"Clôture {account.AccountNumber}"
            });

            closingEntry.AddLine(new JournalLine
            {
                AccountId = account.AccountId,
                Debit = 0,
                Credit = balance,
                Label = "Clôture exercice"
            });
        }
    }

    // Step 4: Close Class 7 (Revenue) - similar logic
    // ...

    // Step 5: Verify net income matches
    if (closingEntry.TotalDebit != closingEntry.TotalCredit)
        throw new InvalidOperationException("Closing entry unbalanced");

    // Step 6: Save and mark year as closed
    await _journalRepository.AddAsync(closingEntry);
    year.Status = FiscalYearStatus.Closed;
    year.ClosingEntryId = closingEntry.EntryId;
    await _unitOfWork.CommitAsync();

    return closingEntry;
}
```

---

## Tableau de Passage (PCN → SCF)

### Common Mappings

| PCN Account | PCN Name | SCF Account | SCF Name |
|------------|----------|-------------|----------|
| 60 | Achats | 600 | Achats de marchandises |
| 61 | Services extérieurs | 61x | Services extérieurs (unchanged) |
| 40 | Fournisseurs | 401 | Fournisseurs de stocks |
| 41 | Clients | 411 | Clients |
| 31 | Stocks | 30x, 31x, 35x | Multiple inventory types |
| 27 | Autres immobilisations | 20x | Immobilisations incorporelles |
| 17 | Dettes financières | Eliminated | Use Class 1 or 4 |

### Migration Strategy

**Database Table:**
```sql
CREATE TABLE PCNToSCFMapping (
    MappingId TEXT PRIMARY KEY,
    PCNAccount TEXT NOT NULL,
    SCFAccount TEXT NOT NULL,
    IsAutomated INTEGER NOT NULL, -- Can auto-map?
    RequiresReview INTEGER NOT NULL,
    Notes TEXT
);
```

**Migration Tool:**
```csharp
public async Task<ImportResult> ImportFromPCCOMPTA(string pccomptaPath)
{
    var paradoxReader = new ParadoxFileReader(pccomptaPath);
    var pcnAccounts = paradoxReader.ReadAccountsFile("CPT.DB");
    var transactions = paradoxReader.ReadTransactionsFile("MVT.DB");

    var mappingEngine = new PCNToSCFMappingEngine();
    var result = new ImportResult();

    foreach (var pcnAccount in pcnAccounts)
    {
        var scfAccount = await mappingEngine.MapAccountAsync(pcnAccount);

        if (scfAccount.RequiresManualReview)
        {
            result.AddReviewItem(pcnAccount, scfAccount);
        }
        else
        {
            await _accountRepository.AddAsync(scfAccount);
            result.MappedCount++;
        }
    }

    return result;
}
```

---

## Conclusion

The SCF represents a modern, IFRS-aligned accounting framework that:

✅ **Aligns with international standards** (IFRS/IAS)  
✅ **Provides transparent financial reporting**  
✅ **Uses hierarchical Chart of Accounts** (Classes 1-7)  
✅ **Requires auxiliary account tracking** (411, 401, etc.)  
✅ **Mandates year-end closing procedures** (Class 6/7 reset)  
✅ **Supports analytical accounting** (cost center tracking)  

TOTALFISC fully implements the SCF structure, ensuring compliance with Algerian accounting law while providing modern tools for efficient financial management.

---

**Related Documents:**
- [DECREE_09_110.md](DECREE_09_110.md) - Computerized accounting regulations
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Technical implementation
- [TAX_REGULATIONS.md](TAX_REGULATIONS.md) - IRG, TVA, TAP, IBS details
- [JIBAYATIC_INTEGRATION.md](JIBAYATIC_INTEGRATION.md) - Electronic tax filing
