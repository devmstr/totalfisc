# API_DOCUMENTATION.md
# TOTALFISC - API Documentation

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Base URL:** `http://localhost:5000/api`  

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Journal Entries API](#journal-entries-api)
4. [Accounts API](#accounts-api)
5. [Third Parties API](#third-parties-api)
6. [Reports API](#reports-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## API Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CLIENT (React App)                                         │
│      │                                                       │
│      ├─► HTTP Request (JSON)                                │
│      │                                                       │
│      ▼                                                       │
│  API GATEWAY (ASP.NET Core)                                 │
│      │                                                       │
│      ├─► Authentication Middleware (JWT)                    │
│      ├─► Authorization Middleware (RBAC)                    │
│      ├─► Validation Middleware (FluentValidation)          │
│      │                                                       │
│      ▼                                                       │
│  MEDIATR (Command/Query Router)                             │
│      │                                                       │
│      ├─► Command Handler → Domain → Repository             │
│      └─► Query Handler → Database → DTO                    │
│                                                              │
│      ▼                                                       │
│  HTTP Response (JSON)                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Versioning

API versioning via URL path:
```
/api/v1/journal-entries
/api/v2/journal-entries  (future)
```

---

## Authentication

### Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a7f8d6c5b4e3...",
  "expiresIn": 3600,
  "user": {
    "userId": "user-123",
    "username": "admin",
    "fullName": "Admin User",
    "role": "Administrator",
    "permissions": [
      "journal_entries.create",
      "journal_entries.edit",
      "journal_entries.post",
      "accounts.create",
      "reports.view"
    ]
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "type": "AuthenticationError",
  "title": "Invalid credentials",
  "status": 401,
  "detail": "Username or password is incorrect"
}
```

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "a7f8d6c5b4e3..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "b8g9e7d6c5f4...",
  "expiresIn": 3600
}
```

### Authorization Header

All protected endpoints require JWT token:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Journal Entries API

### List Journal Entries

**Endpoint:** `GET /api/journal-entries`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `pageSize` | int | 20 | Items per page |
| `fiscalYearId` | string | - | Filter by fiscal year |
| `status` | string | - | Filter by status (Draft, Posted) |
| `journalCode` | string | - | Filter by journal code |
| `startDate` | date | - | Filter by start date (YYYY-MM-DD) |
| `endDate` | date | - | Filter by end date (YYYY-MM-DD) |
| `searchTerm` | string | - | Search in reference/description |

**Example Request:**
```
GET /api/journal-entries?page=1&pageSize=20&fiscalYearId=fy-2026&status=Posted
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "entryId": "entry-123",
      "entryNumber": 1,
      "entryDate": "2026-02-05",
      "journalCode": "VTE",
      "journalName": "Ventes",
      "reference": "FAC-2026-001",
      "description": "Sale to Client ABC",
      "status": "Posted",
      "totalDebit": 11900.00,
      "totalCredit": 11900.00,
      "createdAt": "2026-02-05T10:30:00Z",
      "createdBy": "Admin User",
      "postedAt": "2026-02-05T11:00:00Z",
      "postedBy": "Admin User"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

### Get Journal Entry

**Endpoint:** `GET /api/journal-entries/{id}`

**Response (200 OK):**
```json
{
  "entryId": "entry-123",
  "entryNumber": 1,
  "entryDate": "2026-02-05",
  "journalCode": "VTE",
  "journalName": "Ventes",
  "reference": "FAC-2026-001",
  "description": "Sale to Client ABC",
  "status": "Posted",
  "totalDebit": 11900.00,
  "totalCredit": 11900.00,
  "lines": [
    {
      "lineId": "line-1",
      "lineNumber": 1,
      "accountNumber": "411",
      "accountLabel": "Clients",
      "thirdPartyCode": "CLI-001",
      "thirdPartyName": "Client ABC",
      "label": "Sale invoice FAC-2026-001",
      "debit": 11900.00,
      "credit": 0.00
    },
    {
      "lineId": "line-2",
      "lineNumber": 2,
      "accountNumber": "700",
      "accountLabel": "Ventes de marchandises",
      "thirdPartyCode": null,
      "thirdPartyName": null,
      "label": "Revenue from sale",
      "debit": 0.00,
      "credit": 10000.00
    },
    {
      "lineId": "line-3",
      "lineNumber": 3,
      "accountNumber": "4457",
      "accountLabel": "TVA collectée",
      "thirdPartyCode": null,
      "thirdPartyName": null,
      "label": "VAT 19%",
      "debit": 0.00,
      "credit": 1900.00
    }
  ],
  "validationHash": "A1B2C3D4E5F6...",
  "previousHash": "Z9Y8X7W6V5...",
  "createdAt": "2026-02-05T10:30:00Z",
  "createdBy": "Admin User",
  "postedAt": "2026-02-05T11:00:00Z",
  "postedBy": "Admin User"
}
```

**Error (404 Not Found):**
```json
{
  "type": "NotFound",
  "title": "Journal entry not found",
  "status": 404,
  "detail": "Entry with ID 'entry-999' does not exist"
}
```

### Create Journal Entry

**Endpoint:** `POST /api/journal-entries`

**Request:**
```json
{
  "entryDate": "2026-02-05",
  "journalCode": "VTE",
  "reference": "FAC-2026-002",
  "description": "Sale to Client XYZ",
  "fiscalYearId": "fy-2026",
  "lines": [
    {
      "accountId": "acc-411",
      "thirdPartyId": "tp-002",
      "label": "Sale invoice FAC-2026-002",
      "debit": 5950.00,
      "credit": 0.00
    },
    {
      "accountId": "acc-700",
      "label": "Revenue from sale",
      "debit": 0.00,
      "credit": 5000.00
    },
    {
      "accountId": "acc-4457",
      "label": "VAT 19%",
      "debit": 0.00,
      "credit": 950.00
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "entryId": "entry-456",
  "entryNumber": 2,
  "message": "Journal entry created successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "type": "ValidationError",
  "title": "Validation failed",
  "status": 400,
  "errors": {
    "Lines": [
      "Entry must be balanced (total debit = total credit)"
    ],
    "Lines[0].AccountId": [
      "Account is required"
    ]
  }
}
```

### Post Journal Entry

**Endpoint:** `POST /api/journal-entries/{id}/post`

**Response (200 OK):**
```json
{
  "message": "Journal entry posted successfully",
  "validationHash": "A1B2C3D4E5F6...",
  "postedAt": "2026-02-05T11:00:00Z"
}
```

**Error (409 Conflict):**
```json
{
  "type": "BusinessRuleViolation",
  "title": "Cannot post entry",
  "status": 409,
  "detail": "Entry is not balanced or already posted"
}
```

### Void Journal Entry

**Endpoint:** `POST /api/journal-entries/{id}/void`

**Request:**
```json
{
  "reason": "Invoice cancelled by client"
}
```

**Response (200 OK):**
```json
{
  "message": "Journal entry voided successfully",
  "reversalEntryId": "entry-789",
  "reversalEntryNumber": 3
}
```

---

## Accounts API

### List Accounts

**Endpoint:** `GET /api/accounts`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `accountClass` | int | - | Filter by class (1-7) |
| `searchTerm` | string | - | Search in number/label |

**Response (200 OK):**
```json
{
  "items": [
    {
      "accountId": "acc-411",
      "accountNumber": "411",
      "accountLabel": "Clients",
      "accountClass": 4,
      "accountType": "Asset",
      "requiresThirdParty": true,
      "isActive": true
    },
    {
      "accountId": "acc-700",
      "accountNumber": "700",
      "accountLabel": "Ventes de marchandises",
      "accountClass": 7,
      "accountType": "Revenue",
      "requiresThirdParty": false,
      "isActive": true
    }
  ],
  "totalCount": 120
}
```

### Get Account

**Endpoint:** `GET /api/accounts/{id}`

**Response (200 OK):**
```json
{
  "accountId": "acc-411",
  "accountNumber": "411",
  "accountLabel": "Clients",
  "accountClass": 4,
  "accountType": "Asset",
  "requiresThirdParty": true,
  "isActive": true,
  "balance": {
    "debit": 150000.00,
    "credit": 120000.00,
    "balance": 30000.00
  }
}
```

### Create Account

**Endpoint:** `POST /api/accounts`

**Request:**
```json
{
  "accountNumber": "512",
  "accountLabel": "Banque BADR",
  "accountClass": 5,
  "accountType": "Asset"
}
```

**Response (201 Created):**
```json
{
  "accountId": "acc-512",
  "message": "Account created successfully"
}
```

---

## Third Parties API

### List Third Parties

**Endpoint:** `GET /api/third-parties`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `thirdPartyType` | string | - | Filter by type (Client, Supplier, Employee) |
| `searchTerm` | string | - | Search in code/name |

**Response (200 OK):**
```json
{
  "items": [
    {
      "thirdPartyId": "tp-001",
      "code": "CLI-001",
      "name": "Client ABC SARL",
      "thirdPartyType": "Client",
      "nif": "099123456789012",
      "nis": "123456789012345",
      "rc": "16B0123456",
      "address": "123 Rue Didouche Mourad, Algiers",
      "phone": "+213 21 12 34 56",
      "email": "contact@clientabc.dz"
    }
  ],
  "totalCount": 45
}
```

### Create Third Party

**Endpoint:** `POST /api/third-parties`

**Request:**
```json
{
  "code": "CLI-002",
  "name": "Client XYZ EURL",
  "thirdPartyType": "Client",
  "nif": "099987654321098",
  "nis": "987654321098765",
  "rc": "16B9876543",
  "address": "456 Boulevard Zirout Youcef, Algiers",
  "phone": "+213 21 98 76 54",
  "email": "info@clientxyz.dz"
}
```

**Response (201 Created):**
```json
{
  "thirdPartyId": "tp-002",
  "message": "Third party created successfully"
}
```

---

## Reports API

### Get Trial Balance

**Endpoint:** `GET /api/reports/trial-balance`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fiscalYearId` | string | Yes | Fiscal year ID |
| `asOfDate` | date | No | As of date (default: today) |

**Response (200 OK):**
```json
{
  "fiscalYearId": "fy-2026",
  "fiscalYear": 2026,
  "asOfDate": "2026-02-05",
  "lines": [
    {
      "accountNumber": "411",
      "accountLabel": "Clients",
      "openingDebit": 50000.00,
      "openingCredit": 0.00,
      "periodDebit": 100000.00,
      "periodCredit": 80000.00,
      "closingDebit": 70000.00,
      "closingCredit": 0.00
    },
    {
      "accountNumber": "700",
      "accountLabel": "Ventes de marchandises",
      "openingDebit": 0.00,
      "openingCredit": 0.00,
      "periodDebit": 0.00,
      "periodCredit": 500000.00,
      "closingDebit": 0.00,
      "closingCredit": 500000.00
    }
  ],
  "totals": {
    "openingDebit": 200000.00,
    "openingCredit": 200000.00,
    "periodDebit": 500000.00,
    "periodCredit": 500000.00,
    "closingDebit": 700000.00,
    "closingCredit": 700000.00
  }
}
```

### Get General Ledger

**Endpoint:** `GET /api/reports/general-ledger`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fiscalYearId` | string | Yes | Fiscal year ID |
| `accountId` | string | No | Filter by account |
| `startDate` | date | No | Start date |
| `endDate` | date | No | End date |

**Response (200 OK):**
```json
{
  "fiscalYearId": "fy-2026",
  "accountNumber": "411",
  "accountLabel": "Clients",
  "entries": [
    {
      "entryDate": "2026-02-05",
      "entryNumber": 1,
      "label": "Sale invoice FAC-2026-001",
      "thirdPartyCode": "CLI-001",
      "thirdPartyName": "Client ABC",
      "debit": 11900.00,
      "credit": 0.00,
      "balance": 11900.00
    },
    {
      "entryDate": "2026-02-10",
      "entryNumber": 5,
      "label": "Payment received",
      "thirdPartyCode": "CLI-001",
      "thirdPartyName": "Client ABC",
      "debit": 0.00,
      "credit": 11900.00,
      "balance": 0.00
    }
  ]
}
```

### Export Report

**Endpoint:** `POST /api/reports/export`

**Request:**
```json
{
  "reportType": "TrialBalance",
  "fiscalYearId": "fy-2026",
  "format": "PDF",
  "includeDetails": true
}
```

**Response (200 OK):**
```json
{
  "downloadUrl": "/api/reports/download/trial-balance-2026.pdf",
  "fileName": "Balance_2026.pdf",
  "fileSize": 125000,
  "expiresAt": "2026-02-05T12:00:00Z"
}
```

---

## Error Handling

### Error Response Format

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "ErrorType",
  "title": "Short error description",
  "status": 400,
  "detail": "Detailed error message",
  "instance": "/api/journal-entries/123",
  "errors": {
    "FieldName": ["Error message 1", "Error message 2"]
  }
}
```

### Error Types

| Status | Type | Description |
|--------|------|-------------|
| **400** | `ValidationError` | Request validation failed |
| **401** | `AuthenticationError` | Authentication required or failed |
| **403** | `AuthorizationError` | Insufficient permissions |
| **404** | `NotFound` | Resource not found |
| **409** | `BusinessRuleViolation` | Business rule constraint violated |
| **429** | `RateLimitExceeded` | Too many requests |
| **500** | `InternalServerError` | Unexpected server error |

---

## Rate Limiting

### Limits

| User Type | Requests/Minute | Burst |
|-----------|-----------------|-------|
| **Anonymous** | 10 | 20 |
| **Authenticated** | 100 | 200 |
| **Administrator** | 1000 | 2000 |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643976000
```

### Rate Limit Exceeded Response

```json
{
  "type": "RateLimitExceeded",
  "title": "Too many requests",
  "status": 429,
  "detail": "Rate limit exceeded. Please try again in 60 seconds.",
  "retryAfter": 60
}
```

---

## OpenAPI / Swagger

### Interactive Documentation

Access Swagger UI at:
```
http://localhost:5000/swagger/index.html
```

### OpenAPI Specification

Download OpenAPI JSON:
```
http://localhost:5000/swagger/v1/swagger.json
```

---

## Postman Collection

### Import Collection

```json
{
  "info": {
    "name": "TOTALFISC API",
    "description": "Complete API collection for TOTALFISC",
    "version": "2.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api",
      "type": "string"
    },
    {
      "key": "accessToken",
      "value": "",
      "type": "string"
    }
  ]
}
```

---

## Conclusion

The TOTALFISC API provides:

✅ **RESTful Design** - Standard HTTP methods and status codes  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Comprehensive Documentation** - Swagger UI + Postman collection  
✅ **Error Handling** - RFC 7807 Problem Details  
✅ **Rate Limiting** - Prevent abuse  
✅ **Versioning** - Forward compatibility  

This API enables integration with external systems, mobile apps, and third-party tools while maintaining security and performance.

---

**Related Documents:**
- [AUTHENTICATION.md](AUTHENTICATION.md) - JWT token implementation
- [AUTHORIZATION.md](AUTHORIZATION.md) - RBAC permissions
- [CQRS_IMPLEMENTATION.md](CQRS_IMPLEMENTATION.md) - Command/Query handlers
