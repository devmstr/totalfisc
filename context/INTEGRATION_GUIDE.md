# INTEGRATION_GUIDE.md
# TOTALFISC - Integration Guide

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Purpose:** Third-party integrations and API usage  

---

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [REST API Integration](#rest-api-integration)
3. [Webhooks](#webhooks)
4. [Import/Export](#importexport)
5. [Common Integrations](#common-integrations)
6. [Custom Integrations](#custom-integrations)

---

## Integration Overview

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              TOTALFISC INTEGRATIONS                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  External Systems                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Banking    │  │  Inventory   │  │    CRM       │     │
│  │   Portal     │  │   System     │  │  (Odoo/etc)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         ▼                 ▼                  ▼              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         Integration Layer (APIs)                 │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │       │
│  │  │ REST API │  │ Webhooks │  │ CSV/Excel│     │       │
│  │  └──────────┘  └──────────┘  └──────────┘     │       │
│  └─────────────────────────────────────────────────┘       │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────┐       │
│  │      TOTALFISC (Backend)                 │       │
│  │  ├─ Authentication                              │       │
│  │  ├─ Business Logic                              │       │
│  │  └─ Database                                    │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Integration Methods

| Method | Use Case | Complexity | Real-time |
|--------|----------|------------|-----------|
| **REST API** | Full CRUD operations | Medium | Yes |
| **Webhooks** | Event notifications | Low | Yes |
| **CSV Import** | Bulk data migration | Low | No |
| **Excel Import** | User-friendly data entry | Low | No |
| **Database Access** | Advanced queries (read-only) | High | Yes |

---

## REST API Integration

### Authentication

**Step 1: Obtain API Token**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "api_user",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a7f8d6c5b4e3...",
  "expiresIn": 3600
}
```

**Step 2: Use Token in Requests**

```http
GET /api/journal-entries
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example Integrations

#### 1. Create Journal Entry from External System

```python
# Python example
import requests
import json

class TOTALFISCAPI:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.token = self._authenticate(username, password)

    def _authenticate(self, username, password):
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"username": username, "password": password}
        )
        response.raise_for_status()
        return response.json()["accessToken"]

    def create_entry(self, entry_data):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            f"{self.base_url}/api/journal-entries",
            headers=headers,
            json=entry_data
        )
        response.raise_for_status()
        return response.json()

# Usage
api = TOTALFISCAPI(
    "http://localhost:5000",
    "api_user",
    "secure_password"
)

# Create sales entry
entry = {
    "entryDate": "2026-02-05",
    "journalCode": "VTE",
    "reference": "FAC-2026-001",
    "description": "Sale to Client ABC",
    "fiscalYearId": "fy-2026",
    "lines": [
        {
            "accountId": "acc-411",
            "thirdPartyId": "tp-001",
            "label": "Invoice FAC-2026-001",
            "debit": 11900.00,
            "credit": 0.00
        },
        {
            "accountId": "acc-700",
            "label": "Revenue from sale",
            "debit": 0.00,
            "credit": 10000.00
        },
        {
            "accountId": "acc-4457",
            "label": "VAT 19%",
            "debit": 0.00,
            "credit": 1900.00
        }
    ]
}

result = api.create_entry(entry)
print(f"Entry created: {result['entryId']}")
```

#### 2. Sync Bank Transactions

```javascript
// Node.js example
const axios = require('axios');

class BankTransactionSync {
    constructor(baseUrl, token) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async syncTransactions(bankTransactions) {
        const results = [];

        for (const transaction of bankTransactions) {
            try {
                const entry = this.mapBankTransactionToEntry(transaction);
                const response = await this.client.post('/api/journal-entries', entry);
                results.push({
                    transactionId: transaction.id,
                    entryId: response.data.entryId,
                    status: 'success'
                });
            } catch (error) {
                results.push({
                    transactionId: transaction.id,
                    status: 'error',
                    message: error.message
                });
            }
        }

        return results;
    }

    mapBankTransactionToEntry(transaction) {
        // Map bank transaction to journal entry format
        return {
            entryDate: transaction.date,
            journalCode: 'BQ',
            reference: transaction.reference,
            description: transaction.description,
            fiscalYearId: 'fy-2026',
            lines: [
                {
                    accountId: 'acc-512',  // Bank account
                    label: transaction.description,
                    debit: transaction.amount > 0 ? transaction.amount : 0,
                    credit: transaction.amount < 0 ? Math.abs(transaction.amount) : 0
                },
                {
                    accountId: this.determineCounterAccount(transaction),
                    thirdPartyId: transaction.thirdPartyId,
                    label: transaction.description,
                    debit: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
                    credit: transaction.amount > 0 ? transaction.amount : 0
                }
            ]
        };
    }

    determineCounterAccount(transaction) {
        // Logic to determine appropriate account based on transaction
        if (transaction.type === 'payment') return 'acc-401';  // Suppliers
        if (transaction.type === 'receipt') return 'acc-411';  // Clients
        return 'acc-581';  // Other
    }
}

// Usage
const sync = new BankTransactionSync('http://localhost:5000', 'your_token');

const bankTransactions = [
    {
        id: '1',
        date: '2026-02-05',
        reference: 'BANK-001',
        description: 'Payment to Supplier XYZ',
        amount: -5000.00,
        type: 'payment',
        thirdPartyId: 'tp-002'
    }
];

const results = await sync.syncTransactions(bankTransactions);
console.log(results);
```

#### 3. Export Trial Balance

```csharp
// C# example
public class TOTALFISCClient
{
    private readonly HttpClient _httpClient;

    public TOTALFISCClient(string baseUrl, string token)
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(baseUrl)
        };
        _httpClient.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<TrialBalanceDto> GetTrialBalanceAsync(
        string fiscalYearId,
        DateTime? asOfDate = null)
    {
        var query = $"fiscalYearId={fiscalYearId}";
        if (asOfDate.HasValue)
            query += $"&asOfDate={asOfDate.Value:yyyy-MM-dd}";

        var response = await _httpClient.GetAsync($"/api/reports/trial-balance?{query}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<TrialBalanceDto>();
    }

    public async Task ExportToExcelAsync(string fiscalYearId, string filePath)
    {
        var trialBalance = await GetTrialBalanceAsync(fiscalYearId);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Trial Balance");

        // Headers
        worksheet.Cell(1, 1).Value = "Account Number";
        worksheet.Cell(1, 2).Value = "Account Label";
        worksheet.Cell(1, 3).Value = "Opening Debit";
        worksheet.Cell(1, 4).Value = "Opening Credit";
        worksheet.Cell(1, 5).Value = "Period Debit";
        worksheet.Cell(1, 6).Value = "Period Credit";
        worksheet.Cell(1, 7).Value = "Closing Debit";
        worksheet.Cell(1, 8).Value = "Closing Credit";

        // Data
        int row = 2;
        foreach (var line in trialBalance.Lines)
        {
            worksheet.Cell(row, 1).Value = line.AccountNumber;
            worksheet.Cell(row, 2).Value = line.AccountLabel;
            worksheet.Cell(row, 3).Value = line.OpeningDebit;
            worksheet.Cell(row, 4).Value = line.OpeningCredit;
            worksheet.Cell(row, 5).Value = line.PeriodDebit;
            worksheet.Cell(row, 6).Value = line.PeriodCredit;
            worksheet.Cell(row, 7).Value = line.ClosingDebit;
            worksheet.Cell(row, 8).Value = line.ClosingCredit;
            row++;
        }

        workbook.SaveAs(filePath);
    }
}

// Usage
var client = new TOTALFISCClient("http://localhost:5000", "your_token");
await client.ExportToExcelAsync("fy-2026", "trial_balance.xlsx");
```

---

## Webhooks

### Setting Up Webhooks

**Configure Webhook Endpoint:**

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-system.com/webhooks/TOTALFISC",
  "events": [
    "journal_entry.created",
    "journal_entry.posted",
    "fiscal_year.closed"
  ],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `journal_entry.created` | Entry created | Entry details |
| `journal_entry.posted` | Entry posted | Entry ID, hash |
| `journal_entry.voided` | Entry voided | Entry ID, reason |
| `fiscal_year.opened` | Year opened | Year details |
| `fiscal_year.closed` | Year closed | Year ID, result |
| `backup.completed` | Backup done | Backup path, size |

### Webhook Payload Example

```json
{
  "event": "journal_entry.posted",
  "timestamp": "2026-02-05T14:30:00Z",
  "data": {
    "entryId": "entry-123",
    "entryNumber": 42,
    "entryDate": "2026-02-05",
    "journalCode": "VTE",
    "reference": "FAC-2026-001",
    "totalDebit": 11900.00,
    "totalCredit": 11900.00,
    "validationHash": "A1B2C3D4E5F6..."
  },
  "signature": "sha256=abc123..."
}
```

### Webhook Receiver Implementation

```python
# Flask webhook receiver
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = "your_webhook_secret"

@app.route('/webhooks/TOTALFISC', methods=['POST'])
def handle_webhook():
    # Verify signature
    signature = request.headers.get('X-Webhook-Signature')
    expected_signature = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode(),
        request.data,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        return jsonify({'error': 'Invalid signature'}), 401

    # Parse payload
    payload = request.json
    event = payload['event']

    # Handle event
    if event == 'journal_entry.posted':
        handle_entry_posted(payload['data'])
    elif event == 'fiscal_year.closed':
        handle_year_closed(payload['data'])

    return jsonify({'status': 'ok'}), 200

def handle_entry_posted(data):
    # Update external system
    print(f"Entry {data['entryNumber']} posted with hash {data['validationHash']}")
    # ... your logic here

if __name__ == '__main__':
    app.run(port=8080)
```

---

## Import/Export

### CSV Import

**Format for Journal Entries:**

```csv
EntryDate,JournalCode,Reference,Description,AccountNumber,ThirdPartyCode,Label,Debit,Credit
2026-02-05,VTE,FAC-001,Sale to Client ABC,411,CLI-001,Invoice FAC-001,11900.00,0.00
2026-02-05,VTE,FAC-001,Sale to Client ABC,700,,Revenue from sale,0.00,10000.00
2026-02-05,VTE,FAC-001,Sale to Client ABC,4457,,VAT 19%,0.00,1900.00
```

**Import Script:**

```python
import csv
import requests

def import_entries_from_csv(api, csv_file):
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        # Group lines by entry
        entries = {}
        for row in reader:
            key = (row['EntryDate'], row['JournalCode'], row['Reference'])

            if key not in entries:
                entries[key] = {
                    'entryDate': row['EntryDate'],
                    'journalCode': row['JournalCode'],
                    'reference': row['Reference'],
                    'description': row['Description'],
                    'fiscalYearId': 'fy-2026',
                    'lines': []
                }

            entries[key]['lines'].append({
                'accountId': get_account_id(row['AccountNumber']),
                'thirdPartyId': get_third_party_id(row['ThirdPartyCode']) if row['ThirdPartyCode'] else None,
                'label': row['Label'],
                'debit': float(row['Debit']),
                'credit': float(row['Credit'])
            })

        # Create entries
        for entry_data in entries.values():
            result = api.create_entry(entry_data)
            print(f"Created entry: {result['entryId']}")
```

### Excel Import

**Using EPPlus (C#):**

```csharp
public class ExcelImporter
{
    public async Task<List<JournalEntry>> ImportFromExcelAsync(string filePath)
    {
        var entries = new List<JournalEntry>();

        using var package = new ExcelPackage(new FileInfo(filePath));
        var worksheet = package.Workbook.Worksheets[0];

        int row = 2;  // Skip header
        while (worksheet.Cells[row, 1].Value != null)
        {
            var entry = new JournalEntry
            {
                EntryDate = DateTime.Parse(worksheet.Cells[row, 1].Text),
                JournalCode = worksheet.Cells[row, 2].Text,
                Reference = worksheet.Cells[row, 3].Text,
                Description = worksheet.Cells[row, 4].Text,
                // ... parse lines
            };

            entries.Add(entry);
            row++;
        }

        return entries;
    }
}
```

---

## Common Integrations

### 1. Odoo ERP Integration

**Scenario:** Sync sales invoices from Odoo to TOTALFISC

```python
import xmlrpc.client

class OdooSovereignSync:
    def __init__(self, odoo_url, odoo_db, odoo_user, odoo_password, sl_api):
        # Odoo connection
        self.odoo_common = xmlrpc.client.ServerProxy(f'{odoo_url}/xmlrpc/2/common')
        self.odoo_models = xmlrpc.client.ServerProxy(f'{odoo_url}/xmlrpc/2/object')
        self.odoo_uid = self.odoo_common.authenticate(odoo_db, odoo_user, odoo_password, {})
        self.odoo_db = odoo_db
        self.odoo_password = odoo_password

        # TOTALFISC API
        self.sl_api = sl_api

    def sync_invoices(self, date_from):
        # Fetch invoices from Odoo
        invoice_ids = self.odoo_models.execute_kw(
            self.odoo_db, self.odoo_uid, self.odoo_password,
            'account.move', 'search',
            [[('move_type', '=', 'out_invoice'), ('invoice_date', '>=', date_from)]]
        )

        invoices = self.odoo_models.execute_kw(
            self.odoo_db, self.odoo_uid, self.odoo_password,
            'account.move', 'read',
            [invoice_ids],
            {'fields': ['name', 'invoice_date', 'partner_id', 'amount_total', 'invoice_line_ids']}
        )

        # Create journal entries in TOTALFISC
        for invoice in invoices:
            entry = self.map_odoo_invoice_to_entry(invoice)
            self.sl_api.create_entry(entry)

    def map_odoo_invoice_to_entry(self, invoice):
        return {
            'entryDate': invoice['invoice_date'],
            'journalCode': 'VTE',
            'reference': invoice['name'],
            'description': f"Invoice {invoice['name']} - {invoice['partner_id'][1]}",
            'fiscalYearId': 'fy-2026',
            'lines': [
                # Client line
                {
                    'accountId': 'acc-411',
                    'thirdPartyId': self.get_or_create_third_party(invoice['partner_id']),
                    'label': f"Invoice {invoice['name']}",
                    'debit': invoice['amount_total'],
                    'credit': 0.00
                },
                # Revenue line (simplified - should split by products)
                {
                    'accountId': 'acc-700',
                    'label': 'Sales revenue',
                    'debit': 0.00,
                    'credit': invoice['amount_total'] / 1.19  # Assuming 19% VAT
                },
                # VAT line
                {
                    'accountId': 'acc-4457',
                    'label': 'VAT 19%',
                    'debit': 0.00,
                    'credit': invoice['amount_total'] * 0.19 / 1.19
                }
            ]
        }
```

### 2. Bank Portal Integration

**Example:** CIB Bank Algeria API

```csharp
public class CIBBankIntegration
{
    private readonly HttpClient _client;
    private readonly ITOTALFISCAPI _slApi;

    public async Task SyncBankStatementsAsync(DateTime fromDate)
    {
        // Fetch transactions from bank API
        var transactions = await FetchBankTransactionsAsync(fromDate);

        // Create journal entries
        foreach (var transaction in transactions)
        {
            var entry = MapToJournalEntry(transaction);
            await _slApi.CreateEntryAsync(entry);
        }
    }

    private async Task<List<BankTransaction>> FetchBankTransactionsAsync(DateTime fromDate)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, 
            $"/api/accounts/{_accountNumber}/transactions?from={fromDate:yyyy-MM-dd}");

        var response = await _client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<List<BankTransaction>>();
    }

    private JournalEntryDto MapToJournalEntry(BankTransaction transaction)
    {
        return new JournalEntryDto
        {
            EntryDate = transaction.ValueDate,
            JournalCode = "BQ",
            Reference = transaction.Reference,
            Description = transaction.Description,
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>
            {
                new() {
                    AccountId = "acc-512",  // Bank account
                    Label = transaction.Description,
                    Debit = transaction.Amount > 0 ? transaction.Amount : 0,
                    Credit = transaction.Amount < 0 ? Math.Abs(transaction.Amount) : 0
                },
                new() {
                    AccountId = DetermineCounterAccount(transaction),
                    ThirdPartyId = transaction.ThirdPartyId,
                    Label = transaction.Description,
                    Debit = transaction.Amount < 0 ? Math.Abs(transaction.Amount) : 0,
                    Credit = transaction.Amount > 0 ? transaction.Amount : 0
                }
            }
        };
    }
}
```

---

## Custom Integrations

### Integration Checklist

- [ ] Define integration scope (what data flows where)
- [ ] Choose integration method (API, webhook, CSV)
- [ ] Authenticate and authorize
- [ ] Map data structures
- [ ] Handle errors gracefully
- [ ] Log all integration activities
- [ ] Test thoroughly
- [ ] Monitor in production

### Integration Best Practices

✅ **DO:**
- Use webhooks for real-time notifications
- Implement exponential backoff for retries
- Validate data before creating entries
- Log all API calls for debugging
- Use idempotency keys to prevent duplicates

❌ **DON'T:**
- Store API tokens in code (use environment variables)
- Create unbalanced entries
- Ignore error responses
- Hammer the API with rapid requests
- Skip data validation

---

## Conclusion

TOTALFISC's integration capabilities enable:

✅ **Automation** - Reduce manual data entry  
✅ **Real-time Sync** - Keep systems in sync  
✅ **Flexibility** - Choose the right integration method  
✅ **Scalability** - Handle large data volumes  
✅ **Reliability** - Robust error handling  

**Start integrating today to maximize efficiency!**

---

**Related Documents:**
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [AUTHENTICATION.md](AUTHENTICATION.md) - Security details
- [CODE_EXAMPLES.md](CODE_EXAMPLES.md) - More code examples
