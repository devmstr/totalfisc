# OPERATIONS_MANUAL.md
# TOTALFISC - Operations Manual

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Audience:** IT Operations, DevOps, SysAdmins  

---

## Table of Contents

1. [Production Environment](#production-environment)
2. [Monitoring & Alerting](#monitoring--alerting)
3. [Backup & Recovery](#backup--recovery)
4. [Incident Response](#incident-response)
5. [Performance Tuning](#performance-tuning)
6. [Security Operations](#security-operations)
7. [Maintenance Procedures](#maintenance-procedures)

---

## Production Environment

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│              PRODUCTION INFRASTRUCTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐         ┌────────────────┐            │
│  │  Customer Site │         │  Customer Site │            │
│  │  (On-Premise)  │   ...   │  (On-Premise)  │            │
│  └────────────────┘         └────────────────┘            │
│         │                           │                       │
│         ├───────────────────────────┤                       │
│         │                           │                       │
│         ▼                           ▼                       │
│  ┌─────────────────────────────────────────┐               │
│  │     Central Management Server           │               │
│  │  (License validation, updates, stats)   │               │
│  │                                          │               │
│  │  ├─ License Server                      │               │
│  │  ├─ Update Server                       │               │
│  │  ├─ Analytics Server                    │               │
│  │  └─ Support Portal                      │               │
│  └─────────────────────────────────────────┘               │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────┐               │
│  │     Azure/AWS Infrastructure            │               │
│  │  ├─ App Service / EC2                   │               │
│  │  ├─ SQL Database (management data)      │               │
│  │  ├─ Blob Storage (updates, backups)     │               │
│  │  ├─ Application Insights                │               │
│  │  └─ Key Vault (secrets)                 │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Customer Deployment Model

**Type:** On-premise desktop application  
**Database:** Local SQLite (SQLCipher encrypted)  
**Updates:** Pull from central server  
**License:** Node-locked to hardware ID  

### Central Server Requirements

| Component | Specification | Purpose |
|-----------|--------------|---------|
| **App Service** | 2 vCPU, 4GB RAM | License validation, updates |
| **Database** | SQL Server (Basic tier) | Customer licenses, usage stats |
| **Storage** | 100GB blob storage | Software updates, backups |
| **CDN** | Standard tier | Update distribution |

**Estimated Cost:** 50,000 DZD/month (~$370 USD)

---

## Monitoring & Alerting

### Application Insights Integration

#### Key Metrics to Monitor

**Performance Metrics:**
```csharp
// Track API response time
var stopwatch = Stopwatch.StartNew();
try
{
    var result = await _handler.Handle(command);
    stopwatch.Stop();

    _telemetry.TrackMetric(
        "API_ResponseTime",
        stopwatch.ElapsedMilliseconds,
        new Dictionary<string, string>
        {
            ["Endpoint"] = "/api/journal-entries",
            ["Method"] = "POST"
        }
    );

    return result;
}
catch (Exception ex)
{
    _telemetry.TrackException(ex);
    throw;
}
```

**Database Metrics:**
```csharp
public async Task<T> ExecuteQueryAsync<T>(Func<Task<T>> query)
{
    var stopwatch = Stopwatch.StartNew();
    try
    {
        var result = await query();
        stopwatch.Stop();

        _telemetry.TrackMetric(
            "Database_QueryTime",
            stopwatch.ElapsedMilliseconds
        );

        return result;
    }
    catch (Exception ex)
    {
        _telemetry.TrackException(ex);
        throw;
    }
}
```

### Health Checks

```csharp
// Startup.cs
services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddCheck<LicenseHealthCheck>("license")
    .AddCheck<DatabaseIntegrityCheck>("database_integrity")
    .AddCheck<DiskSpaceHealthCheck>("disk_space");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

### Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| **High Error Rate** | >10 errors/5min | Email ops team |
| **Slow Response** | P95 >500ms | Email dev team |
| **Database Lock** | Lock duration >30s | SMS on-call |
| **Disk Space Low** | <10% free | Email ops team |
| **License Expiring** | <7 days remaining | Email customer + sales |

### Monitoring Dashboard

**Azure Application Insights Query:**
```kusto
// API performance over time
requests
| where timestamp > ago(24h)
| summarize 
    Requests = count(),
    AvgDuration = avg(duration),
    P95Duration = percentile(duration, 95),
    ErrorRate = countif(success == false) * 100.0 / count()
    by bin(timestamp, 5m)
| render timechart

// Top errors
exceptions
| where timestamp > ago(24h)
| summarize Count = count() by type, outerMessage
| order by Count desc
| take 10

// User activity
customEvents
| where name == "JournalEntryCreated"
| summarize Count = count() by bin(timestamp, 1h)
| render timechart
```

---

## Backup & Recovery

### Automatic Backup Strategy

#### Daily Backups

**Schedule:** Every day at 2:00 AM (local time)

**Backup Location:**
```
Primary:   C:\ProgramData\TOTALFISC\Backups\DailySecondary: \NetworkShare\TOTALFISC\BackupsCloud:     Azure Blob Storage (optional)
```

**Retention Policy:**
- Daily: Keep last 7 days
- Weekly: Keep last 4 weeks
- Monthly: Keep last 12 months
- Yearly: Keep last 3 years

#### Backup Implementation

```csharp
public class BackupService : IBackupService
{
    private readonly string _databasePath;
    private readonly string _backupFolder;

    public async Task CreateBackupAsync()
    {
        var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        var backupFileName = $"totalfisc_{timestamp}.db.enc";
        var backupPath = Path.Combine(_backupFolder, "Daily", backupFileName);

        // Create backup directory
        Directory.CreateDirectory(Path.GetDirectoryName(backupPath));

        // Copy database file (SQLite supports hot backup)
        await using (var source = new FileStream(_databasePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
        await using (var destination = new FileStream(backupPath, FileMode.Create, FileAccess.Write))
        {
            await source.CopyToAsync(destination);
        }

        // Verify backup integrity
        if (!await VerifyBackupAsync(backupPath))
        {
            throw new BackupException("Backup verification failed");
        }

        // Compress backup
        await CompressBackupAsync(backupPath);

        // Upload to cloud (if configured)
        if (_cloudBackupEnabled)
        {
            await UploadToCloudAsync(backupPath);
        }

        // Cleanup old backups
        await CleanupOldBackupsAsync();

        _logger.LogInformation("Backup created successfully: {BackupPath}", backupPath);
    }

    private async Task<bool> VerifyBackupAsync(string backupPath)
    {
        try
        {
            // Open backup database and run integrity check
            await using var connection = new SqliteConnection($"Data Source={backupPath}");
            await connection.OpenAsync();

            await using var command = connection.CreateCommand();
            command.CommandText = "PRAGMA integrity_check;";

            var result = await command.ExecuteScalarAsync();
            return result?.ToString() == "ok";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Backup verification failed");
            return false;
        }
    }
}
```

### Disaster Recovery Procedures

#### Scenario 1: Database Corruption

**Detection:**
```sql
PRAGMA integrity_check;
-- If returns anything other than "ok", database is corrupted
```

**Recovery Steps:**
```
1. Stop application immediately
2. Isolate corrupted database file
3. Restore from most recent backup:
   a. Copy backup file to database location
   b. Decompress if needed
   c. Rename to totalfisc.db
4. Verify restored database integrity
5. Restart application
6. Verify user can access data
7. Document incident
```

**PowerShell Script:**
```powershell
# restore-backup.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDate
)

$dbPath = "C:\ProgramData\TOTALFISC\Database\totalfisc.db"
$backupPath = "C:\ProgramData\TOTALFISC\Backups\Daily\totalfisc_$BackupDate.db.enc"

# Stop application
Stop-Process -Name "TOTALFISC" -Force -ErrorAction SilentlyContinue

# Backup corrupted database
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $dbPath "C:\ProgramData\TOTALFISC\Database\corrupted_$timestamp.db"

# Restore from backup
Copy-Item $backupPath $dbPath -Force

# Verify integrity
sqlite3.exe $dbPath "PRAGMA integrity_check;"

Write-Host "Restore complete. Please restart application."
```

#### Scenario 2: Complete System Failure

**Recovery Steps:**
```
1. Install TOTALFISC on new machine
2. Restore license.key file
3. Restore database from backup:
   - Copy latest backup to new system
   - Place in correct location
4. Verify application starts
5. Verify data integrity
6. Update hardware ID (may need new license)
```

#### Scenario 3: Accidental Data Deletion

**Recovery Steps:**
```
1. Stop application
2. Identify deletion timestamp
3. Restore backup from before deletion
4. Export deleted data
5. Restore current database
6. Re-import deleted data (if possible)
7. Verify data integrity
```

### Backup Testing

**Monthly Test:** Restore backup on test system

```powershell
# monthly-backup-test.ps1
$testPath = "C:\Temp\TOTALFISC_Test"
$latestBackup = Get-ChildItem "C:\ProgramData\TOTALFISC\Backups\Daily" | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1

# Create test directory
New-Item -ItemType Directory -Path $testPath -Force

# Copy backup
Copy-Item $latestBackup.FullName "$testPath	est.db"

# Test database integrity
$result = sqlite3.exe "$testPath	est.db" "PRAGMA integrity_check;"

if ($result -eq "ok") {
    Write-Host "✅ Backup test passed" -ForegroundColor Green
} else {
    Write-Host "❌ Backup test FAILED" -ForegroundColor Red
    # Send alert
}

# Cleanup
Remove-Item $testPath -Recurse -Force
```

---

## Incident Response

### Incident Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **Critical (P1)** | System down, data loss | 15 minutes | Database corruption, license server down |
| **High (P2)** | Major feature broken | 1 hour | Unable to post entries, reports failing |
| **Medium (P3)** | Minor feature broken | 4 hours | Export to PDF fails, UI glitch |
| **Low (P4)** | Cosmetic issue | 1 business day | Typo, minor UI improvement |

### Incident Response Process

```
┌─────────────────────────────────────────────────────────────┐
│                  INCIDENT RESPONSE FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DETECTION                                               │
│     ├─ Monitoring alert                                     │
│     ├─ Customer report                                      │
│     └─ Internal discovery                                   │
│                                                              │
│  2. TRIAGE                                                  │
│     ├─ Assess severity (P1-P4)                             │
│     ├─ Assign owner                                        │
│     └─ Create incident ticket                              │
│                                                              │
│  3. INVESTIGATION                                           │
│     ├─ Gather logs                                         │
│     ├─ Reproduce issue                                     │
│     └─ Identify root cause                                 │
│                                                              │
│  4. RESOLUTION                                              │
│     ├─ Apply fix                                           │
│     ├─ Test fix                                            │
│     └─ Deploy to production                                │
│                                                              │
│  5. COMMUNICATION                                           │
│     ├─ Notify affected customers                           │
│     ├─ Update status page                                  │
│     └─ Internal team notification                          │
│                                                              │
│  6. POST-MORTEM                                             │
│     ├─ Write incident report                               │
│     ├─ Identify prevention measures                        │
│     └─ Update runbooks                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Common Incidents & Solutions

#### Incident: Application Won't Start

**Symptoms:** Application crashes immediately after launch

**Investigation:**
```powershell
# Check logs
Get-Content "C:\ProgramData\TOTALFISC\Logs\*.log" -Tail 50

# Check database accessibility
Test-Path "C:\ProgramData\TOTALFISC\Database\totalfisc.db"

# Check license
.\TOTALFISC.exe --validate-license
```

**Common Causes:**
1. Database locked by another process
2. Corrupted database
3. Invalid license
4. Missing dependencies (.NET runtime, WebView2)

**Resolution:**
```powershell
# Kill any running instances
Get-Process TOTALFISC -ErrorAction SilentlyContinue | Stop-Process -Force

# Delete lock files
Remove-Item "C:\ProgramData\TOTALFISC\Database\*.db-wal"
Remove-Item "C:\ProgramData\TOTALFISC\Database\*.db-shm"

# Verify integrity
sqlite3.exe "C:\ProgramData\TOTALFISC\Database\totalfisc.db" "PRAGMA integrity_check;"

# Restart application
Start-Process "C:\Program Files\TOTALFISC\TOTALFISC.exe"
```

---

## Performance Tuning

### Database Optimization

#### Vacuum Database

**Purpose:** Reclaim unused space, improve performance

```sql
-- Run monthly
VACUUM;
ANALYZE;
```

**PowerShell Automation:**
```powershell
# monthly-database-maintenance.ps1
$dbPath = "C:\ProgramData\TOTALFISC\Database\totalfisc.db"

# Stop application
Stop-Process -Name "TOTALFISC" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

# Run maintenance
sqlite3.exe $dbPath "VACUUM; ANALYZE;"

Write-Host "Database maintenance complete"
```

#### Query Performance Analysis

```sql
-- Enable query profiling
PRAGMA query_only = ON;

-- Analyze slow queries
EXPLAIN QUERY PLAN
SELECT * FROM JournalEntries
WHERE FiscalYearId = 'fy-2026'
  AND Status = 'Posted'
ORDER BY EntryDate DESC;

-- Check index usage
PRAGMA index_list('JournalEntries');
PRAGMA index_info('IX_JournalEntries_FiscalYearId');
```

### Memory Optimization

**SQLite Cache Settings:**
```sql
-- Set cache size (in pages, 1 page = 4KB)
PRAGMA cache_size = 10000;  -- 40MB cache

-- Use memory for temp tables
PRAGMA temp_store = MEMORY;
```

**Application Memory:**
```csharp
// Dispose DbContext properly
services.AddDbContext<ApplicationDbContext>(
    options => options.UseSqlite(connectionString),
    ServiceLifetime.Scoped  // Important!
);

// Use AsNoTracking for read-only queries
var entries = await _context.JournalEntries
    .AsNoTracking()  // Reduces memory
    .ToListAsync();
```

---

## Security Operations

### Security Monitoring

**Failed Login Attempts:**
```csharp
public class LoginAuditMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/api/auth/login")
        {
            var stopwatch = Stopwatch.StartNew();
            await _next(context);
            stopwatch.Stop();

            if (context.Response.StatusCode == 401)
            {
                var username = await GetUsernameFromRequest(context.Request);

                _telemetry.TrackEvent("FailedLogin", new Dictionary<string, string>
                {
                    ["Username"] = username,
                    ["IPAddress"] = context.Connection.RemoteIpAddress?.ToString(),
                    ["Duration"] = stopwatch.ElapsedMilliseconds.ToString()
                });

                // Check for brute force
                if (await IsBruteForceAttempt(username, context.Connection.RemoteIpAddress))
                {
                    // Lock account
                    await LockAccount(username);

                    // Alert security team
                    await SendSecurityAlert($"Brute force detected: {username}");
                }
            }
        }
        else
        {
            await _next(context);
        }
    }
}
```

### Security Patching

**Monthly Security Updates:**
```powershell
# security-update.ps1
# Run first Tuesday of each month

# Update .NET runtime
winget upgrade Microsoft.DotNet.DesktopRuntime.9

# Update WebView2
winget upgrade Microsoft.EdgeWebView2Runtime

# Update application
.\TOTALFISCUpdate.exe /silent

# Verify versions
dotnet --list-runtimes
(Get-Item "C:\Program Files\TOTALFISC\TOTALFISC.exe").VersionInfo.FileVersion
```

---

## Maintenance Procedures

### Daily Maintenance

**Automated Tasks (2:00 AM):**
- ✅ Database backup
- ✅ Log rotation
- ✅ Temporary file cleanup
- ✅ Health check

### Weekly Maintenance

**Every Sunday (3:00 AM):**
- ✅ Database vacuum
- ✅ Full backup to network share
- ✅ Update check
- ✅ Performance report generation

### Monthly Maintenance

**First Sunday of month:**
- ✅ Backup verification test
- ✅ Security updates
- ✅ License expiration check
- ✅ Capacity planning review

### Quarterly Maintenance

**Every 3 months:**
- ✅ Full system audit
- ✅ Performance benchmarking
- ✅ Security assessment
- ✅ Disaster recovery drill

---

## Conclusion

Proper operations are critical for system reliability and customer satisfaction. Follow this manual to ensure:

✅ **High Availability** - Proactive monitoring and quick incident response  
✅ **Data Safety** - Robust backup and recovery procedures  
✅ **Performance** - Regular tuning and optimization  
✅ **Security** - Continuous monitoring and patching  
✅ **Compliance** - Documented procedures and audit trails  

**Remember:** Operations excellence builds customer trust and reduces support burden!

---

**Related Documents:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Installation procedures
- [DATA_SECURITY.md](DATA_SECURITY.md) - Security architecture
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Tuning guidelines
- [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) - Issue resolution
