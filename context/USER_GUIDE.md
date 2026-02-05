# USER_GUIDE.md
# TOTALFISC - User Guide

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Target Audience:** Accountants, Bookkeepers, Financial Managers  

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Creating Journal Entries](#creating-journal-entries)
4. [Managing Accounts](#managing-accounts)
5. [Managing Third Parties](#managing-third-parties)
6. [Generating Reports](#generating-reports)
7. [Fiscal Year Operations](#fiscal-year-operations)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Login

1. **Launch Application**
   - Double-click "TOTALFISC" icon on desktop
   - Or: Start Menu → TOTALFISC

2. **Login Screen**
   ```
   Username: admin
   Password: [provided by administrator]
   ```

3. **First-Time Setup**
   - Change default password
   - Configure company information
   - Set fiscal year parameters

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Administrator** | Full access | IT manager, system admin |
| **Accountant** | Create/edit entries, generate reports | Daily accounting work |
| **Viewer** | Read-only access | Management, auditors |
| **Auditor** | Read-only + export | External auditors |

---

## Dashboard Overview

### Main Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  TOTALFISC                           [Admin] [⚙]    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Navigation ──────┐   ┌─ Main Content ───────────────┐│
│  │                    │   │                               ││
│  │ 📊 Dashboard       │   │  Statistics & Quick Actions   ││
│  │ 📝 Journal Entries │   │                               ││
│  │ 📖 Accounts        │   │  📊 Total Entries: 1,250      ││
│  │ 👥 Third Parties   │   │  💰 Total Debit:  5.2M DZD    ││
│  │ 📈 Reports         │   │  💵 Total Credit: 5.2M DZD    ││
│  │ 📆 Fiscal Years    │   │                               ││
│  │ ⚙️  Settings       │   │  Quick Actions:               ││
│  │                    │   │  [New Entry] [View Balance]   ││
│  │                    │   │                               ││
│  └────────────────────┘   └───────────────────────────────┘│
│                                                             │
│  Status: License Valid | FY 2026 Open | Last Backup: 02/05 │
└────────────────────────────────────────────────────────────┘
```

### Dashboard Widgets

1. **Statistics Card**
   - Total entries this month
   - Total amounts (debit/credit)
   - Balance status

2. **Recent Entries**
   - Last 10 journal entries
   - Quick access to view/edit

3. **Alerts & Notifications**
   - Unbalanced entries
   - License expiration warnings
   - Backup reminders

4. **Quick Actions**
   - New Journal Entry
   - View Trial Balance
   - Generate Report
   - Backup Database

---

## Creating Journal Entries

### Step-by-Step Guide

#### Step 1: Navigate to Journal Entries

Click **"Journal Entries"** in left sidebar

#### Step 2: Click "New Entry"

Button in top-right corner: **[+ New Entry]**

#### Step 3: Fill Entry Header

```
Entry Date:    [05/02/2026]  📅
Journal:       [VTE - Ventes] ▼
Reference:     FAC-2026-001
Description:   Vente marchandise Client ABC
```

#### Step 4: Add Lines

Click **[+ Add Line]** for each line:

**Line 1 - Debit (Client)**
```
Account:       411 - Clients ▼
Third Party:   CLI-001 - Client ABC SARL ▼
Label:         Facture FAC-2026-001
Debit:         11,900.00 DZD
Credit:        0.00 DZD
```

**Line 2 - Credit (Revenue)**
```
Account:       700 - Ventes de marchandises ▼
Third Party:   [Leave empty]
Label:         Vente marchandise
Debit:         0.00 DZD
Credit:        10,000.00 DZD
```

**Line 3 - Credit (VAT)**
```
Account:       4457 - TVA collectée ▼
Third Party:   [Leave empty]
Label:         TVA 19%
Debit:         0.00 DZD
Credit:        1,900.00 DZD
```

#### Step 5: Verify Balance

Check balance indicator at bottom:

✅ **Balanced** - Total Debit: 11,900.00 = Total Credit: 11,900.00

⚠️ **Unbalanced** - Total Debit: 11,900.00 ≠ Total Credit: 10,000.00

#### Step 6: Save Entry

Click **[Save as Draft]** or **[Save & Post]**

- **Save as Draft**: Can edit later
- **Save & Post**: Immediately post (immutable)

### Common Journal Codes

| Code | Name | Use Case |
|------|------|----------|
| **VTE** | Ventes | Sales invoices |
| **ACH** | Achats | Purchase invoices |
| **BQ** | Banque | Bank transactions |
| **CAI** | Caisse | Cash transactions |
| **OD** | Opérations diverses | Miscellaneous entries |
| **AN** | À-nouveaux | Opening balances |

### Tips for Journal Entries

✅ **DO:**
- Always include reference (invoice number, receipt, etc.)
- Use clear, descriptive labels
- Verify balance before saving
- Select appropriate third party for 411/401 accounts

❌ **DON'T:**
- Leave description empty
- Post unbalanced entries
- Forget to select journal code
- Use wrong account numbers

---

## Managing Accounts

### Viewing Chart of Accounts

1. Click **"Accounts"** in sidebar
2. Browse by class or search

### Account Structure (SCF)

```
Class 1: Capital & Reserves
├─ 10: Capital
├─ 12: Résultat de l'exercice
└─ 13: Résultat net de l'exercice

Class 2: Fixed Assets
├─ 21: Immobilisations corporelles
└─ 28: Amortissements

Class 3: Inventory & WIP
├─ 30: Stocks de marchandises
└─ 31: Matières premières

Class 4: Third Party Accounts
├─ 401: Fournisseurs
├─ 411: Clients
├─ 421: Personnel
└─ 44: État

Class 5: Financial Accounts
├─ 51: Banques
├─ 52: Instruments financiers
└─ 53: Caisse

Class 6: Expenses
├─ 60: Achats
├─ 61: Services extérieurs
├─ 62: Autres services
└─ 63: Charges de personnel

Class 7: Revenue
├─ 70: Ventes
└─ 74: Subventions
```

### Creating a New Account

1. Click **[+ New Account]**
2. Fill form:
   ```
   Account Number: 512
   Account Label:  Banque BADR
   Account Class:  5 (Financial)
   Account Type:   Asset
   ```
3. Click **[Save]**

### Searching Accounts

Use search box:
- By number: `411`
- By label: `Clients`
- By class: `Class 4`

---

## Managing Third Parties

### Third Party Types

| Type | Account | Examples |
|------|---------|----------|
| **Client** | 411 | Customers, clients |
| **Fournisseur** | 401 | Suppliers, vendors |
| **Personnel** | 421 | Employees |
| **État** | 44x | Tax authorities |
| **Associés** | 45x | Partners, shareholders |

### Creating a Third Party

1. Click **"Third Parties"** → **[+ New]**
2. Fill form:

```
Code:          CLI-001
Name:          Client ABC SARL
Type:          Client ▼

Tax Information:
NIF:           099123456789012
NIS:           123456789012345
RC:            16B0123456

Contact Information:
Address:       123 Rue Didouche Mourad, Algiers
Phone:         +213 21 12 34 56
Email:         contact@clientabc.dz
```

3. Click **[Save]**

### Searching Third Parties

- By code: `CLI-001`
- By name: `Client ABC`
- By type: Filter by Client/Supplier

---

## Generating Reports

### Available Reports

#### 1. Trial Balance (Balance)

**Purpose:** Summary of all account balances

**Steps:**
1. Click **"Reports"** → **"Trial Balance"**
2. Select parameters:
   ```
   Fiscal Year: 2026 ▼
   As of Date:  05/02/2026 📅
   ```
3. Click **[Generate]**

**Output:**
```
┌────────────────────────────────────────────────────────────┐
│                    BALANCE DES COMPTES                      │
│                     Exercice 2026                           │
│                  Au 05 février 2026                         │
├────────────────────────────────────────────────────────────┤
│ Compte │ Libellé          │ Solde Débiteur │ Solde Crédit │
├────────┼──────────────────┼────────────────┼──────────────┤
│ 411    │ Clients          │   150,000.00   │       -      │
│ 512    │ Banque BADR      │    50,000.00   │       -      │
│ 401    │ Fournisseurs     │       -        │  80,000.00   │
│ 700    │ Ventes           │       -        │ 500,000.00   │
│ 60     │ Achats           │   300,000.00   │       -      │
├────────┴──────────────────┼────────────────┼──────────────┤
│ TOTAUX                    │   500,000.00   │ 580,000.00   │
└───────────────────────────┴────────────────┴──────────────┘
```

#### 2. General Ledger (Grand Livre)

**Purpose:** Detailed transaction history by account

**Steps:**
1. Click **"Reports"** → **"General Ledger"**
2. Select parameters:
   ```
   Fiscal Year:  2026 ▼
   Account:      411 - Clients ▼
   Date Range:   01/01/2026 - 31/12/2026
   ```
3. Click **[Generate]**

**Output:**
```
┌────────────────────────────────────────────────────────────┐
│              GRAND LIVRE - Compte 411 (Clients)            │
├────────────────────────────────────────────────────────────┤
│ Date     │ N°  │ Libellé      │ Débit     │ Crédit    │ SD│
├──────────┼─────┼──────────────┼───────────┼───────────┼───┤
│ 05/02/26 │ 001 │ Facture 001  │ 11,900.00 │      -    │ D │
│ 10/02/26 │ 005 │ Règlement    │      -    │ 11,900.00 │ - │
│ 15/02/26 │ 012 │ Facture 002  │  5,950.00 │      -    │ D │
└──────────┴─────┴──────────────┴───────────┴───────────┴───┘
```

#### 3. Income Statement (Compte de Résultat)

**Purpose:** Profit & Loss statement

**Steps:**
1. Click **"Reports"** → **"Income Statement"**
2. Select fiscal year: **2026**
3. Click **[Generate]**

#### 4. Balance Sheet (Bilan)

**Purpose:** Assets & Liabilities statement

**Steps:**
1. Click **"Reports"** → **"Balance Sheet"**
2. Select fiscal year: **2026**
3. Click **[Generate]**

### Exporting Reports

All reports can be exported:

**Format Options:**
- 📄 **PDF** - Professional printable format
- 📊 **Excel** - Editable spreadsheet
- 📋 **CSV** - Raw data

**Steps:**
1. Generate report
2. Click **[Export]** button
3. Select format
4. Choose destination folder
5. Click **[Save]**

---

## Fiscal Year Operations

### Opening a New Fiscal Year

**When:** At the start of each calendar year (January 1)

**Steps:**
1. Click **"Fiscal Years"** → **[+ New Fiscal Year]**
2. Fill form:
   ```
   Year:        2027
   Start Date:  01/01/2027
   End Date:    31/12/2027
   Status:      Open
   ```
3. Click **[Create]**

### Closing a Fiscal Year

**When:** After all entries for the year are posted

**Important:** This operation is irreversible!

**Steps:**
1. Click **"Fiscal Years"**
2. Select year to close (e.g., 2026)
3. Click **[Close Year]**
4. System performs:
   - ✅ Verify all entries are posted
   - ✅ Calculate final balances
   - ✅ Generate closing entries (Class 6 & 7)
   - ✅ Transfer result to Class 1
   - ✅ Create opening balances for next year
5. Confirm closure

**After Closure:**
- ❌ Cannot create new entries in closed year
- ❌ Cannot edit existing entries
- ✅ Can still view and generate reports
- ✅ Data is locked and tamper-proof

---

## Tips & Best Practices

### Daily Operations

✅ **Start of Day:**
1. Check dashboard for alerts
2. Review unposted entries
3. Verify backups are current

✅ **During Day:**
1. Enter transactions as they occur
2. Save as draft if uncertain
3. Post entries after verification

✅ **End of Day:**
1. Review day's entries
2. Check trial balance
3. Create backup

### Monthly Operations

✅ **Month-End:**
1. Post all draft entries
2. Generate trial balance
3. Review account balances
4. Generate monthly reports
5. Create backup

### Year-End Operations

✅ **Fiscal Year-End:**
1. Ensure all entries are posted
2. Generate annual reports
3. Review with auditor
4. Close fiscal year
5. Archive reports

### Data Entry Best Practices

#### Always Include:
- ✅ Clear, descriptive labels
- ✅ Correct reference numbers
- ✅ Appropriate third parties
- ✅ Proper journal codes

#### Double-Check:
- ✅ Entry is balanced
- ✅ Account numbers are correct
- ✅ Amounts match source documents
- ✅ Date is correct

#### Common Mistakes to Avoid:
- ❌ Posting unbalanced entries
- ❌ Wrong account classification
- ❌ Missing third party on 411/401
- ❌ Incorrect VAT calculation
- ❌ Posting to closed fiscal year

### Backup Strategy

**Automatic Backups:**
- Daily at midnight
- Stored in: `C:\ProgramData\TOTALFISC\Backups`

**Manual Backups:**
1. Click **Settings** → **Backup**
2. Click **[Create Backup Now]**
3. Choose destination (USB drive recommended)
4. Wait for confirmation

**Best Practice:**
- Keep 3 copies: Local + USB + Cloud
- Test restore monthly
- Store offsite copy

---

## Keyboard Shortcuts

### Global

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New journal entry |
| `Ctrl + S` | Save current form |
| `Ctrl + F` | Search |
| `Ctrl + P` | Print current view |
| `F1` | Help |
| `F5` | Refresh |

### Journal Entries

| Shortcut | Action |
|----------|--------|
| `Ctrl + L` | Add new line |
| `Ctrl + D` | Duplicate line |
| `Del` | Delete line |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |

---

## Getting Help

### In-App Help

- Press **F1** anywhere for context help
- Click **❓** icon in top-right corner
- Hover over fields for tooltips

### Support Channels

📧 **Email:** support@totalfisc.dz  
📞 **Phone:** +213 21 XX XX XX  
🌐 **Website:** www.totalfisc.dz  
📖 **Documentation:** docs.totalfisc.dz  

### Training

**Available Training:**
- 🎓 Online video tutorials
- 📚 PDF user manual
- 👥 On-site training (Enterprise)
- 💻 Webinars (monthly)

---

## Glossary

| Term | French | Description |
|------|--------|-------------|
| **Journal Entry** | Écriture comptable | A complete accounting transaction |
| **Debit** | Débit | Left side of entry (assets, expenses) |
| **Credit** | Crédit | Right side of entry (liabilities, revenue) |
| **Trial Balance** | Balance | Summary of account balances |
| **General Ledger** | Grand livre | Detailed transaction history |
| **Third Party** | Auxiliaire | Client, supplier, employee |
| **Fiscal Year** | Exercice comptable | Accounting period (Jan 1 - Dec 31) |
| **Post** | Valider | Make entry immutable |
| **Chart of Accounts** | Plan comptable | List of all accounts (SCF) |

---

## Conclusion

TOTALFISC is designed to make accounting simple and compliant with Algerian regulations. Follow this guide for daily operations, and refer to specific sections as needed.

**Remember:**
- ✅ Save frequently
- ✅ Verify before posting
- ✅ Backup regularly
- ✅ Ask for help when unsure

**Happy Accounting!** 📊

---

**Related Documents:**
- [FISCAL_YEAR_MANAGEMENT.md](FISCAL_YEAR_MANAGEMENT.md) - Detailed fiscal year operations
- [REPORTING_GUIDE.md](REPORTING_GUIDE.md) - Complete reporting guide
- [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) - Common issues
