# DATA_SECURITY.md
# TOTALFISC - Data Security & Encryption

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Security Level:** Enterprise-Grade  

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Database Encryption](#database-encryption)
3. [Password Security](#password-security)
4. [Hash Chain Integrity](#hash-chain-integrity)
5. [Sensitive Data Protection](#sensitive-data-protection)
6. [Backup Encryption](#backup-encryption)
7. [Key Management](#key-management)
8. [Compliance](#compliance)

---

## Security Overview

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Application Security                              │
│    ├─► JWT Authentication (RSA-2048)                       │
│    ├─► RBAC Authorization                                  │
│    └─► Input Validation                                    │
│                                                              │
│  Layer 2: Data Integrity                                    │
│    ├─► Hash Chain (SHA-256)                                │
│    ├─► Immutability Enforcement                            │
│    └─► Audit Trail                                         │
│                                                              │
│  Layer 3: Data Confidentiality                             │
│    ├─► Database Encryption (SQLCipher AES-256)            │
│    ├─► Sensitive Field Encryption                          │
│    └─► Password Hashing (BCrypt)                           │
│                                                              │
│  Layer 4: Storage Security                                  │
│    ├─► Encrypted Backups                                   │
│    ├─► Secure File Permissions                             │
│    └─► Physical Security (user responsibility)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Security Goals

| Goal | Implementation | Status |
|------|----------------|--------|
| **Confidentiality** | AES-256 encryption | ✅ |
| **Integrity** | SHA-256 hash chain | ✅ |
| **Availability** | Automated backups | ✅ |
| **Authentication** | JWT + BCrypt | ✅ |
| **Authorization** | RBAC permissions | ✅ |
| **Audit** | Complete trail | ✅ |
| **Non-Repudiation** | Digital signatures | ✅ |

---

## Database Encryption

### SQLCipher Integration

**SQLCipher** provides transparent AES-256 encryption for SQLite databases.

#### Installation

```xml
<PackageReference Include="SQLitePCLRaw.bundle_e_sqlcipher" Version="2.1.6" />
```

#### Configuration

```csharp
public class DatabaseConfiguration
{
    public static void ConfigureEncryption(DbContextOptionsBuilder options, string connectionString, string encryptionKey)
    {
        // Build connection string with encryption key
        var builder = new SqliteConnectionStringBuilder(connectionString)
        {
            Mode = SqliteOpenMode.ReadWriteCreate,
            Password = encryptionKey // SQLCipher encryption key
        };

        var connection = new SqliteConnection(builder.ConnectionString);

        options.UseSqlite(connection, sqliteOptions =>
        {
            sqliteOptions.CommandTimeout(30);
        });
    }
}
```

#### Usage in Startup

```csharp
// Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    var encryptionKey = GetEncryptionKey(); // From secure storage

    DatabaseConfiguration.ConfigureEncryption(options, connectionString, encryptionKey);
});

private static string GetEncryptionKey()
{
    // Option 1: From environment variable
    var key = Environment.GetEnvironmentVariable("DB_ENCRYPTION_KEY");

    if (string.IsNullOrEmpty(key))
    {
        // Option 2: Generate from machine key (hardware-bound)
        key = GenerateMachineKey();
    }

    if (string.IsNullOrEmpty(key))
    {
        throw new InvalidOperationException("Database encryption key not found");
    }

    return key;
}

private static string GenerateMachineKey()
{
    // Use Windows DPAPI to derive key from machine
    var hardwareId = new HardwareIdGenerator().GenerateHardwareId();

    // Protect key with DPAPI (machine scope)
    var entropy = Encoding.UTF8.GetBytes("TOTALFISC");
    var keyBytes = Encoding.UTF8.GetBytes(hardwareId);

    var protectedKey = ProtectedData.Protect(
        keyBytes,
        entropy,
        DataProtectionScope.LocalMachine
    );

    return Convert.ToBase64String(protectedKey);
}
```

### Encryption Key Derivation

```csharp
public class EncryptionKeyDerivation
{
    public static string DeriveKeyFromPassword(string password, byte[] salt)
    {
        // Use PBKDF2 to derive encryption key from password
        using var pbkdf2 = new Rfc2898DeriveBytes(
            password,
            salt,
            100000, // 100k iterations
            HashAlgorithmName.SHA256
        );

        var keyBytes = pbkdf2.GetBytes(32); // 256-bit key
        return Convert.ToBase64String(keyBytes);
    }

    public static byte[] GenerateSalt()
    {
        var salt = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(salt);
        return salt;
    }
}
```

### Changing Encryption Key

```sql
-- SQLCipher command to re-key database
PRAGMA rekey = 'new-encryption-key';
```

```csharp
public async Task ChangeEncryptionKeyAsync(string currentKey, string newKey)
{
    var connectionString = _configuration.GetConnectionString("DefaultConnection");

    using var connection = new SqliteConnection(connectionString + $";Password={currentKey}");
    await connection.OpenAsync();

    // Change encryption key
    using var command = connection.CreateCommand();
    command.CommandText = $"PRAGMA rekey = '{newKey}'";
    await command.ExecuteNonQueryAsync();

    _logger.LogInformation("Database encryption key changed successfully");
}
```

---

## Password Security

### BCrypt Implementation

```csharp
public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12; // BCrypt cost parameter

    public string HashPassword(string password)
    {
        // Validate password strength first
        ValidatePasswordStrength(password);

        // BCrypt automatically:
        // 1. Generates random salt
        // 2. Applies work factor iterations
        // 3. Returns: $2a$12${salt}{hash}
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Password verification failed");
            return false;
        }
    }

    private void ValidatePasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ValidationException("Password is required");

        if (password.Length < 8)
            throw new ValidationException("Password must be at least 8 characters");

        // Check complexity
        var hasUpper = password.Any(char.IsUpper);
        var hasLower = password.Any(char.IsLower);
        var hasDigit = password.Any(char.IsDigit);
        var hasSpecial = password.Any(c => !char.IsLetterOrDigit(c));

        var complexityScore = 
            (hasUpper ? 1 : 0) + 
            (hasLower ? 1 : 0) + 
            (hasDigit ? 1 : 0) + 
            (hasSpecial ? 1 : 0);

        if (complexityScore < 3)
            throw new ValidationException(
                "Password must contain at least 3 of: uppercase, lowercase, digit, special character");
    }
}
```

### Password Storage

```sql
-- Users table
CREATE TABLE Users (
    UserId TEXT PRIMARY KEY,
    Username TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,  -- BCrypt hash: $2a$12${salt}{hash}
    -- ...
);

-- Example hash:
-- $2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
-- ^^  ^^  ^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
-- │   │   └─ Salt (22 chars)     └─ Hash (31 chars)
-- │   └─ Work factor (12)
-- └─ Algorithm (2a = BCrypt)
```

### Password Policy Enforcement

```csharp
public class PasswordPolicyService
{
    private const int PasswordExpirationDays = 90;
    private const int PasswordHistoryCount = 3;

    public async Task<bool> CanReusePasswordAsync(string userId, string newPassword)
    {
        // Get password history
        var history = await _passwordHistoryRepository
            .GetLastPasswordsAsync(userId, PasswordHistoryCount);

        // Check if new password matches any recent password
        foreach (var historicalHash in history)
        {
            if (_passwordHasher.VerifyPassword(newPassword, historicalHash))
            {
                return false; // Cannot reuse
            }
        }

        return true; // Can use this password
    }

    public async Task UpdatePasswordAsync(string userId, string newPassword)
    {
        // Hash new password
        var newHash = _passwordHasher.HashPassword(newPassword);

        // Update user
        var user = await _userRepository.GetByIdAsync(userId);
        user.PasswordHash = newHash;
        user.LastPasswordChangeAt = DateTime.UtcNow;
        user.PasswordExpiresAt = DateTime.UtcNow.AddDays(PasswordExpirationDays);

        await _userRepository.UpdateAsync(user);

        // Save to password history
        await _passwordHistoryRepository.AddAsync(new PasswordHistory
        {
            UserId = userId,
            PasswordHash = newHash,
            ChangedAt = DateTime.UtcNow
        });

        // Clean old history (keep only last 3)
        await _passwordHistoryRepository.CleanupAsync(userId, PasswordHistoryCount);
    }
}
```

---

## Hash Chain Integrity

### Blockchain-Style Chain

Every posted journal entry includes:
1. **ValidationHash** - SHA-256 hash of entry data
2. **PreviousHash** - Hash of previous entry

This creates an immutable chain where tampering breaks the chain.

```
Entry #1                    Entry #2                    Entry #3
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│ Data: ...    │           │ Data: ...    │           │ Data: ...    │
│ PrevHash: "" │──────────►│ PrevHash: A1 │──────────►│ PrevHash: B2 │
│ Hash: A1     │           │ Hash: B2     │           │ Hash: C3     │
└──────────────┘           └──────────────┘           └──────────────┘
```

### Hash Calculation

```csharp
public class LedgerSecurityService : ILedgerSecurityService
{
    public string CalculateHash(JournalEntry entry, string previousHash)
    {
        // Create canonical representation
        var data = new StringBuilder();
        data.Append(entry.EntryNumber);
        data.Append('|');
        data.Append(entry.EntryDate.ToString("yyyy-MM-dd"));
        data.Append('|');
        data.Append(entry.JournalCode);
        data.Append('|');
        data.Append(entry.Reference ?? "");
        data.Append('|');
        data.Append(entry.TotalDebit.ToString("F2"));
        data.Append('|');
        data.Append(entry.TotalCredit.ToString("F2"));
        data.Append('|');

        // Include all lines
        foreach (var line in entry.Lines.OrderBy(l => l.LineNumber))
        {
            data.Append(line.AccountId);
            data.Append('|');
            data.Append(line.ThirdPartyId ?? "");
            data.Append('|');
            data.Append(line.Debit.ToString("F2"));
            data.Append('|');
            data.Append(line.Credit.ToString("F2"));
            data.Append('|');
        }

        // Include previous hash
        data.Append(previousHash);

        // Calculate SHA-256 hash
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(data.ToString()));

        return Convert.ToBase64String(hashBytes);
    }

    public async Task<string> GetLastHashAsync()
    {
        var lastEntry = await _repository.GetLastPostedEntryAsync();
        return lastEntry?.ValidationHash ?? string.Empty;
    }
}
```

### Integrity Verification

```csharp
public class IntegrityVerificationService
{
    public async Task<IntegrityCheckResult> VerifyChainIntegrityAsync()
    {
        var result = new IntegrityCheckResult { IsValid = true };

        // Get all posted entries in order
        var entries = await _repository.GetAllPostedEntriesAsync();

        var expectedPreviousHash = string.Empty;

        foreach (var entry in entries.OrderBy(e => e.EntryNumber))
        {
            // 1. Check previous hash matches
            if (entry.PreviousHash != expectedPreviousHash)
            {
                result.IsValid = false;
                result.Errors.Add($"Chain broken at entry #{entry.EntryNumber}");
                result.Errors.Add($"Expected PreviousHash: {expectedPreviousHash}");
                result.Errors.Add($"Actual PreviousHash: {entry.PreviousHash}");

                _logger.LogCritical(
                    "TAMPERING DETECTED: Hash chain broken at entry #{EntryNumber}",
                    entry.EntryNumber
                );
            }

            // 2. Recalculate hash
            var calculatedHash = _securityService.CalculateHash(entry, expectedPreviousHash);

            if (calculatedHash != entry.ValidationHash)
            {
                result.IsValid = false;
                result.Errors.Add($"Hash mismatch at entry #{entry.EntryNumber}");
                result.Errors.Add($"Expected Hash: {calculatedHash}");
                result.Errors.Add($"Stored Hash: {entry.ValidationHash}");

                _logger.LogCritical(
                    "TAMPERING DETECTED: Hash validation failed at entry #{EntryNumber}",
                    entry.EntryNumber
                );
            }

            // 3. Update for next iteration
            expectedPreviousHash = entry.ValidationHash;
        }

        if (!result.IsValid)
        {
            // Alert administrator
            await _notificationService.AlertAdminAsync(
                "CRITICAL: Database tampering detected!",
                result.Errors
            );

            // Enter read-only mode
            await _systemService.EnterAuditModeAsync();
        }

        return result;
    }

    public async Task<bool> VerifyStartupIntegrityAsync()
    {
        _logger.LogInformation("Starting database integrity check...");

        var result = await VerifyChainIntegrityAsync();

        if (result.IsValid)
        {
            _logger.LogInformation("Database integrity check PASSED");
        }
        else
        {
            _logger.LogCritical("Database integrity check FAILED");

            foreach (var error in result.Errors)
            {
                _logger.LogCritical("  - {Error}", error);
            }
        }

        return result.IsValid;
    }
}
```

### Startup Integrity Check

```csharp
public class App : Application
{
    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // CRITICAL: Verify integrity on startup
        var integrityService = _serviceProvider.GetService<IIntegrityVerificationService>();
        var isIntegrityValid = await integrityService.VerifyStartupIntegrityAsync();

        if (!isIntegrityValid)
        {
            var result = MessageBox.Show(
                "DATABASE INTEGRITY CHECK FAILED!\n\n" +
                "Possible tampering detected. The database may have been modified outside the application.\n\n" +
                "Options:\n" +
                "- YES: Continue in READ-ONLY mode (view data only)\n" +
                "- NO: Exit application and contact administrator\n\n" +
                "Do you want to continue in read-only mode?",
                "CRITICAL SECURITY ALERT",
                MessageBoxButton.YesNo,
                MessageBoxImage.Error
            );

            if (result == MessageBoxResult.Yes)
            {
                // Continue in read-only mode
                _systemService.SetReadOnlyMode(true);
            }
            else
            {
                Shutdown();
                return;
            }
        }

        // Continue normal startup...
    }
}
```

---

## Sensitive Data Protection

### Field-Level Encryption

For extra-sensitive data (e.g., bank account numbers), use field-level encryption.

```csharp
public interface IDataProtectionService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
}

public class DataProtectionService : IDataProtectionService
{
    private readonly IDataProtector _protector;

    public DataProtectionService(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("TOTALFISC.SensitiveData.v1");
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        return _protector.Protect(plainText);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return cipherText;

        try
        {
            return _protector.Unprotect(cipherText);
        }
        catch (CryptographicException ex)
        {
            _logger.LogWarning(ex, "Failed to decrypt data");
            return "[ENCRYPTED]";
        }
    }
}
```

### Usage in Entity

```csharp
public class ThirdParty
{
    public string ThirdPartyId { get; set; }
    public string Name { get; set; }
    public string NIF { get; set; }

    // Sensitive field (encrypted in database)
    private string _bankAccountNumber;

    [NotMapped]
    public string BankAccountNumber
    {
        get => _dataProtection.Decrypt(_bankAccountNumber);
        set => _bankAccountNumber = _dataProtection.Encrypt(value);
    }

    // Stored in database (encrypted)
    public string BankAccountNumberEncrypted
    {
        get => _bankAccountNumber;
        set => _bankAccountNumber = value;
    }
}
```

### EF Core Configuration

```csharp
public class ThirdPartyConfiguration : IEntityTypeConfiguration<ThirdParty>
{
    public void Configure(EntityTypeBuilder<ThirdParty> builder)
    {
        builder.Property(tp => tp.BankAccountNumberEncrypted)
            .HasColumnName("BankAccountNumber");

        builder.Ignore(tp => tp.BankAccountNumber);
    }
}
```

---

## Backup Encryption

### Encrypted Backup Creation

```csharp
public class BackupService : IBackupService
{
    public async Task<string> CreateEncryptedBackupAsync(string outputPath)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var backupFileName = $"totalfisc_backup_{timestamp}.bak";
        var backupFilePath = Path.Combine(outputPath, backupFileName);

        // 1. Copy database file
        var dbPath = GetDatabasePath();
        File.Copy(dbPath, backupFilePath);

        // 2. Encrypt backup file
        var encryptedFilePath = backupFilePath + ".enc";
        await EncryptFileAsync(backupFilePath, encryptedFilePath);

        // 3. Delete unencrypted backup
        File.Delete(backupFilePath);

        _logger.LogInformation("Encrypted backup created: {FilePath}", encryptedFilePath);

        return encryptedFilePath;
    }

    private async Task EncryptFileAsync(string sourceFile, string destinationFile)
    {
        // Generate random key and IV
        using var aes = Aes.Create();
        aes.KeySize = 256;
        aes.GenerateKey();
        aes.GenerateIV();

        // Derive key from backup password
        var backupPassword = GetBackupPassword();
        var salt = GenerateSalt();
        var key = DeriveKeyFromPassword(backupPassword, salt);

        aes.Key = key;

        // Encrypt file
        using var sourceStream = File.OpenRead(sourceFile);
        using var destinationStream = File.Create(destinationFile);

        // Write salt and IV to file (needed for decryption)
        await destinationStream.WriteAsync(salt, 0, salt.Length);
        await destinationStream.WriteAsync(aes.IV, 0, aes.IV.Length);

        // Write encrypted data
        using var cryptoStream = new CryptoStream(
            destinationStream,
            aes.CreateEncryptor(),
            CryptoStreamMode.Write
        );

        await sourceStream.CopyToAsync(cryptoStream);
    }

    public async Task RestoreEncryptedBackupAsync(string backupFilePath)
    {
        var tempDecryptedPath = Path.GetTempFileName();

        try
        {
            // 1. Decrypt backup
            await DecryptFileAsync(backupFilePath, tempDecryptedPath);

            // 2. Verify decrypted file is valid SQLite database
            if (!IsValidSqliteDatabase(tempDecryptedPath))
            {
                throw new InvalidOperationException("Decrypted file is not a valid database");
            }

            // 3. Close current database connections
            await CloseAllConnectionsAsync();

            // 4. Replace database file
            var dbPath = GetDatabasePath();
            File.Copy(tempDecryptedPath, dbPath, overwrite: true);

            _logger.LogInformation("Backup restored successfully");
        }
        finally
        {
            // Clean up temp file
            if (File.Exists(tempDecryptedPath))
            {
                File.Delete(tempDecryptedPath);
            }
        }
    }
}
```

---

## Key Management

### Key Storage Options

1. **Machine-Bound (Recommended for Desktop)**
   - Use Windows DPAPI
   - Tied to specific computer
   - Cannot be transferred

2. **User Password-Derived**
   - User provides master password
   - Derived using PBKDF2
   - User must remember password

3. **External Key File**
   - Store key in separate USB drive
   - Physical security
   - Requires USB at startup

### Windows DPAPI Implementation

```csharp
public class SecureKeyStorage
{
    private const string KeyFileName = "encryption.key";

    public void SaveKey(string key)
    {
        // Protect key with DPAPI (LocalMachine scope)
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var entropy = Encoding.UTF8.GetBytes("TOTALFISC");

        var protectedBytes = ProtectedData.Protect(
            keyBytes,
            entropy,
            DataProtectionScope.LocalMachine
        );

        // Save to file
        var keyPath = Path.Combine(GetSecureStoragePath(), KeyFileName);
        File.WriteAllBytes(keyPath, protectedBytes);

        // Set file permissions (read-only for administrators)
        var fileInfo = new FileInfo(keyPath);
        var fileSecurity = fileInfo.GetAccessControl();
        fileSecurity.SetAccessRuleProtection(true, false);

        // Only administrators can read
        fileSecurity.AddAccessRule(new FileSystemAccessRule(
            new SecurityIdentifier(WellKnownSidType.BuiltinAdministratorsSid, null),
            FileSystemRights.Read,
            AccessControlType.Allow
        ));

        fileInfo.SetAccessControl(fileSecurity);
    }

    public string LoadKey()
    {
        var keyPath = Path.Combine(GetSecureStoragePath(), KeyFileName);

        if (!File.Exists(keyPath))
            throw new FileNotFoundException("Encryption key not found");

        // Read protected data
        var protectedBytes = File.ReadAllBytes(keyPath);
        var entropy = Encoding.UTF8.GetBytes("TOTALFISC");

        // Unprotect with DPAPI
        var keyBytes = ProtectedData.Unprotect(
            protectedBytes,
            entropy,
            DataProtectionScope.LocalMachine
        );

        return Encoding.UTF8.GetString(keyBytes);
    }

    private string GetSecureStoragePath()
    {
        var path = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "TOTALFISC",
            "Keys"
        );

        Directory.CreateDirectory(path);
        return path;
    }
}
```

---

## Compliance

### GDPR / Data Privacy

| Requirement | Implementation |
|-------------|----------------|
| **Right to Erasure** | Soft delete with anonymization |
| **Data Portability** | Export to JSON/CSV |
| **Breach Notification** | Audit log alerts |
| **Encryption at Rest** | SQLCipher AES-256 |
| **Access Control** | RBAC with audit trail |

### Decree 09-110 Compliance

| Article | Requirement | Implementation |
|---------|-------------|----------------|
| **Article 14** | Intangibility | Hash chain + DB triggers |
| **Article 15** | Durability | Encrypted backups |
| **Article 16** | Traceability | Complete audit log |

---

## Conclusion

TOTALFISC's security framework provides:

✅ **Database Encryption** - AES-256 via SQLCipher  
✅ **Password Security** - BCrypt with cost factor 12  
✅ **Hash Chain Integrity** - SHA-256 blockchain-style verification  
✅ **Sensitive Data Protection** - Field-level encryption  
✅ **Encrypted Backups** - AES-256 file encryption  
✅ **Secure Key Management** - Windows DPAPI protection  
✅ **Compliance** - GDPR and Decree 09-110 requirements met  

This multi-layered security approach ensures data confidentiality, integrity, and availability while meeting regulatory requirements for accounting software in Algeria.

---

**Related Documents:**
- [DECREE_09_110.md](DECREE_09_110.md) - Legal compliance requirements
- [AUTHENTICATION.md](AUTHENTICATION.md) - User authentication system
- [AUDIT_TRAIL.md](AUDIT_TRAIL.md) - Complete audit logging
