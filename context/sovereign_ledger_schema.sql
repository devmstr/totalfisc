-- =====================================================
-- Sovereign Ledger - Production SQLite Schema
-- Version: 2.0
-- Target: Algeria SCF Compliance / LF 2026
-- Date: February 2026
-- =====================================================

-- Enable Foreign Keys (Critical for SQLite)
PRAGMA foreign_keys = ON;
PRAGMA encoding = 'UTF-8';
PRAGMA journal_mode = WAL; -- Write-Ahead Logging for better concurrency

-- =====================================================
-- SECTION 1: SECURITY & SYSTEM CONFIGURATION
-- =====================================================

-- System Settings (Append-Only for audit trail)
CREATE TABLE SystemSettings (
    SettingId TEXT PRIMARY KEY,
    SettingKey TEXT NOT NULL UNIQUE,
    SettingValue TEXT NOT NULL,
    Description TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT NOT NULL,
    ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ModifiedBy TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1))
);

-- Company Information (Single Row Configuration)
CREATE TABLE CompanyInfo (
    CompanyId TEXT PRIMARY KEY DEFAULT '1',
    CommercialName TEXT NOT NULL,
    LegalName TEXT NOT NULL,
    NIF TEXT NOT NULL UNIQUE, -- Numéro d'Identification Fiscale
    NIS TEXT, -- Numéro d'Identification Statistique
    RC TEXT, -- Registre de Commerce
    ArticleOfIncorporation TEXT,
    LegalForm TEXT, -- SARL, SPA, EURL, etc.
    Address TEXT NOT NULL,
    City TEXT NOT NULL,
    Province TEXT NOT NULL,
    PostalCode TEXT,
    Phone TEXT,
    Email TEXT,
    Website TEXT,
    Logo BLOB, -- Company logo for reports
    Currency TEXT NOT NULL DEFAULT 'DZD',
    FiscalYearStart INTEGER NOT NULL DEFAULT 1 CHECK (FiscalYearStart BETWEEN 1 AND 12),
    FiscalYearEnd INTEGER NOT NULL DEFAULT 12 CHECK (FiscalYearEnd BETWEEN 1 AND 12),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CHECK (CompanyId = '1') -- Enforce single row
);

-- Users and Authentication
CREATE TABLE Users (
    UserId TEXT PRIMARY KEY,
    Username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    PasswordHash TEXT NOT NULL, -- BCrypt hashed
    PasswordSalt TEXT NOT NULL,
    FullName TEXT NOT NULL,
    Email TEXT UNIQUE,
    Role TEXT NOT NULL CHECK (Role IN ('Administrator', 'ChiefAccountant', 'Accountant', 'Auditor')),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    LastLoginAt TEXT,
    LastLoginIP TEXT,
    FailedLoginAttempts INTEGER NOT NULL DEFAULT 0,
    LockedUntil TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT,
    ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ModifiedBy TEXT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ModifiedBy) REFERENCES Users(UserId)
);

-- Audit Log (Append-Only - Critical for Decree 09-110 Article 16)
CREATE TABLE AuditLog (
    AuditId TEXT PRIMARY KEY,
    EntityType TEXT NOT NULL, -- 'JournalEntry', 'Account', 'User', etc.
    EntityId TEXT NOT NULL,
    Action TEXT NOT NULL CHECK (Action IN ('Create', 'Update', 'Delete', 'Post', 'Lock', 'Unlock', 'Export')),
    OldValue TEXT, -- JSON serialized old state
    NewValue TEXT, -- JSON serialized new state
    ChangedFields TEXT, -- Comma-separated list of changed fields
    UserId TEXT NOT NULL,
    Username TEXT NOT NULL,
    WorkstationId TEXT NOT NULL, -- IP or MAC hash
    Timestamp TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    Reason TEXT, -- Optional reason for change
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Licensing Information
CREATE TABLE License (
    LicenseId TEXT PRIMARY KEY DEFAULT '1',
    HardwareId TEXT NOT NULL,
    LicenseKey TEXT NOT NULL,
    IssuedTo TEXT NOT NULL,
    IssuedDate TEXT NOT NULL,
    ExpiryDate TEXT,
    LicenseType TEXT NOT NULL CHECK (LicenseType IN ('Trial', 'Standard', 'Professional', 'Enterprise')),
    MaxUsers INTEGER NOT NULL DEFAULT 1,
    Features TEXT, -- JSON array of enabled features
    Signature TEXT NOT NULL, -- RSA-2048 signature
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    LastValidated TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CHECK (LicenseId = '1')
);

-- =====================================================
-- SECTION 2: FISCAL YEAR & PERIOD MANAGEMENT
-- =====================================================

-- Fiscal Year (Exercice Comptable)
CREATE TABLE FiscalYears (
    FiscalYearId TEXT PRIMARY KEY,
    YearNumber INTEGER NOT NULL UNIQUE, -- 2026, 2027, etc.
    StartDate TEXT NOT NULL, -- ISO 8601 format: YYYY-MM-DD
    EndDate TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'Open' CHECK (Status IN ('Open', 'Locked', 'Closed')),
    Description TEXT,
    ClosingEntryId TEXT, -- FK to JournalEntries for year-end closing
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT NOT NULL,
    ClosedAt TEXT,
    ClosedBy TEXT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ClosedBy) REFERENCES Users(UserId),
    CHECK (StartDate < EndDate)
);

