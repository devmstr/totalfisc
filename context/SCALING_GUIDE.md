# SCALING_GUIDE.md
# TOTALFISC - Scaling Guide

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Purpose:** Scale from desktop to multi-tenant cloud  

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Cloud Migration Strategy](#cloud-migration-strategy)
3. [Multi-Tenant Architecture](#multi-tenant-architecture)
4. [Performance at Scale](#performance-at-scale)
5. [Infrastructure as Code](#infrastructure-as-code)

---

## Current Architecture

### Desktop Application (v1.0)

```
┌─────────────────────────────────────────┐
│        Customer Site (On-Premise)       │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │    TOTALFISC Desktop      │   │
│  │  ┌─────────┐   ┌──────────────┐ │   │
│  │  │  WPF    │   │  WebView2    │ │   │
│  │  │  Shell  │◄──┤  (React UI)  │ │   │
│  │  └─────────┘   └──────────────┘ │   │
│  │         │                        │   │
│  │         ▼                        │   │
│  │  ┌─────────────────────────┐    │   │
│  │  │   ASP.NET Core API      │    │   │
│  │  │   (localhost:5000)      │    │   │
│  │  └─────────────────────────┘    │   │
│  │         │                        │   │
│  │         ▼                        │   │
│  │  ┌─────────────────────────┐    │   │
│  │  │ SQLite + SQLCipher      │    │   │
│  │  │ (totalfisc.db)   │    │   │
│  │  └─────────────────────────┘    │   │
│  └──────────────────────────────────┘   │
│                                          │
└─────────────────────────────────────────┘

Characteristics:
✅ Single-tenant (one company per installation)
✅ Data stored locally
✅ No internet required for operation
✅ Simple deployment
❌ No collaboration between users
❌ Manual updates
❌ Limited to Windows
```

### Target: Cloud SaaS (v2.0)

```
┌─────────────────────────────────────────────────────────────┐
│                  CLOUD ARCHITECTURE (v2.0)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Users (Browser/Mobile)                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  │User 1│  │User 2│  │User 3│  │User N│                   │
│  └──────┘  └──────┘  └──────┘  └──────┘                   │
│      │         │         │         │                        │
│      └─────────┴─────────┴─────────┘                        │
│                  │                                           │
│                  ▼                                           │
│  ┌─────────────────────────────────────────┐                │
│  │      Load Balancer (Azure LB)           │                │
│  └─────────────────────────────────────────┘                │
│                  │                                           │
│         ┌────────┴────────┐                                 │
│         ▼                 ▼                                 │
│  ┌───────────┐     ┌───────────┐                           │
│  │ Web App 1 │     │ Web App 2 │   (Auto-scale)            │
│  │ (React)   │     │ (React)   │                           │
│  └───────────┘     └───────────┘                           │
│         │                 │                                  │
│         └────────┬────────┘                                 │
│                  │                                           │
│                  ▼                                           │
│  ┌─────────────────────────────────────────┐                │
│  │   API Gateway (Azure API Management)    │                │
│  └─────────────────────────────────────────┘                │
│                  │                                           │
│         ┌────────┴────────┐                                 │
│         ▼                 ▼                                 │
│  ┌───────────┐     ┌───────────┐                           │
│  │ API Svc 1 │     │ API Svc 2 │   (Auto-scale)            │
│  │ (.NET)    │     │ (.NET)    │                           │
│  └───────────┘     └───────────┘                           │
│         │                 │                                  │
│         └────────┬────────┘                                 │
│                  │                                           │
│         ┌────────┴────────┐                                 │
│         ▼                 ▼                                 │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  PostgreSQL  │  │     Redis    │                        │
│  │  (Primary)   │  │   (Cache)    │                        │
│  └──────────────┘  └──────────────┘                        │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │  PostgreSQL  │                                           │
│  │  (Replica)   │                                           │
│  └──────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Characteristics:
✅ Multi-tenant (many companies on same infrastructure)
✅ Data in cloud (with backups)
✅ Real-time collaboration
✅ Automatic updates
✅ Access from anywhere
✅ Mobile support
```

---

## Cloud Migration Strategy

### Phase 1: Hybrid (Desktop + Cloud Services)

**Timeline:** Months 13-18 (2027)

```
Desktop App
    │
    ├─► Local database (still SQLite)
    │
    └─► Cloud services:
         ├─ License validation
         ├─ Automatic updates
         ├─ Usage analytics
         └─ Remote backup (optional)
```

**Changes Required:**
- Add license validation API calls
- Implement automatic update checker
- Optional: Cloud backup to Azure Blob Storage

**Benefits:**
- Retain offline capability
- Add cloud benefits gradually
- Minimize disruption to existing customers

---

### Phase 2: Cloud-Native (Full SaaS)

**Timeline:** Months 19-24 (2027-2028)

#### Step 1: Database Migration (SQLite → PostgreSQL)

**Why PostgreSQL?**
- Better multi-tenant support
- Row-level security (RLS)
- Better concurrency
- Industry standard for SaaS

**Migration Strategy:**

```csharp
public class DatabaseMigrationService
{
    public async Task MigrateToPostgresAsync(
        string sqlitePath,
        string postgresConnectionString,
        string tenantId)
    {
        // 1. Export from SQLite
        var data = await ExportFromSQLiteAsync(sqlitePath);

        // 2. Transform data
        var transformedData = TransformForMultiTenant(data, tenantId);

        // 3. Import to PostgreSQL
        await ImportToPostgresAsync(postgresConnectionString, transformedData);

        // 4. Verify data integrity
        await VerifyMigrationAsync(sqlitePath, postgresConnectionString, tenantId);
    }

    private async Task<DatabaseSnapshot> ExportFromSQLiteAsync(string sqlitePath)
    {
        await using var conn = new SqliteConnection($"Data Source={sqlitePath}");
        await conn.OpenAsync();

        var snapshot = new DatabaseSnapshot();

        // Export all tables
        snapshot.Accounts = await ExportTableAsync<Account>(conn);
        snapshot.JournalEntries = await ExportTableAsync<JournalEntry>(conn);
        snapshot.JournalLines = await ExportTableAsync<JournalLine>(conn);
        snapshot.ThirdParties = await ExportTableAsync<ThirdParty>(conn);
        // ... etc

        return snapshot;
    }

    private DatabaseSnapshot TransformForMultiTenant(
        DatabaseSnapshot data,
        string tenantId)
    {
        // Add TenantId to all records
        foreach (var account in data.Accounts)
            account.TenantId = tenantId;

        foreach (var entry in data.JournalEntries)
            entry.TenantId = tenantId;

        // ... etc

        return data;
    }
}
```

#### Step 2: Multi-Tenant Schema Design

**Option A: Shared Schema (Recommended)**

```sql
-- All tenants in same tables, isolated by TenantId column

CREATE TABLE Accounts (
    AccountId UUID PRIMARY KEY,
    TenantId UUID NOT NULL,  -- Isolation column
    AccountNumber VARCHAR(20) NOT NULL,
    Label VARCHAR(200) NOT NULL,
    -- ... other fields
    CONSTRAINT UQ_Account_TenantNumber UNIQUE (TenantId, AccountNumber)
);

CREATE INDEX IX_Accounts_TenantId ON Accounts(TenantId);

-- Row Level Security (RLS)
ALTER TABLE Accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON Accounts
    USING (TenantId = current_setting('app.current_tenant')::UUID);
```

**Benefits:**
- ✅ Cost-effective (shared resources)
- ✅ Easy maintenance (single schema)
- ✅ Good performance with proper indexing

**Challenges:**
- ⚠️ Must ensure TenantId in every query
- ⚠️ Risk of data leakage if misconfigured

**Option B: Schema-per-Tenant**

```sql
-- Each tenant gets own schema

CREATE SCHEMA tenant_abc123;
CREATE TABLE tenant_abc123.Accounts (...);
CREATE TABLE tenant_abc123.JournalEntries (...);

CREATE SCHEMA tenant_def456;
CREATE TABLE tenant_def456.Accounts (...);
CREATE TABLE tenant_def456.JournalEntries (...);
```

**Benefits:**
- ✅ Strong isolation
- ✅ Easy to backup per tenant
- ✅ Can customize schema per tenant

**Challenges:**
- ⚠️ More complex migrations
- ⚠️ Harder to do cross-tenant analytics

**Option C: Database-per-Tenant**

```
- tenant_abc123_db
- tenant_def456_db
- tenant_ghi789_db
```

**Benefits:**
- ✅ Strongest isolation
- ✅ Can scale to different servers

**Challenges:**
- ❌ Expensive (many databases)
- ❌ Complex management

**Recommendation:** Start with **Shared Schema (Option A)**

---

## Multi-Tenant Architecture

### Tenant Resolution

**Step 1: Identify tenant from request**

```csharp
public class TenantResolutionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        // Extract tenant from:
        // 1. Subdomain: abc123.totalfisc.dz
        // 2. Custom domain: accounting.company.com
        // 3. JWT claim: "tenant_id"

        string tenantId = null;

        // Try subdomain
        var host = context.Request.Host.Host;
        var parts = host.Split('.');
        if (parts.Length > 2 && parts[0] != "www")
        {
            tenantId = parts[0];  // abc123
        }

        // Try JWT claim
        if (tenantId == null && context.User.Identity?.IsAuthenticated == true)
        {
            tenantId = context.User.FindFirst("tenant_id")?.Value;
        }

        // Resolve tenant
        if (tenantId != null)
        {
            var tenant = await _tenantStore.GetByIdAsync(tenantId);
            if (tenant != null)
            {
                context.Items["Tenant"] = tenant;

                // Set for database RLS
                await _dbContext.Database.ExecuteSqlRawAsync(
                    $"SET app.current_tenant = '{tenant.Id}'");
            }
        }

        await _next(context);
    }
}
```

### Tenant Context

```csharp
public interface ITenantContext
{
    Tenant CurrentTenant { get; }
    bool HasTenant { get; }
}

public class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public Tenant CurrentTenant => 
        _httpContextAccessor.HttpContext?.Items["Tenant"] as Tenant;

    public bool HasTenant => CurrentTenant != null;
}

// Usage in services
public class JournalEntryService
{
    private readonly ITenantContext _tenantContext;

    public async Task<JournalEntry> CreateAsync(CreateJournalEntryCommand command)
    {
        var entry = JournalEntry.Create(...);
        entry.TenantId = _tenantContext.CurrentTenant.Id;  // Set tenant

        await _repository.AddAsync(entry);
        return entry;
    }
}
```

### Tenant Management

```csharp
public class Tenant
{
    public string Id { get; set; }  // GUID
    public string Name { get; set; }  // Company name
    public string Subdomain { get; set; }  // abc123
    public string CustomDomain { get; set; }  // accounting.company.com

    // Subscription
    public string PlanId { get; set; }  // starter/professional/enterprise
    public DateTime SubscriptionStartDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public string Status { get; set; }  // active/trial/suspended/cancelled

    // Limits
    public int MaxUsers { get; set; }
    public int MaxJournalEntries { get; set; }
    public long MaxDatabaseSize { get; set; }  // bytes

    // Usage
    public int CurrentUsers { get; set; }
    public int CurrentJournalEntries { get; set; }
    public long CurrentDatabaseSize { get; set; }

    // Settings
    public string TimeZone { get; set; }
    public string Currency { get; set; }
    public string Language { get; set; }  // ar/fr/en
}
```

---

## Performance at Scale

### Caching Strategy

**Level 1: In-Memory Cache (per instance)**

```csharp
public class CachedAccountRepository : IAccountRepository
{
    private readonly IAccountRepository _inner;
    private readonly IMemoryCache _cache;

    public async Task<Account> GetByIdAsync(string id)
    {
        var cacheKey = $"account:{id}";

        if (_cache.TryGetValue(cacheKey, out Account cached))
            return cached;

        var account = await _inner.GetByIdAsync(id);

        _cache.Set(cacheKey, account, TimeSpan.FromMinutes(15));

        return account;
    }
}
```

**Level 2: Distributed Cache (Redis)**

```csharp
public class RedisAccountCache
{
    private readonly IDistributedCache _cache;

    public async Task<Account> GetOrSetAsync(
        string accountId,
        Func<Task<Account>> factory)
    {
        var cacheKey = $"account:{accountId}";

        // Try get from Redis
        var cached = await _cache.GetStringAsync(cacheKey);
        if (cached != null)
            return JsonSerializer.Deserialize<Account>(cached);

        // Fetch from database
        var account = await factory();

        // Store in Redis
        var serialized = JsonSerializer.Serialize(account);
        await _cache.SetStringAsync(
            cacheKey,
            serialized,
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            });

        return account;
    }
}
```

### Database Connection Pooling

```csharp
// Startup.cs
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);
    });
}, ServiceLifetime.Scoped);

// Connection string with pooling
"Host=postgres.azure.com;Database=totalfisc;Username=admin;Password=***;Pooling=true;MinPoolSize=10;MaxPoolSize=100;"
```

### Query Optimization

```csharp
// BAD: N+1 query problem
var entries = await _context.JournalEntries.ToListAsync();
foreach (var entry in entries)
{
    var lines = await _context.JournalLines
        .Where(l => l.EntryId == entry.EntryId)
        .ToListAsync();  // N queries!
}

// GOOD: Eager loading
var entries = await _context.JournalEntries
    .Include(e => e.Lines)  // Single query with JOIN
    .ToListAsync();

// BETTER: Projection (select only needed fields)
var entries = await _context.JournalEntries
    .Select(e => new {
        e.EntryId,
        e.EntryNumber,
        e.TotalDebit,
        LineCount = e.Lines.Count
    })
    .ToListAsync();
```

### Auto-Scaling Configuration

**Azure App Service:**

```json
{
  "name": "TOTALFISC-api",
  "sku": "P2v2",
  "autoScale": {
    "enabled": true,
    "min": 2,
    "max": 10,
    "rules": [
      {
        "metricName": "CpuPercentage",
        "operator": "GreaterThan",
        "threshold": 70,
        "scaleAction": "increase",
        "instanceCount": 1,
        "cooldown": "PT5M"
      },
      {
        "metricName": "CpuPercentage",
        "operator": "LessThan",
        "threshold": 30,
        "scaleAction": "decrease",
        "instanceCount": 1,
        "cooldown": "PT10M"
      }
    ]
  }
}
```

---

## Infrastructure as Code

### Terraform Configuration

```hcl
# main.tf

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "TOTALFISC-prod"
  location = "West Europe"
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server" "main" {
  name                = "TOTALFISC-db"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  sku_name   = "GP_Standard_D4s_v3"
  storage_mb = 131072  # 128 GB
  version    = "14"

  administrator_login    = "pgadmin"
  administrator_password = var.db_password

  backup_retention_days = 35
  geo_redundant_backup  = true
}

# Redis Cache
resource "azurerm_redis_cache" "main" {
  name                = "TOTALFISC-cache"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  capacity            = 2
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "TOTALFISC-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  os_type  = "Linux"
  sku_name = "P2v2"
}

# App Service (API)
resource "azurerm_linux_web_app" "api" {
  name                = "TOTALFISC-api"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true

    application_stack {
      dotnet_version = "9.0"
    }
  }

  app_settings = {
    "ConnectionStrings__DefaultConnection" = azurerm_postgresql_flexible_server.main.connection_string
    "Redis__ConnectionString" = azurerm_redis_cache.main.primary_connection_string
  }
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "TOTALFISC-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
}
```

---

## Conclusion

Scaling from desktop to cloud is a journey:

**Phase 1 (Current):** Desktop application, local database  
**Phase 2 (Year 2):** Hybrid, desktop + cloud services  
**Phase 3 (Year 3):** Full SaaS, multi-tenant cloud  

Follow this guide to scale smoothly while retaining existing customers!

---

**Related Documents:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](DEPLOYMENT.md) - Current deployment
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Performance tuning
