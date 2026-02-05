# TROUBLESHOOTING_GUIDE.md
# TOTALFISC - Troubleshooting Guide

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Support:** support@totalfisc.dz  

---

## Table of Contents

1. [Common Issues](#common-issues)
2. [Installation Problems](#installation-problems)
3. [Login & Authentication](#login--authentication)
4. [Database Issues](#database-issues)
5. [Performance Problems](#performance-problems)
6. [Reporting Errors](#reporting-errors)
7. [License Issues](#license-issues)
8. [Getting Support](#getting-support)

---

## Common Issues

### Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| **Application won't start** | Run as Administrator |
| **Slow performance** | Close unused applications |
| **Can't save entry** | Check entry is balanced |
| **Report won't generate** | Verify fiscal year is open |
| **License invalid** | Check system date/time |

---

## Installation Problems

### Issue 1: Installation Failed

**Error Message:**
```
Error 1603: Fatal error during installation
```

**Possible Causes:**
- Insufficient permissions
- Antivirus blocking
- Corrupted installer
- Previous version conflict

**Solutions:**

**Solution A: Run as Administrator**
```
1. Right-click installer
2. Select "Run as administrator"
3. Retry installation
```

**Solution B: Disable Antivirus Temporarily**
```
1. Disable antivirus
2. Run installer
3. Re-enable antivirus
4. Add TOTALFISC to whitelist
```

**Solution C: Clean Previous Installation**
```powershell
# Run in PowerShell (as Administrator)
$appData = "$env:LOCALAPPDATA\TOTALFISC"
$programData = "$env:ProgramData\TOTALFISC"

Remove-Item -Path $appData -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path $programData -Recurse -Force -ErrorAction SilentlyContinue

# Remove registry keys
Remove-Item -Path "HKCU:\Software\TOTALFISC" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKLM:\Software\TOTALFISC" -Recurse -Force -ErrorAction SilentlyContinue

# Retry installation
```

### Issue 2: Missing .NET Runtime

**Error Message:**
```
To run this application, you must install .NET Desktop Runtime 9.0
```

**Solution:**
```
1. Download .NET 9 Runtime: https://dotnet.microsoft.com/download/dotnet/9.0
2. Install Desktop Runtime (x64)
3. Restart computer
4. Retry TOTALFISC installation
```

### Issue 3: WebView2 Not Found

**Error Message:**
```
WebView2 Runtime is required but not installed
```

**Solution:**
```
1. Download WebView2: https://go.microsoft.com/fwlink/?linkid=2124701
2. Run installer
3. Restart TOTALFISC
```

---

## Login & Authentication

### Issue 1: Forgot Password

**Symptom:** Can't remember administrator password

**Solution:**
```
1. Click "Forgot Password?" on login screen
2. Contact system administrator
3. Administrator can reset via:
   - Settings → Users → [Select User] → Reset Password
```

**Emergency Reset (if admin locked out):**
```powershell
# Run in PowerShell (as Administrator)
cd "C:\Program Files\TOTALFISC"
.\TOTALFISC.exe --reset-admin-password

# Follow prompts to set new password
```

### Issue 2: Invalid Credentials

**Error Message:**
```
Invalid username or password
```

**Checklist:**
- ✅ Check Caps Lock is OFF
- ✅ Verify username spelling
- ✅ Try copying/pasting password
- ✅ Check keyboard language (FR/AR/EN)

**Still not working?**
```
Account may be locked after 5 failed attempts.
Wait 15 minutes or contact administrator.
```

### Issue 3: Token Expired

**Error Message:**
```
Your session has expired. Please log in again.
```

**Solution:**
```
This is normal after 1 hour of inactivity.
Simply log in again to continue.
```

---

## Database Issues

### Issue 1: Database Locked

**Error Message:**
```
Database file is locked by another process
```

**Solution:**

**Step 1: Close all instances**
```powershell
# Open Task Manager (Ctrl+Shift+Esc)
# Find "TOTALFISC.exe"
# End all instances
```

**Step 2: Delete lock files**
```powershell
cd "$env:ProgramData\TOTALFISC\Database"
del *.db-wal
del *.db-shm
```

**Step 3: Restart application**

### Issue 2: Database Corrupted

**Error Message:**
```
Database file is malformed or encrypted with a different key
```

**Solution:**

**Step 1: Restore from backup**
```
1. Menu → Settings → Backup → Restore
2. Select most recent backup
3. Confirm restoration
```

**Step 2: Verify integrity**
```sql
-- Run integrity check
PRAGMA integrity_check;
-- Should return: ok
```

**Step 3: If no backup available**
```
Contact support immediately!
Do NOT attempt manual repairs.
```

### Issue 3: Disk Full

**Error Message:**
```
Unable to save: disk full or quota exceeded
```

**Solution:**
```
1. Check free disk space (need at least 1 GB)
2. Delete temporary files:
   - C:\Windows\Temp
   - %TEMP%
3. Move database to drive with more space:
   - Settings → Database → Change Location
```

---

## Performance Problems

### Issue 1: Slow Startup

**Symptom:** Application takes > 10 seconds to start

**Possible Causes:**
- Large database (>1 GB)
- Antivirus scanning
- Low RAM (<4 GB)
- HDD instead of SSD

**Solutions:**

**Solution A: Add antivirus exception**
```
Add to antivirus whitelist:
- C:\Program Files\TOTALFISC
- %ProgramData%\TOTALFISC
```

**Solution B: Optimize database**
```
Menu → Settings → Maintenance → Optimize Database
```

**Solution C: Upgrade hardware**
```
Recommended:
- RAM: 8 GB
- Storage: SSD
- CPU: Quad-core 2.5 GHz+
```

### Issue 2: Report Generation Slow

**Symptom:** Reports take >30 seconds to generate

**Solution:**

**Step 1: Limit date range**
```
Instead of: 01/01/2020 - 31/12/2026
Use:        01/01/2026 - 31/12/2026
```

**Step 2: Archive old data**
```
Menu → Settings → Maintenance → Archive Old Years
Select years to archive (>3 years old)
```

**Step 3: Close unused applications**
```
Close:
- Web browsers
- Email clients
- Other accounting software
```

### Issue 3: High Memory Usage

**Symptom:** Application using >500 MB RAM

**Solution:**
```
1. Restart application
2. Close unused journal entry tabs
3. Reduce report frequency
4. Check for memory leaks (contact support)
```

---

## Reporting Errors

### Issue 1: Report Shows Zero

**Symptom:** Trial balance shows all zeros

**Possible Causes:**
- Wrong fiscal year selected
- No entries in period
- Entries not posted

**Solution:**
```
1. Verify fiscal year: Reports → Select correct year
2. Check entries exist: Journal Entries → View list
3. Ensure entries are posted: Status = "Posted"
```

### Issue 2: Unbalanced Report

**Error Message:**
```
Trial balance is unbalanced!
Total Debit:  500,000
Total Credit: 499,999
Difference:   1
```

**Solution:**

**Step 1: Find unbalanced entries**
```sql
SELECT EntryId, TotalDebit, TotalCredit
FROM JournalEntries
WHERE ABS(TotalDebit - TotalCredit) > 0.01;
```

**Step 2: Correct the entry**
```
1. Navigate to unbalanced entry
2. Adjust amounts to balance
3. Save and post
```

**Step 3: Re-generate report**

### Issue 3: Export Failed

**Error Message:**
```
Failed to export report to PDF
```

**Solutions:**

**Solution A: Check disk space**
```
Ensure at least 500 MB free space
```

**Solution B: Check permissions**
```
Verify write access to export folder
```

**Solution C: Try different format**
```
Export to Excel instead of PDF
```

---

## License Issues

### Issue 1: License Not Found

**Error Message:**
```
License file not found. Please contact your vendor.
```

**Solution:**
```
1. Check license file exists:
   C:\Program Files\TOTALFISC\license.key

2. If missing, copy from email/USB drive

3. Restart application
```

### Issue 2: Invalid Signature

**Error Message:**
```
Invalid license signature. File may be corrupted or tampered.
```

**Solution:**
```
1. Re-download license file from vendor
2. DO NOT edit license.key file manually
3. Replace corrupted file with new copy
4. Restart application
```

### Issue 3: Hardware Mismatch

**Error Message:**
```
This license is not valid for this computer.
Hardware ID: A1B2C3D4E5F6G7H8
```

**Cause:** License tied to different computer

**Solution:**
```
1. Contact vendor with Hardware ID shown
2. Request license transfer
3. Vendor will generate new license for this computer
4. Install new license.key
```

### Issue 4: License Expired

**Error Message:**
```
License expired on 05/02/2026. Please renew.
```

**Solution:**
```
1. Contact vendor for renewal
2. Provide License ID
3. Purchase renewal
4. Install renewed license.key
```

### Issue 5: Trial Period Expired

**Error Message:**
```
30-day trial period has ended.
```

**Solution:**
```
1. Purchase full license
2. Contact: sales@totalfisc.dz
3. Install full license to continue
```

---

## Getting Support

### Before Contacting Support

Gather this information:

✅ **System Information:**
```
Menu → Help → About
- Application version
- OS version
- License ID
```

✅ **Error Details:**
```
- Exact error message
- Steps to reproduce
- Screenshots (if visual issue)
```

✅ **Log Files:**
```
Location: %ProgramData%\TOTALFISC\Logs
Latest file: TOTALFISC_2026-02-05.log
```

### Support Channels

#### Email Support
```
📧 Email: support@totalfisc.dz
⏱️ Response time: 4 hours (business days)
📎 Attach: Log files, screenshots
```

#### Phone Support
```
📞 Phone: +213 21 XX XX XX
⏰ Hours: 8:00 - 17:00 (Sunday - Thursday)
🌍 Language: Arabic, French, English
```

#### Remote Assistance
```
1. Contact support
2. Provide case number
3. Install TeamViewer
4. Share session ID
```

#### Online Resources
```
🌐 Website: www.totalfisc.dz
📚 Documentation: docs.totalfisc.dz
🎥 Video Tutorials: youtube.com/totalfisc
❓ FAQ: faq.totalfisc.dz
```

### Support Tiers

| Tier | Response Time | Channels | Cost |
|------|---------------|----------|------|
| **Community** | Best effort | Forum | Free |
| **Standard** | 8 hours | Email | Included |
| **Priority** | 4 hours | Email, Phone | +30% |
| **Enterprise** | 1 hour | All + On-site | Custom |

---

## Diagnostic Tools

### Built-in Diagnostics

**Run Diagnostic:**
```
Menu → Help → Run Diagnostics

Checks:
✅ Database connectivity
✅ File permissions
✅ License validity
✅ Disk space
✅ Memory usage
✅ System compatibility
```

### Manual Checks

**Check Database Connection:**
```powershell
cd "C:\Program Files\TOTALFISC"
.\TOTALFISC.exe --test-database
```

**Check License:**
```powershell
.\TOTALFISC.exe --validate-license
```

**Show Hardware ID:**
```powershell
.\TOTALFISC.exe --show-hardware-id
```

**Export Logs:**
```powershell
.\TOTALFISC.exe --export-logs
```

---

## Advanced Troubleshooting

### Reset Application Settings

**Warning:** This will reset all preferences!

```powershell
# Backup settings first
Copy-Item "$env:LOCALAPPDATA\TOTALFISC\settings.json" `
          "$env:USERPROFILE\Desktop\settings_backup.json"

# Delete settings
Remove-Item "$env:LOCALAPPDATA\TOTALFISC\settings.json"

# Restart application (settings will be recreated with defaults)
```

### Repair Installation

```
1. Control Panel → Programs → TOTALFISC
2. Click "Repair"
3. Follow wizard
4. Restart computer
```

### Clean Reinstall

**Warning:** This will remove all local data!

```
1. Backup database:
   Menu → Settings → Backup → Create Backup

2. Uninstall:
   Control Panel → Programs → Uninstall TOTALFISC

3. Clean remaining files:
   - C:\Program Files\TOTALFISC
   - %LOCALAPPDATA%\TOTALFISC
   - %PROGRAMDATA%\TOTALFISC

4. Reinstall from fresh installer

5. Restore backup:
   Menu → Settings → Backup → Restore
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| **1001** | Database locked | Close other instances |
| **1002** | Database corrupted | Restore from backup |
| **2001** | License not found | Install license.key |
| **2002** | License expired | Renew license |
| **2003** | Hardware mismatch | Request license transfer |
| **3001** | Authentication failed | Check credentials |
| **3002** | Session expired | Log in again |
| **4001** | Unbalanced entry | Fix entry amounts |
| **4002** | Closed fiscal year | Reopen or use correct year |
| **5001** | Disk full | Free up space |
| **5002** | Permission denied | Run as Administrator |

---

## Conclusion

Most issues can be resolved by:

1. ✅ Restarting the application
2. ✅ Checking system requirements
3. ✅ Verifying license validity
4. ✅ Restoring from backup
5. ✅ Contacting support

**Remember:** Always backup before major changes!

---

**Related Documents:**
- [USER_GUIDE.md](USER_GUIDE.md) - How to use TOTALFISC
- [DEPLOYMENT.md](DEPLOYMENT.md) - Installation guide
- [DATA_SECURITY.md](DATA_SECURITY.md) - Backup procedures