-- Fiscal Periods (Monthly/Quarterly)
CREATE TABLE FiscalPeriods (
    PeriodId TEXT PRIMARY KEY,
    FiscalYearId TEXT NOT NULL,
    PeriodNumber INTEGER NOT NULL CHECK (PeriodNumber BETWEEN 1 AND 12), -- 1-12 for months
    PeriodName TEXT NOT NULL, -- 'Janvier 2026', 'Q1 2026', etc.
    StartDate TEXT NOT NULL,
    EndDate TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'Open' CHECK (Status IN ('Open', 'Locked', 'Closed')),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    LockedAt TEXT,
    LockedBy TEXT,
    FOREIGN KEY (FiscalYearId) REFERENCES FiscalYears(FiscalYearId) ON DELETE CASCADE,
    FOREIGN KEY (LockedBy) REFERENCES Users(UserId),
    UNIQUE (FiscalYearId, PeriodNumber),
    CHECK (StartDate < EndDate)
);

-- =====================================================
-- SECTION 3: CHART OF ACCOUNTS (SCF HIERARCHY)
-- =====================================================

-- Accounts (Plan Comptable - String-based PK for hierarchical queries)
CREATE TABLE Accounts (
    AccountId TEXT PRIMARY KEY, -- GUID
    AccountNumber TEXT NOT NULL UNIQUE, -- '512000', '411', etc.
    AccountLabel TEXT NOT NULL,
    AccountClass INTEGER NOT NULL CHECK (AccountClass BETWEEN 1 AND 7), -- SCF Classes
    ParentAccountId TEXT, -- Self-referencing FK for hierarchy
    AccountType TEXT NOT NULL CHECK (AccountType IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Detail')),
    IsAuxiliary INTEGER NOT NULL DEFAULT 0 CHECK (IsAuxiliary IN (0, 1)), -- Requires ThirdParty
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    IsSummary INTEGER NOT NULL DEFAULT 0 CHECK (IsSummary IN (0, 1)), -- Cannot post to summary accounts
    AllowManualEntry INTEGER NOT NULL DEFAULT 1 CHECK (AllowManualEntry IN (0, 1)),
    TaxType TEXT CHECK (TaxType IN ('None', 'VAT_Deductible', 'VAT_Collected', 'IRG', 'TAP', 'IBS')),
    Description TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT NOT NULL,
    ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ModifiedBy TEXT,
    FOREIGN KEY (ParentAccountId) REFERENCES Accounts(AccountId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ModifiedBy) REFERENCES Users(UserId)
);

-- Account Balances (Materialized View as Table for Performance)
CREATE TABLE AccountBalances (
    BalanceId TEXT PRIMARY KEY,
    AccountId TEXT NOT NULL,
    FiscalYearId TEXT NOT NULL,
    PeriodId TEXT,
    DebitBalance TEXT NOT NULL DEFAULT '0', -- Stored as TEXT for precision
    CreditBalance TEXT NOT NULL DEFAULT '0',
    NetBalance TEXT NOT NULL DEFAULT '0', -- Computed: Debit - Credit
    BalanceType TEXT NOT NULL CHECK (BalanceType IN ('Debit', 'Credit', 'Zero')),
    LastUpdated TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId) ON DELETE CASCADE,
    FOREIGN KEY (FiscalYearId) REFERENCES FiscalYears(FiscalYearId) ON DELETE CASCADE,
    FOREIGN KEY (PeriodId) REFERENCES FiscalPeriods(PeriodId) ON DELETE CASCADE,
    UNIQUE (AccountId, FiscalYearId, PeriodId)
);

