# MIGRATION_GUIDE.md
# TOTALFISC - Migration from PCCOMPTA

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Source System:** PCCOMPTA 9.0, 10.0  

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Data Export from PCCOMPTA](#data-export-from-pccompta)
4. [Data Import to TOTALFISC](#data-import-to-TOTALFISC)
5. [Data Validation](#data-validation)
6. [Post-Migration Tasks](#post-migration-tasks)
7. [Troubleshooting](#troubleshooting)

---

## Migration Overview

### What Gets Migrated?

✅ **Yes - Core Data:**
- Chart of accounts
- Third parties (clients, suppliers, employees)
- Opening balances
- Historical journal entries (last 3 years)
- Fiscal year configuration

⚠️ **Partial - Reference Data:**
- Journal codes (mapping required)
- User accounts (recreate manually)
- Reports (regenerate in new system)

❌ **No - System-Specific:**
- Custom reports
- User preferences
- Database structure
- Application settings

### Migration Timeline

```
Week 1: Preparation
├─ Export data from PCCOMPTA
├─ Validate exported files
└─ Install TOTALFISC

Week 2: Initial Import
├─ Import chart of accounts
├─ Import third parties
└─ Import opening balances

Week 3: Historical Data
├─ Import journal entries (Year N)
├─ Import journal entries (Year N-1)
└─ Validate balances

Week 4: Testing & Go-Live
├─ Generate trial balance
├─ Compare with PCCOMPTA
├─ User training
└─ Go live!
```

---

## Pre-Migration Checklist

### PCCOMPTA System

✅ **Verify Data Integrity:**
```
1. Run trial balance in PCCOMPTA
2. Ensure all entries are posted
3. Check for unbalanced entries
4. Verify third party data complete
```

✅ **Close Current Period:**
```
1. Post all draft entries
2. Complete month-end procedures
3. Generate final reports
4. Backup PCCOMPTA database
```

✅ **Document Configuration:**
```
1. List of journals used
2. Account numbering scheme
3. Third party code format
4. Custom accounts created
```

### TOTALFISC System

✅ **Installation:**
```
1. Install application
2. Activate license
3. Create company profile
4. Configure fiscal year
```

✅ **User Accounts:**
```
1. Create administrator account
2. Create accountant accounts
3. Assign roles/permissions
```

---

## Data Export from PCCOMPTA

### Step 1: Export Chart of Accounts

**In PCCOMPTA:**
1. Menu: **Listes** → **Plan comptable**
2. Click **Exporter**
3. Format: **CSV (délimité par point-virgule)**
4. File: `plan_comptable.csv`

**Expected Format:**
```csv
NumeroCompte;LibelleCompte;TypeCompte
10;Capital social;P
101;Capital souscrit non appelé;P
411;Clients;A
401;Fournisseurs;P
512;Banque;A
700;Ventes de marchandises;R
```

### Step 2: Export Third Parties

**In PCCOMPTA:**
1. Menu: **Listes** → **Tiers**
2. Click **Exporter**
3. Format: **CSV**
4. File: `tiers.csv`

**Expected Format:**
```csv
CodeTiers;NomTiers;TypeTiers;NIF;NIS;RC;Adresse;Telephone;Email
CLI001;Client ABC SARL;Client;099123456789012;123456789012345;16B0123456;123 Rue Didouche;0213211234;abc@dz
FRS001;Fournisseur XYZ;Fournisseur;099987654321098;987654321098765;16B9876543;456 Bd Zirout;0213219876;xyz@dz
```

### Step 3: Export Trial Balance

**In PCCOMPTA:**
1. Menu: **États** → **Balance**
2. Select fiscal year
3. Click **Exporter**
4. Format: **CSV**
5. File: `balance_ouverture.csv`

**Expected Format:**
```csv
NumeroCompte;LibelleCompte;SoldeDebiteur;SoldeCrediteur
10;Capital social;0;100000.00
411;Clients;150000.00;0
401;Fournisseurs;0;80000.00
512;Banque;50000.00;0
```

### Step 4: Export Journal Entries

**In PCCOMPTA:**
1. Menu: **États** → **Grand livre**
2. Select fiscal year
3. Click **Exporter détaillé**
4. Format: **CSV**
5. File: `ecritures_2025.csv`

**Expected Format:**
```csv
DateEcriture;NumeroEcriture;CodeJournal;Reference;Description;NumeroCompte;CodeTiers;Libelle;Debit;Credit
2025-01-15;1;VTE;FAC001;Vente marchandise;411;CLI001;Facture FAC001;11900.00;0.00
2025-01-15;1;VTE;FAC001;Vente marchandise;700;;Vente;0.00;10000.00
2025-01-15;1;VTE;FAC001;Vente marchandise;4457;;TVA 19%;0.00;1900.00
```

---

## Data Import to TOTALFISC

### Step 1: Import Chart of Accounts

**In TOTALFISC:**
1. Click **Accounts** → **Import**
2. Select file: `plan_comptable.csv`
3. Map columns:
   ```
   CSV Column          → TOTALFISC Field
   ──────────────────────────────────────────────
   NumeroCompte        → Account Number
   LibelleCompte       → Account Label
   TypeCompte          → Account Type
   ```
4. Preview import
5. Click **[Import]**

**Validation:**
```
✅ 150 accounts imported
✅ No duplicates
✅ All accounts balanced
```

### Step 2: Import Third Parties

**In TOTALFISC:**
1. Click **Third Parties** → **Import**
2. Select file: `tiers.csv`
3. Map columns:
   ```
   CSV Column   → Field
   ────────────────────────
   CodeTiers    → Code
   NomTiers     → Name
   TypeTiers    → Third Party Type
   NIF          → NIF
   NIS          → NIS
   RC           → RC
   Adresse      → Address
   Telephone    → Phone
   Email        → Email
   ```
4. Preview import
5. Click **[Import]**

**Validation:**
```
✅ 45 clients imported
✅ 30 suppliers imported
✅ 5 employees imported
```

### Step 3: Import Opening Balances

**In TOTALFISC:**
1. Click **Fiscal Years** → **2026** → **Import Opening Balances**
2. Select file: `balance_ouverture.csv`
3. Map columns:
   ```
   CSV Column          → Field
   ────────────────────────────
   NumeroCompte        → Account Number
   SoldeDebiteur       → Debit
   SoldeCrediteur      → Credit
   ```
4. System creates journal entry:
   ```
   Entry Date:    01/01/2026
   Journal:       AN (À-nouveaux)
   Description:   Balances d'ouverture 2026
   ```
5. Preview entry
6. Click **[Import & Post]**

**Validation:**
```
✅ Entry balanced: 255,000 = 255,000
✅ All balance sheet accounts included
✅ No income statement accounts
```

### Step 4: Import Historical Entries

**In TOTALFISC:**
1. Click **Journal Entries** → **Import**
2. Select file: `ecritures_2025.csv`
3. Map columns:
   ```
   CSV Column       → Field
   ──────────────────────────
   DateEcriture     → Entry Date
   NumeroEcriture   → Entry Number
   CodeJournal      → Journal Code
   Reference        → Reference
   Description      → Description
   NumeroCompte     → Account Number
   CodeTiers        → Third Party Code
   Libelle          → Line Label
   Debit            → Debit
   Credit           → Credit
   ```
4. **Journal Code Mapping:**
   ```
   PCCOMPTA → TOTALFISC
   ───────────────────────────
   VTE      → VTE (Ventes)
   ACH      → ACH (Achats)
   BQ       → BQ (Banque)
   CA       → CAI (Caisse)
   OD       → OD (Opérations diverses)
   AN       → AN (À-nouveaux)
   ```
5. Preview import (first 10 entries)
6. Click **[Import All]**

**Progress:**
```
Importing entries... [████████████████████] 100%
✅ 1,250 entries imported
✅ 3,750 lines created
⏱️ Duration: 45 seconds
```

---

## Data Validation

### Validation Checklist

#### 1. Trial Balance Comparison

**Generate trial balance in TOTALFISC:**
```
Reports → Trial Balance → 2026
```

**Compare with PCCOMPTA:**
```
┌──────────┬─────────────────┬─────────────────┬──────────┐
│ Account  │ PCCOMPTA        │ TOTALFISC       │ Variance │
├──────────┼─────────────────┼─────────────────┼──────────┤
│ 411      │ 150,000.00 (D)  │ 150,000.00 (D)  │ ✅ 0.00  │
│ 512      │  50,000.00 (D)  │  50,000.00 (D)  │ ✅ 0.00  │
│ 401      │  80,000.00 (C)  │  80,000.00 (C)  │ ✅ 0.00  │
│ 700      │ 500,000.00 (C)  │ 500,000.00 (C)  │ ✅ 0.00  │
└──────────┴─────────────────┴─────────────────┴──────────┘
```

**If variances found:**
1. Identify missing/duplicate entries
2. Check account mapping
3. Re-import specific entries

#### 2. Entry Count Verification

```sql
-- PCCOMPTA
SELECT COUNT(*) FROM Ecritures WHERE Exercice = 2025;
-- Result: 1,250

-- TOTALFISC
SELECT COUNT(*) FROM JournalEntries WHERE FiscalYearId = 'fy-2025';
-- Result: 1,250

✅ Counts match!
```

#### 3. Third Party Balances

```
Client ABC:
  PCCOMPTA:    11,900.00 (D)
  TOTALFISC:   11,900.00 (D)
  ✅ Match

Supplier XYZ:
  PCCOMPTA:     5,000.00 (C)
  TOTALFISC:    5,000.00 (C)
  ✅ Match
```

#### 4. VAT Accounts

```
4456 - TVA déductible:
  PCCOMPTA:    25,000.00 (D)
  TOTALFISC:   25,000.00 (D)
  ✅ Match

4457 - TVA collectée:
  PCCOMPTA:    40,000.00 (C)
  TOTALFISC:   40,000.00 (C)
  ✅ Match
```

---

## Post-Migration Tasks

### 1. User Training

**Topics to Cover:**
- ✅ Navigation and interface
- ✅ Creating journal entries
- ✅ Posting entries
- ✅ Generating reports
- ✅ Fiscal year operations

**Recommended Duration:** 2 hours per user

### 2. Parallel Run (Optional)

Run both systems for 1 month:
```
Week 1: Enter in PCCOMPTA → migrate to TOTALFISC
Week 2: Enter in PCCOMPTA → migrate to TOTALFISC
Week 3: Enter in PCCOMPTA → migrate to TOTALFISC
Week 4: Enter in PCCOMPTA → migrate to TOTALFISC
        Compare results → switch to TOTALFISC only
```

### 3. Archive PCCOMPTA Data

**Backup Strategy:**
```
1. Full database backup
2. Export all reports to PDF
3. Store on external drive
4. Keep for 10 years (legal requirement)
```

### 4. Update Procedures

Update accounting procedures to reference TOTALFISC:
- ✅ Month-end checklist
- ✅ Year-end procedures
- ✅ Backup schedule
- ✅ Report distribution

---

## Troubleshooting

### Issue 1: Unbalanced Entries After Import

**Symptom:**
```
Error: Entry #123 is unbalanced
  Debit:  11,900.00
  Credit: 11,000.00
  Diff:      900.00
```

**Solution:**
1. Check CSV file for missing lines
2. Verify decimal separators (use . not ,)
3. Re-import specific entry

### Issue 2: Account Not Found

**Symptom:**
```
Error: Account '4121' not found
```

**Solution:**
1. Check account exists in chart of accounts
2. Create account if missing
3. Verify account number format (no spaces)

### Issue 3: Third Party Not Found

**Symptom:**
```
Error: Third party 'CLI001' not found
```

**Solution:**
1. Import third parties before entries
2. Check third party codes match exactly
3. Remove leading/trailing spaces

### Issue 4: Date Format Error

**Symptom:**
```
Error: Invalid date '15/01/2025'
```

**Solution:**
1. Use ISO format: `2025-01-15`
2. Check CSV column mapping
3. Verify date format in Excel

### Issue 5: Encoding Issues (Arabic/French)

**Symptom:**
```
Libellé shows: "Achat matiï¿½res"
Should be:     "Achat matières"
```

**Solution:**
1. Export CSV with UTF-8 encoding
2. In Excel: Save As → CSV UTF-8
3. Re-import file

---

## Migration Checklist

### Pre-Migration

- [ ] PCCOMPTA backup created
- [ ] All entries posted in PCCOMPTA
- [ ] Trial balance generated
- [ ] Data exported (accounts, parties, entries)
- [ ] Files validated (no errors)
- [ ] TOTALFISC installed
- [ ] License activated

### During Migration

- [ ] Chart of accounts imported
- [ ] Third parties imported
- [ ] Opening balances imported
- [ ] Historical entries imported (Year N)
- [ ] Historical entries imported (Year N-1)
- [ ] Trial balance comparison done
- [ ] Variances investigated
- [ ] All issues resolved

### Post-Migration

- [ ] User accounts created
- [ ] Permissions assigned
- [ ] Users trained
- [ ] Parallel run completed (if applicable)
- [ ] PCCOMPTA archived
- [ ] Procedures updated
- [ ] First month closed in TOTALFISC
- [ ] Go-live confirmed! 🎉

---

## Support

### Migration Support

📧 **Email:** migration@totalfisc.dz  
📞 **Phone:** +213 21 XX XX XX  
⏰ **Hours:** 8AM - 5PM (Sunday - Thursday)

### Professional Services

For complex migrations:
- 👥 On-site migration assistance
- 🔄 Data transformation services
- 📊 Custom report recreation
- 🎓 Extended training programs

---

## Conclusion

Migration from PCCOMPTA to TOTALFISC is straightforward when following this guide. Take time to validate data at each step to ensure a smooth transition.

**Key Success Factors:**
- ✅ Thorough preparation
- ✅ Clean source data
- ✅ Systematic validation
- ✅ User training
- ✅ Proper testing

**Welcome to TOTALFISC!** 🚀

---

**Related Documents:**
- [USER_GUIDE.md](USER_GUIDE.md) - Using TOTALFISC
- [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) - Common issues
- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) - Technical setup
