# REPORTING_GUIDE.md
# TOTALFISC - Reporting Guide

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Compliance:** SCF + Tax Regulations  

---

## Table of Contents

1. [Report Types](#report-types)
2. [Trial Balance](#trial-balance)
3. [General Ledger](#general-ledger)
4. [Balance Sheet](#balance-sheet)
5. [Income Statement](#income-statement)
6. [Cash Flow Statement](#cash-flow-statement)
7. [Tax Reports](#tax-reports)
8. [Custom Reports](#custom-reports)

---

## Report Types

### Mandatory Reports (SCF)

| Report | French Name | Frequency | Legal Requirement |
|--------|-------------|-----------|-------------------|
| **Trial Balance** | Balance des comptes | Monthly | ✅ Yes |
| **General Ledger** | Grand livre | Annual | ✅ Yes |
| **Balance Sheet** | Bilan | Annual | ✅ Yes |
| **Income Statement** | Compte de résultat | Annual | ✅ Yes |
| **Cash Flow** | Tableau de flux | Annual | ✅ Yes |
| **Notes** | Annexes | Annual | ✅ Yes |

### Management Reports

| Report | Purpose | Frequency |
|--------|---------|-----------|
| **Account Statement** | Detail by account | As needed |
| **Third Party Statement** | Client/supplier balance | As needed |
| **VAT Report** | Tax calculation | Monthly |
| **Aged Receivables** | Collection tracking | Weekly |
| **Aged Payables** | Payment tracking | Weekly |

---

## Trial Balance

### Overview

**Purpose:** Summarize all account balances at a specific date

**Structure:**
```
┌────────────────────────────────────────────────────────────┐
│                    BALANCE DES COMPTES                      │
│              Entreprise ABC SARL (NIF: 099...)             │
│                     Exercice 2026                           │
│                  Au 31 décembre 2026                        │
├────────────────────────────────────────────────────────────┤
│        │          │   Soldes d'ouverture  │    Mouvements  │
│ Compte │ Libellé  │ Débiteur │ Créditeur  │ Débit │ Crédit│
├────────┼──────────┼──────────┼────────────┼───────┼───────┤
│        │ CLASSE 1 │          │            │       │       │
│ 10     │ Capital  │     -    │ 100,000.00 │   -   │   -   │
│        │          │          │            │       │       │
│        │ CLASSE 2 │          │            │       │       │
│ 21     │ Immobil. │ 50,000.00│     -      │   -   │   -   │
│ 28     │ Amortis. │     -    │  10,000.00 │   -   │ 5,000 │
│        │          │          │            │       │       │
│        │ CLASSE 4 │          │            │       │       │
│ 411    │ Clients  │150,000.00│     -      │500,000│450,000│
│ 401    │ Fourniss.│     -    │  80,000.00 │200,000│250,000│
│        │          │          │            │       │       │
│        │ CLASSE 5 │          │            │       │       │
│ 512    │ Banque   │ 50,000.00│     -      │300,000│280,000│
│ 53     │ Caisse   │  5,000.00│     -      │ 50,000│ 48,000│
│        │          │          │            │       │       │
│        │ CLASSE 6 │          │            │       │       │
│ 60     │ Achats   │     -    │     -      │450,000│   -   │
│ 63     │ Charges  │     -    │     -      │100,000│   -   │
│        │          │          │            │       │       │
│        │ CLASSE 7 │          │            │       │       │
│ 700    │ Ventes   │     -    │     -      │   -   │600,000│
├────────┴──────────┼──────────┼────────────┼───────┼───────┤
│ TOTAUX            │255,000.00│ 290,000.00 │1.6M   │ 1.6M  │
└───────────────────┴──────────┴────────────┴───────┴───────┘
```

### Generating Trial Balance

**Steps:**
1. Click **Reports** → **Trial Balance**
2. Select parameters:
   ```
   Fiscal Year:    2026 ▼
   As of Date:     31/12/2026 📅
   Level of Detail: All levels ▼
   Include Zero Balances: ☐
   ```
3. Click **[Generate]**

### Trial Balance Variants

#### 1. Summary (by Class)

Shows only class totals:
```
CLASSE 1 - CAPITAUX               100,000.00 (Credit)
CLASSE 2 - IMMOBILISATIONS         40,000.00 (Debit)
CLASSE 4 - TIERS                  200,000.00 (Debit)
CLASSE 5 - FINANCIER               70,000.00 (Debit)
CLASSE 6 - CHARGES                550,000.00 (Debit)
CLASSE 7 - PRODUITS               600,000.00 (Credit)
```

#### 2. Detailed (All Accounts)

Shows individual account balances

#### 3. With Movements

Shows opening + period movements + closing

#### 4. Comparative

Compare multiple periods:
```
┌──────┬───────────┬───────────┬───────────┬───────────┐
│ Cpte │ Jan 2026  │ Feb 2026  │ Mar 2026  │ Var %     │
├──────┼───────────┼───────────┼───────────┼───────────┤
│ 411  │ 150,000   │ 180,000   │ 200,000   │ +33%      │
│ 512  │  50,000   │  60,000   │  70,000   │ +40%      │
└──────┴───────────┴───────────┴───────────┴───────────┘
```

---

## General Ledger

### Overview

**Purpose:** Complete transaction history for each account

**Structure:**
```
┌────────────────────────────────────────────────────────────┐
│                 GRAND LIVRE - Compte 411                    │
│                       Clients                               │
│              Exercice 2026 - Entreprise ABC                │
├────────────────────────────────────────────────────────────┤
│ Date     │ N°  │ Journal │ Libellé        │ Débit │ Crédit│
├──────────┼─────┼─────────┼────────────────┼───────┼───────┤
│ 01/01/26 │ 001 │ AN      │ À-nouveau      │150,000│   -   │
│ 05/02/26 │ 023 │ VTE     │ Fact. FAC-001  │ 11,900│   -   │
│ 10/02/26 │ 045 │ BQ      │ Règlement      │   -   │ 11,900│
│ 15/02/26 │ 067 │ VTE     │ Fact. FAC-002  │  5,950│   -   │
│ ...      │ ... │ ...     │ ...            │  ...  │  ...  │
├──────────┴─────┴─────────┴────────────────┼───────┼───────┤
│ TOTAUX                                     │500,000│450,000│
│ SOLDE FINAL (Débiteur)                     │ 50,000│       │
└────────────────────────────────────────────┴───────┴───────┘
```

### Generating General Ledger

**Steps:**
1. Click **Reports** → **General Ledger**
2. Select parameters:
   ```
   Fiscal Year:    2026 ▼
   Account:        411 - Clients ▼ (or "All")
   Start Date:     01/01/2026 📅
   End Date:       31/12/2026 📅
   Include Draft:  ☐
   ```
3. Click **[Generate]**

### General Ledger Variants

#### 1. By Account

Complete history for single account

#### 2. All Accounts

Full general ledger (large document!)

#### 3. By Class

Filter by account class (1-7)

#### 4. With Third Party

Shows third party details:
```
┌──────────┬─────────┬────────────┬──────────┬───────┐
│ Date     │ Tiers   │ Libellé    │ Débit    │ Crédit│
├──────────┼─────────┼────────────┼──────────┼───────┤
│ 05/02/26 │ CLI-001 │ Fact. 001  │ 11,900   │   -   │
│ 10/02/26 │ CLI-001 │ Règlement  │    -     │ 11,900│
│ 15/02/26 │ CLI-002 │ Fact. 002  │  5,950   │   -   │
└──────────┴─────────┴────────────┴──────────┴───────┘
```

---

## Balance Sheet

### Overview

**Purpose:** Financial position at specific date (Assets = Liabilities + Equity)

**Structure (SCF Format):**
```
┌────────────────────────────────────────────────────────────┐
│                        BILAN ACTIF                          │
│              Au 31 décembre 2026 (en DZD)                  │
├─────────────────────────────────┬───────────┬───────────────┤
│ ACTIF                           │   Brut    │    Net        │
├─────────────────────────────────┼───────────┼───────────────┤
│ ACTIF NON COURANT               │           │               │
│  Immobilisations corporelles    │  50,000   │   45,000      │
│  Immobilisations incorporelles  │       -   │       -       │
│                                 │           │               │
│ ACTIF COURANT                   │           │               │
│  Stocks                         │  30,000   │   30,000      │
│  Clients et comptes rattachés   │ 200,000   │  190,000      │
│  Autres créances                │  10,000   │   10,000      │
│  Disponibilités                 │  75,000   │   75,000      │
├─────────────────────────────────┼───────────┼───────────────┤
│ TOTAL ACTIF                     │ 365,000   │  350,000      │
└─────────────────────────────────┴───────────┴───────────────┘

┌────────────────────────────────────────────────────────────┐
│                      BILAN PASSIF                           │
├─────────────────────────────────┬───────────────────────────┤
│ PASSIF                          │        Montant            │
├─────────────────────────────────┼───────────────────────────┤
│ CAPITAUX PROPRES                │                           │
│  Capital social                 │         100,000           │
│  Réserves                       │          30,000           │
│  Résultat net de l'exercice     │          70,000           │
│                                 │                           │
│ PASSIFS NON COURANTS            │                           │
│  Emprunts et dettes financières │          50,000           │
│                                 │                           │
│ PASSIFS COURANTS                │                           │
│  Fournisseurs                   │          80,000           │
│  Dettes fiscales                │          15,000           │
│  Autres dettes                  │           5,000           │
├─────────────────────────────────┼───────────────────────────┤
│ TOTAL PASSIF                    │         350,000           │
└─────────────────────────────────┴───────────────────────────┘
```

### Generating Balance Sheet

**Steps:**
1. Click **Reports** → **Balance Sheet**
2. Select parameters:
   ```
   Fiscal Year:    2026 ▼
   As of Date:     31/12/2026 📅
   Format:         Standard SCF ▼
   ```
3. Click **[Generate]**

### Balance Sheet Rules

**Assets (Actif) = Liabilities (Passif)**

Always verify equality before finalizing!

---

## Income Statement

### Overview

**Purpose:** Profit & Loss for the period

**Structure (SCF Format):**
```
┌────────────────────────────────────────────────────────────┐
│            COMPTE DE RÉSULTAT PAR NATURE                    │
│             Exercice clos le 31/12/2026                    │
├─────────────────────────────────┬───────────────────────────┤
│ CHARGES                         │        Montant            │
├─────────────────────────────────┼───────────────────────────┤
│ Achats consommés                │         300,000           │
│ Services extérieurs             │         100,000           │
│ Charges de personnel            │          50,000           │
│ Impôts et taxes                 │          10,000           │
│ Charges financières             │           5,000           │
│ Dotations aux amortissements    │           5,000           │
│ Autres charges                  │          10,000           │
├─────────────────────────────────┼───────────────────────────┤
│ TOTAL CHARGES                   │         480,000           │
├─────────────────────────────────┼───────────────────────────┤
│                                 │                           │
│ PRODUITS                        │                           │
├─────────────────────────────────┼───────────────────────────┤
│ Ventes de marchandises          │         500,000           │
│ Production vendue               │          30,000           │
│ Subventions d'exploitation      │          10,000           │
│ Autres produits                 │          10,000           │
├─────────────────────────────────┼───────────────────────────┤
│ TOTAL PRODUITS                  │         550,000           │
├─────────────────────────────────┼───────────────────────────┤
│                                 │                           │
│ RÉSULTAT NET                    │          70,000           │
│ (Bénéfice)                      │                           │
└─────────────────────────────────┴───────────────────────────┘
```

### Generating Income Statement

**Steps:**
1. Click **Reports** → **Income Statement**
2. Select parameters:
   ```
   Fiscal Year:    2026 ▼
   Format:         By Nature ▼ (or "By Function")
   ```
3. Click **[Generate]**

### Key Ratios

```
Gross Margin = (Revenue - Cost of Sales) / Revenue
             = (500,000 - 300,000) / 500,000
             = 40%

Net Margin   = Net Income / Revenue
             = 70,000 / 500,000
             = 14%
```

---

## Cash Flow Statement

### Overview

**Purpose:** Cash movements during period

**Structure:**
```
┌────────────────────────────────────────────────────────────┐
│              TABLEAU DES FLUX DE TRÉSORERIE                │
│                   Exercice 2026                            │
├─────────────────────────────────┬───────────────────────────┤
│ FLUX DE TRÉSORERIE              │        Montant            │
├─────────────────────────────────┼───────────────────────────┤
│ A. ACTIVITÉS D'EXPLOITATION     │                           │
│    Encaissements clients        │         450,000           │
│    Décaissements fournisseurs   │        (280,000)          │
│    Charges de personnel         │         (50,000)          │
│    Impôts et taxes              │         (15,000)          │
│  → Flux net d'exploitation      │         105,000           │
│                                 │                           │
│ B. ACTIVITÉS D'INVESTISSEMENT   │                           │
│    Acquisition immobilisations  │         (20,000)          │
│    Cession actifs               │           5,000           │
│  → Flux net d'investissement    │         (15,000)          │
│                                 │                           │
│ C. ACTIVITÉS DE FINANCEMENT     │                           │
│    Augmentation capital         │          50,000           │
│    Remboursement emprunts       │         (10,000)          │
│    Dividendes versés            │         (20,000)          │
│  → Flux net de financement      │          20,000           │
├─────────────────────────────────┼───────────────────────────┤
│ VARIATION DE TRÉSORERIE (A+B+C) │         110,000           │
│                                 │                           │
│ Trésorerie début exercice       │          50,000           │
│ Trésorerie fin exercice         │         160,000           │
└─────────────────────────────────┴───────────────────────────┘
```

---

## Tax Reports

### 1. VAT Report (G50)

**Monthly submission to tax authorities**

```
┌────────────────────────────────────────────────────────────┐
│              DÉCLARATION TVA - Série G N° 50               │
│                    Mois : Février 2026                     │
├─────────────────────────────────┬───────────────────────────┤
│ OPÉRATIONS TAXABLES             │        Montant            │
├─────────────────────────────────┼───────────────────────────┤
│ Chiffre d'affaires HT (19%)     │          50,000           │
│ TVA collectée (4457)            │           9,500           │
│                                 │                           │
│ Achats HT (19%)                 │          30,000           │
│ TVA déductible (4456)           │           5,700           │
├─────────────────────────────────┼───────────────────────────┤
│ TVA À PAYER                     │           3,800           │
└─────────────────────────────────┴───────────────────────────┘
```

### 2. TAP Report (Taxe sur l'Activité Professionnelle)

**Monthly - 2% of turnover**

```
Chiffre d'affaires HT:   50,000 DZD
TAP (2%):                 1,000 DZD
```

### 3. IBS Report (Corporate Income Tax)

**Annual declaration**

```
Résultat fiscal:        70,000 DZD
Taux IBS:               19%
IBS à payer:            13,300 DZD
```

---

## Custom Reports

### Creating Custom Reports

1. Click **Reports** → **Custom Report Builder**
2. Select data source (accounts, entries, third parties)
3. Choose fields to display
4. Add filters
5. Group/Sort data
6. Save template

### Example: Aged Receivables

```sql
-- Accounts receivable aging
SELECT 
    tp.Code AS ClientCode,
    tp.Name AS ClientName,
    SUM(CASE WHEN DATEDIFF(DAY, je.EntryDate, GETDATE()) <= 30 
             THEN jl.Debit - jl.Credit ELSE 0 END) AS Current,
    SUM(CASE WHEN DATEDIFF(DAY, je.EntryDate, GETDATE()) BETWEEN 31 AND 60 
             THEN jl.Debit - jl.Credit ELSE 0 END) AS Days31to60,
    SUM(CASE WHEN DATEDIFF(DAY, je.EntryDate, GETDATE()) > 60 
             THEN jl.Debit - jl.Credit ELSE 0 END) AS Over60
FROM JournalLines jl
JOIN JournalEntries je ON jl.EntryId = je.EntryId
JOIN ThirdParties tp ON jl.ThirdPartyId = tp.ThirdPartyId
WHERE jl.AccountNumber LIKE '411%'
GROUP BY tp.Code, tp.Name
HAVING SUM(jl.Debit - jl.Credit) > 0;
```

---

## Export Formats

### PDF (Recommended for Archives)

- Professional formatting
- Page numbers
- Headers/footers
- Company logo
- Digital signature

### Excel

- Editable spreadsheet
- Formulas preserved
- Pivot table ready
- Charts included

### CSV

- Raw data
- Import to other systems
- Analysis in R/Python
- Database import

---

## Best Practices

✅ **DO:**
- Generate reports monthly
- Export to PDF for archiving
- Review with management
- Compare with previous periods
- Keep 10-year archive

❌ **DON'T:**
- Generate reports from drafts
- Skip verification
- Ignore unbalanced reports
- Forget to sign official reports

---

## Conclusion

Proper reporting is essential for:
- ✅ Regulatory compliance
- ✅ Management decision-making
- ✅ Tax declarations
- ✅ Audit trail
- ✅ Stakeholder communication

**Follow this guide to generate accurate, compliant reports!**

---

**Related Documents:**
- [USER_GUIDE.md](USER_GUIDE.md) - Daily operations
- [FISCAL_YEAR_MANAGEMENT.md](FISCAL_YEAR_MANAGEMENT.md) - Year-end closing
- [SCF_COMPLIANCE.md](SCF_COMPLIANCE.md) - Accounting standards