-- =====================================================
-- SECTION 4: THIRD PARTIES (AUXILIARIES)
-- =====================================================

-- Third Parties (Clients, Suppliers, Employees)
CREATE TABLE ThirdParties (
    ThirdPartyId TEXT PRIMARY KEY,
    ThirdPartyType TEXT NOT NULL CHECK (ThirdPartyType IN ('Client', 'Supplier', 'Employee', 'Other')),
    Code TEXT NOT NULL UNIQUE, -- Auxiliary code
    Name TEXT NOT NULL,
    LegalName TEXT,
    NIF TEXT, -- Tax ID
    NIS TEXT,
    RC TEXT,
    Address TEXT,
    City TEXT,
    Province TEXT,
    PostalCode TEXT,
    Country TEXT DEFAULT 'Algeria',
    Phone TEXT,
    Mobile TEXT,
    Email TEXT,
    Website TEXT,
    ContactPerson TEXT,
    PaymentTerms INTEGER, -- Days (e.g., 30, 60)
    CreditLimit TEXT, -- Stored as TEXT for precision
    BankName TEXT,
    BankAccountNumber TEXT,
    BankBIC TEXT,
    Notes TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT NOT NULL,
    ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ModifiedBy TEXT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ModifiedBy) REFERENCES Users(UserId)
);

-- =====================================================
-- SECTION 5: JOURNAL ENTRIES (CORE LEDGER)
-- =====================================================

-- Journal Codes (ACH, VTE, BQ, CA, OD, etc.)
CREATE TABLE JournalCodes (
    JournalCodeId TEXT PRIMARY KEY,
    Code TEXT NOT NULL UNIQUE, -- 'ACH', 'VTE', 'BQ', 'CA', 'OD'
    Description TEXT NOT NULL, -- 'Achats', 'Ventes', 'Banque', etc.
    Type TEXT NOT NULL CHECK (Type IN ('Purchase', 'Sales', 'Bank', 'Cash', 'General')),
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- Journal Entries (Header)
CREATE TABLE JournalEntries (
    EntryId TEXT PRIMARY KEY,
    EntryNumber INTEGER, -- Sequential, gap-free legal number (assigned on Post)
    DraftNumber TEXT, -- Temporary draft identifier
    FiscalYearId TEXT NOT NULL,
    PeriodId TEXT NOT NULL,
    JournalCodeId TEXT NOT NULL,
    EntryDate TEXT NOT NULL, -- Transaction date (YYYY-MM-DD)
    Reference TEXT, -- Invoice number, receipt number, etc.
    Description TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'Draft' CHECK (Status IN ('Draft', 'Validating', 'Posted', 'Void')),
    TotalDebit TEXT NOT NULL DEFAULT '0', -- Stored as TEXT
    TotalCredit TEXT NOT NULL DEFAULT '0',
    ValidationHash TEXT, -- SHA-256 hash chain
    PreviousHash TEXT, -- Link to previous entry's hash
    PostedAt TEXT,
    PostedBy TEXT,
    VoidedAt TEXT,
    VoidedBy TEXT,
    VoidReason TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT NOT NULL,
    ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ModifiedBy TEXT,
    FOREIGN KEY (FiscalYearId) REFERENCES FiscalYears(FiscalYearId),
    FOREIGN KEY (PeriodId) REFERENCES FiscalPeriods(PeriodId),
    FOREIGN KEY (JournalCodeId) REFERENCES JournalCodes(JournalCodeId),
    FOREIGN KEY (PostedBy) REFERENCES Users(UserId),
    FOREIGN KEY (VoidedBy) REFERENCES Users(UserId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ModifiedBy) REFERENCES Users(UserId),
    UNIQUE (EntryNumber, FiscalYearId)
);

-- Journal Lines (Detail)
CREATE TABLE JournalLines (
    LineId TEXT PRIMARY KEY,
    EntryId TEXT NOT NULL,
    LineNumber INTEGER NOT NULL, -- Sequential within entry (1, 2, 3...)
    AccountId TEXT NOT NULL,
    ThirdPartyId TEXT, -- Required if Account.IsAuxiliary = 1
    Label TEXT NOT NULL, -- Line description
    Debit TEXT NOT NULL DEFAULT '0' CHECK (CAST(Debit AS REAL) >= 0), -- Non-negative
    Credit TEXT NOT NULL DEFAULT '0' CHECK (CAST(Credit AS REAL) >= 0), -- Non-negative
    Currency TEXT NOT NULL DEFAULT 'DZD',
    ExchangeRate TEXT, -- For multi-currency (future)
    ReferenceDocument TEXT, -- Invoice number, receipt, etc.
    DueDate TEXT, -- For receivables/payables
    ReconciliationId TEXT, -- For bank reconciliation
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (EntryId) REFERENCES JournalEntries(EntryId) ON DELETE CASCADE,
    FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId),
    FOREIGN KEY (ThirdPartyId) REFERENCES ThirdParties(ThirdPartyId),
    UNIQUE (EntryId, LineNumber),
    CHECK ((CAST(Debit AS REAL) > 0 AND CAST(Credit AS REAL) = 0) OR 
           (CAST(Debit AS REAL) = 0 AND CAST(Credit AS REAL) > 0)) -- One must be zero
);

-- =====================================================
-- SECTION 6: ANALYTICAL ACCOUNTING
-- =====================================================

-- Analytical Axes (Cost Centers, Projects, etc.)
CREATE TABLE AnalyticalAxes (
    AxisId TEXT PRIMARY KEY,
    AxisCode TEXT NOT NULL UNIQUE,
    AxisName TEXT NOT NULL,
    Description TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- Analytical Sections (Values for each axis)
CREATE TABLE AnalyticalSections (
    SectionId TEXT PRIMARY KEY,
    AxisId TEXT NOT NULL,
    SectionCode TEXT NOT NULL,
    SectionName TEXT NOT NULL,
    ParentSectionId TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (AxisId) REFERENCES AnalyticalAxes(AxisId) ON DELETE CASCADE,
    FOREIGN KEY (ParentSectionId) REFERENCES AnalyticalSections(SectionId),
    UNIQUE (AxisId, SectionCode)
);

-- Analytical Distribution (Link lines to analytical sections)
CREATE TABLE AnalyticalDistribution (
    DistributionId TEXT PRIMARY KEY,
    LineId TEXT NOT NULL,
    SectionId TEXT NOT NULL,
    Amount TEXT NOT NULL, -- Portion of the line amount
    Percentage TEXT, -- Optional percentage
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (LineId) REFERENCES JournalLines(LineId) ON DELETE CASCADE,
    FOREIGN KEY (SectionId) REFERENCES AnalyticalSections(SectionId)
);

-- =====================================================
-- SECTION 7: TAX MANAGEMENT (TVA, IRG, TAP, IBS)
-- =====================================================

-- VAT Rates
CREATE TABLE VATRates (
    RateId TEXT PRIMARY KEY,
    RateCode TEXT NOT NULL UNIQUE,
    RateName TEXT NOT NULL, -- 'Taux Normal', 'Taux Réduit', etc.
    RatePercentage TEXT NOT NULL, -- '19.00', '9.00'
    EffectiveFrom TEXT NOT NULL,
    EffectiveTo TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- IRG Tax Brackets (Impôt sur le Revenu Global)
CREATE TABLE IRGBrackets (
    BracketId TEXT PRIMARY KEY,
    FiscalYear INTEGER NOT NULL,
    BracketOrder INTEGER NOT NULL,
    MinAmount TEXT NOT NULL,
    MaxAmount TEXT, -- NULL for top bracket
    TaxRate TEXT NOT NULL, -- '0.23', '0.27', etc.
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    UNIQUE (FiscalYear, BracketOrder)
);

-- IRG Configuration
CREATE TABLE IRGConfiguration (
    ConfigId TEXT PRIMARY KEY,
    FiscalYear INTEGER NOT NULL UNIQUE,
    AbatementRate TEXT NOT NULL DEFAULT '0.40', -- 40%
    MinAbatement TEXT NOT NULL DEFAULT '1000',
    MaxAbatement TEXT NOT NULL DEFAULT '1500',
    LissageMinSalary TEXT NOT NULL DEFAULT '30000', -- Zone de Lissage start
    LissageMaxSalary TEXT NOT NULL DEFAULT '35000', -- Zone de Lissage end
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- =====================================================
-- SECTION 8: INVENTORY MANAGEMENT (Optional Module)
-- =====================================================

-- Product Categories
CREATE TABLE ProductCategories (
    CategoryId TEXT PRIMARY KEY,
    CategoryCode TEXT NOT NULL UNIQUE,
    CategoryName TEXT NOT NULL,
    ParentCategoryId TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (ParentCategoryId) REFERENCES ProductCategories(CategoryId)
);

-- Products/Items
CREATE TABLE Products (
    ProductId TEXT PRIMARY KEY,
    ProductCode TEXT NOT NULL UNIQUE, -- SKU or Barcode
    ProductName TEXT NOT NULL,
    CategoryId TEXT,
    Description TEXT,
    UnitOfMeasure TEXT NOT NULL DEFAULT 'Unit', -- 'Unit', 'Kg', 'Liter', etc.
    UnitPrice TEXT NOT NULL DEFAULT '0',
    CostPrice TEXT,
    VATRateId TEXT,
    MinStockLevel TEXT,
    MaxStockLevel TEXT,
    ReorderPoint TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT NOT NULL,
    ModifiedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ModifiedBy TEXT,
    FOREIGN KEY (CategoryId) REFERENCES ProductCategories(CategoryId),
    FOREIGN KEY (VATRateId) REFERENCES VATRates(RateId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ModifiedBy) REFERENCES Users(UserId)
);

-- Inventory Movements
CREATE TABLE InventoryMovements (
    MovementId TEXT PRIMARY KEY,
    ProductId TEXT NOT NULL,
    MovementType TEXT NOT NULL CHECK (MovementType IN ('Purchase', 'Sale', 'Adjustment', 'Transfer', 'Return')),
    Quantity TEXT NOT NULL, -- Can be negative for outgoing
    UnitCost TEXT,
    TotalCost TEXT,
    MovementDate TEXT NOT NULL,
    EntryId TEXT, -- Link to journal entry
    Reference TEXT,
    Notes TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    CreatedBy TEXT NOT NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    FOREIGN KEY (EntryId) REFERENCES JournalEntries(EntryId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
);

-- =====================================================
-- SECTION 9: BANK RECONCILIATION
-- =====================================================

-- Bank Accounts
CREATE TABLE BankAccounts (
    BankAccountId TEXT PRIMARY KEY,
    AccountId TEXT NOT NULL, -- Link to Chart of Accounts (512xxx)
    BankName TEXT NOT NULL,
    AccountNumber TEXT NOT NULL UNIQUE,
    IBAN TEXT,
    BIC TEXT,
    Currency TEXT NOT NULL DEFAULT 'DZD',
    OpeningBalance TEXT NOT NULL DEFAULT '0',
    OpeningDate TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    FOREIGN KEY (AccountId) REFERENCES Accounts(AccountId)
);

-- Bank Statements (Imported)
CREATE TABLE BankStatements (
    StatementId TEXT PRIMARY KEY,
    BankAccountId TEXT NOT NULL,
    StatementDate TEXT NOT NULL,
    OpeningBalance TEXT NOT NULL,
    ClosingBalance TEXT NOT NULL,
    ImportedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    ImportedBy TEXT NOT NULL,
    FOREIGN KEY (BankAccountId) REFERENCES BankAccounts(BankAccountId),
    FOREIGN KEY (ImportedBy) REFERENCES Users(UserId)
);

-- Bank Transactions (Statement lines)
CREATE TABLE BankTransactions (
    TransactionId TEXT PRIMARY KEY,
    StatementId TEXT NOT NULL,
    TransactionDate TEXT NOT NULL,
    ValueDate TEXT,
    Description TEXT NOT NULL,
    Reference TEXT,
    Debit TEXT NOT NULL DEFAULT '0',
    Credit TEXT NOT NULL DEFAULT '0',
    Balance TEXT,
    IsReconciled INTEGER NOT NULL DEFAULT 0 CHECK (IsReconciled IN (0, 1)),
    ReconciliationId TEXT,
    FOREIGN KEY (StatementId) REFERENCES BankStatements(StatementId) ON DELETE CASCADE
);

-- Reconciliation Records
CREATE TABLE Reconciliations (
    ReconciliationId TEXT PRIMARY KEY,
    BankAccountId TEXT NOT NULL,
    PeriodId TEXT NOT NULL,
    ReconciliationDate TEXT NOT NULL,
    BookBalance TEXT NOT NULL,
    BankBalance TEXT NOT NULL,
    Difference TEXT NOT NULL,
    Status TEXT NOT NULL DEFAULT 'InProgress' CHECK (Status IN ('InProgress', 'Completed', 'Approved')),
    CompletedAt TEXT,
    CompletedBy TEXT,
    ApprovedAt TEXT,
    ApprovedBy TEXT,
    FOREIGN KEY (BankAccountId) REFERENCES BankAccounts(BankAccountId),
    FOREIGN KEY (PeriodId) REFERENCES FiscalPeriods(PeriodId),
    FOREIGN KEY (CompletedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ApprovedBy) REFERENCES Users(UserId)
);

-- =====================================================
-- SECTION 10: FISCAL REPORTING (JIBAYA'TIC)
-- =====================================================

-- Fiscal Report Templates (G50, F6001-F6011)
CREATE TABLE FiscalReportTemplates (
    TemplateId TEXT PRIMARY KEY,
    ReportCode TEXT NOT NULL UNIQUE, -- 'G50', 'F6001', 'F6002', etc.
    ReportName TEXT NOT NULL,
    ReportType TEXT NOT NULL CHECK (ReportType IN ('Balance', 'ProfitLoss', 'CashFlow', 'Notes')),
    XSDSchema TEXT, -- XML Schema for validation
    IsActive INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- Fiscal Report Mapping (Account to Report Line)
CREATE TABLE FiscalReportMappings (
    MappingId TEXT PRIMARY KEY,
    TemplateId TEXT NOT NULL,
    ReportLineCode TEXT NOT NULL, -- 'F6001_ActifsNonCourants', etc.
    ReportLineName TEXT NOT NULL,
    AccountPattern TEXT NOT NULL, -- '2%' for all Class 2 accounts
    Formula TEXT, -- For calculated fields
    IsDebit INTEGER CHECK (IsDebit IN (0, 1)), -- Filter by debit/credit
    SortOrder INTEGER,
    FOREIGN KEY (TemplateId) REFERENCES FiscalReportTemplates(TemplateId) ON DELETE CASCADE
);

-- Generated Fiscal Reports (History)
CREATE TABLE GeneratedFiscalReports (
    ReportId TEXT PRIMARY KEY,
    TemplateId TEXT NOT NULL,
    FiscalYearId TEXT NOT NULL,
    GeneratedAt TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
    GeneratedBy TEXT NOT NULL,
    ReportData TEXT NOT NULL, -- JSON or XML data
    FilePath TEXT, -- Path to exported file
    SubmittedToJibayatic INTEGER DEFAULT 0 CHECK (SubmittedToJibayatic IN (0, 1)),
    SubmittedAt TEXT,
    FOREIGN KEY (TemplateId) REFERENCES FiscalReportTemplates(TemplateId),
    FOREIGN KEY (FiscalYearId) REFERENCES FiscalYears(FiscalYearId),
    FOREIGN KEY (GeneratedBy) REFERENCES Users(UserId)
);

-- =====================================================
-- SECTION 11: INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX idx_users_username ON Users(Username);
CREATE INDEX idx_users_role ON Users(Role);

-- Audit Log
CREATE INDEX idx_auditlog_entity ON AuditLog(EntityType, EntityId);
CREATE INDEX idx_auditlog_timestamp ON AuditLog(Timestamp DESC);
CREATE INDEX idx_auditlog_user ON AuditLog(UserId);

-- Fiscal Years & Periods
CREATE INDEX idx_fiscalyears_year ON FiscalYears(YearNumber);
CREATE INDEX idx_fiscalperiods_year ON FiscalPeriods(FiscalYearId);

-- Accounts
CREATE INDEX idx_accounts_number ON Accounts(AccountNumber);
CREATE INDEX idx_accounts_class ON Accounts(AccountClass);
CREATE INDEX idx_accounts_parent ON Accounts(ParentAccountId);
CREATE INDEX idx_accounts_active ON Accounts(IsActive) WHERE IsActive = 1;

-- Account Balances
CREATE INDEX idx_balances_account ON AccountBalances(AccountId);
CREATE INDEX idx_balances_year ON AccountBalances(FiscalYearId);
CREATE INDEX idx_balances_period ON AccountBalances(PeriodId);

-- Third Parties
CREATE INDEX idx_thirdparties_code ON ThirdParties(Code);
CREATE INDEX idx_thirdparties_type ON ThirdParties(ThirdPartyType);
CREATE INDEX idx_thirdparties_name ON ThirdParties(Name);

-- Journal Entries
CREATE INDEX idx_entries_number ON JournalEntries(EntryNumber, FiscalYearId);
CREATE INDEX idx_entries_date ON JournalEntries(EntryDate);
CREATE INDEX idx_entries_status ON JournalEntries(Status);
CREATE INDEX idx_entries_year ON JournalEntries(FiscalYearId);
CREATE INDEX idx_entries_period ON JournalEntries(PeriodId);
CREATE INDEX idx_entries_journal ON JournalEntries(JournalCodeId);
CREATE INDEX idx_entries_hash ON JournalEntries(ValidationHash);

-- Journal Lines
CREATE INDEX idx_lines_entry ON JournalLines(EntryId);
CREATE INDEX idx_lines_account ON JournalLines(AccountId);
CREATE INDEX idx_lines_thirdparty ON JournalLines(ThirdPartyId);

-- Products
CREATE INDEX idx_products_code ON Products(ProductCode);
CREATE INDEX idx_products_category ON Products(CategoryId);

-- Inventory
CREATE INDEX idx_inventory_product ON InventoryMovements(ProductId);
CREATE INDEX idx_inventory_date ON InventoryMovements(MovementDate);

-- Bank
CREATE INDEX idx_banktransactions_statement ON BankTransactions(StatementId);
CREATE INDEX idx_banktransactions_date ON BankTransactions(TransactionDate);

-- =====================================================
-- SECTION 12: TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Trigger: Prevent modification of Posted entries
CREATE TRIGGER trg_prevent_posted_entry_update
BEFORE UPDATE ON JournalEntries
WHEN OLD.Status = 'Posted' AND NEW.Status = 'Posted'
BEGIN
    SELECT RAISE(ABORT, 'Cannot modify a Posted journal entry. Use reversal entries instead.');
END;

-- Trigger: Prevent deletion of Posted entries
CREATE TRIGGER trg_prevent_posted_entry_delete
BEFORE DELETE ON JournalEntries
WHEN OLD.Status = 'Posted'
BEGIN
    SELECT RAISE(ABORT, 'Cannot delete a Posted journal entry. Use void operation instead.');
END;

-- Trigger: Auto-calculate entry totals
CREATE TRIGGER trg_calculate_entry_totals_insert
AFTER INSERT ON JournalLines
BEGIN
    UPDATE JournalEntries
    SET TotalDebit = (
            SELECT COALESCE(SUM(CAST(Debit AS REAL)), 0)
            FROM JournalLines
            WHERE EntryId = NEW.EntryId
        ),
        TotalCredit = (
            SELECT COALESCE(SUM(CAST(Credit AS REAL)), 0)
            FROM JournalLines
            WHERE EntryId = NEW.EntryId
        ),
        ModifiedAt = datetime('now', 'utc')
    WHERE EntryId = NEW.EntryId;
END;

CREATE TRIGGER trg_calculate_entry_totals_update
AFTER UPDATE ON JournalLines
BEGIN
    UPDATE JournalEntries
    SET TotalDebit = (
            SELECT COALESCE(SUM(CAST(Debit AS REAL)), 0)
            FROM JournalLines
            WHERE EntryId = NEW.EntryId
        ),
        TotalCredit = (
            SELECT COALESCE(SUM(CAST(Credit AS REAL)), 0)
            FROM JournalLines
            WHERE EntryId = NEW.EntryId
        ),
        ModifiedAt = datetime('now', 'utc')
    WHERE EntryId = NEW.EntryId;
END;

CREATE TRIGGER trg_calculate_entry_totals_delete
AFTER DELETE ON JournalLines
BEGIN
    UPDATE JournalEntries
    SET TotalDebit = (
            SELECT COALESCE(SUM(CAST(Debit AS REAL)), 0)
            FROM JournalLines
            WHERE EntryId = OLD.EntryId
        ),
        TotalCredit = (
            SELECT COALESCE(SUM(CAST(Credit AS REAL)), 0)
            FROM JournalLines
            WHERE EntryId = OLD.EntryId
        ),
        ModifiedAt = datetime('now', 'utc')
    WHERE EntryId = OLD.EntryId;
END;

-- Trigger: Validate entry balance before posting
CREATE TRIGGER trg_validate_entry_balance
BEFORE UPDATE ON JournalEntries
WHEN NEW.Status = 'Posted' AND OLD.Status != 'Posted'
BEGIN
    SELECT CASE
        WHEN ABS(CAST(NEW.TotalDebit AS REAL) - CAST(NEW.TotalCredit AS REAL)) > 0.01 THEN
            RAISE(ABORT, 'Cannot post unbalanced entry. Debit must equal Credit.')
    END;
END;

-- Trigger: Audit trail for account modifications
CREATE TRIGGER trg_audit_accounts_update
AFTER UPDATE ON Accounts
BEGIN
    INSERT INTO AuditLog (AuditId, EntityType, EntityId, Action, OldValue, NewValue, UserId, Username, WorkstationId)
    VALUES (
        hex(randomblob(16)),
        'Account',
        NEW.AccountId,
        'Update',
        json_object('AccountNumber', OLD.AccountNumber, 'AccountLabel', OLD.AccountLabel),
        json_object('AccountNumber', NEW.AccountNumber, 'AccountLabel', NEW.AccountLabel),
        NEW.ModifiedBy,
        (SELECT Username FROM Users WHERE UserId = NEW.ModifiedBy),
        'SYSTEM'
    );
END;

-- =====================================================
-- SECTION 13: VIEWS FOR REPORTING
-- =====================================================

-- View: General Ledger (Grand Livre)
CREATE VIEW vw_GeneralLedger AS
SELECT 
    je.EntryNumber,
    je.EntryDate,
    je.Reference,
    jc.Code AS JournalCode,
    jc.Description AS JournalName,
    jl.LineNumber,
    a.AccountNumber,
    a.AccountLabel,
    COALESCE(tp.Code || ' - ' || tp.Name, '') AS ThirdParty,
    jl.Label,
    jl.Debit,
    jl.Credit,
    je.Status,
    fy.YearNumber AS FiscalYear,
    fp.PeriodName AS Period
FROM JournalLines jl
INNER JOIN JournalEntries je ON jl.EntryId = je.EntryId
INNER JOIN Accounts a ON jl.AccountId = a.AccountId
INNER JOIN JournalCodes jc ON je.JournalCodeId = jc.JournalCodeId
INNER JOIN FiscalYears fy ON je.FiscalYearId = fy.FiscalYearId
INNER JOIN FiscalPeriods fp ON je.PeriodId = fp.PeriodId
LEFT JOIN ThirdParties tp ON jl.ThirdPartyId = tp.ThirdPartyId
WHERE je.Status = 'Posted'
ORDER BY je.EntryDate, je.EntryNumber, jl.LineNumber;

-- View: Trial Balance (Balance Générale)
CREATE VIEW vw_TrialBalance AS
SELECT 
    a.AccountNumber,
    a.AccountLabel,
    a.AccountClass,
    COALESCE(SUM(CAST(jl.Debit AS REAL)), 0) AS TotalDebit,
    COALESCE(SUM(CAST(jl.Credit AS REAL)), 0) AS TotalCredit,
    COALESCE(SUM(CAST(jl.Debit AS REAL)) - SUM(CAST(jl.Credit AS REAL)), 0) AS Balance
FROM Accounts a
LEFT JOIN JournalLines jl ON a.AccountId = jl.AccountId
LEFT JOIN JournalEntries je ON jl.EntryId = je.EntryId
WHERE je.Status = 'Posted' OR je.Status IS NULL
GROUP BY a.AccountId, a.AccountNumber, a.AccountLabel, a.AccountClass
ORDER BY a.AccountNumber;

-- View: Account Statement (Relevé de Compte)
CREATE VIEW vw_AccountStatement AS
SELECT 
    a.AccountNumber,
    a.AccountLabel,
    je.EntryDate,
    je.EntryNumber,
    je.Reference,
    jl.Label,
    COALESCE(tp.Code, '') AS ThirdPartyCode,
    COALESCE(tp.Name, '') AS ThirdPartyName,
    jl.Debit,
    jl.Credit,
    SUM(CAST(jl.Debit AS REAL) - CAST(jl.Credit AS REAL)) OVER (
        PARTITION BY a.AccountId 
        ORDER BY je.EntryDate, je.EntryNumber, jl.LineNumber
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS RunningBalance
FROM Accounts a
INNER JOIN JournalLines jl ON a.AccountId = jl.AccountId
INNER JOIN JournalEntries je ON jl.EntryId = je.EntryId
LEFT JOIN ThirdParties tp ON jl.ThirdPartyId = tp.ThirdPartyId
WHERE je.Status = 'Posted'
ORDER BY a.AccountNumber, je.EntryDate, je.EntryNumber, jl.LineNumber;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
