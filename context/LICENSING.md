# LICENSING.md
# TOTALFISC - Licensing System

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**License Model:** Node-Locked (Hardware-Bound)  

---

## Table of Contents

1. [Licensing Overview](#licensing-overview)
2. [License Types](#license-types)
3. [Hardware ID Generation](#hardware-id-generation)
4. [License File Format](#license-file-format)
5. [License Generation](#license-generation)
6. [License Validation](#license-validation)
7. [Trial Licenses](#trial-licenses)
8. [License Renewal](#license-renewal)
9. [Anti-Piracy Measures](#anti-piracy-measures)

---

## Licensing Overview

### License Strategy

TOTALFISC uses **node-locked licensing** where each license is bound to a specific computer's hardware configuration.

```
┌─────────────────────────────────────────────────────────────┐
│                     LICENSING FLOW                           │
│                                                              │
│  1. Customer Purchases License                              │
│     │                                                        │
│     ├─► Provide company information                         │
│     └─► Choose license type (Trial / Full)                  │
│                                                              │
│  2. Generate Hardware ID                                    │
│     │                                                        │
│     ├─► Read: Motherboard Serial, CPU ID, MAC Address       │
│     ├─► Hash with SHA-256                                   │
│     └─► Generate unique Hardware ID                         │
│                                                              │
│  3. Vendor Generates License File                           │
│     │                                                        │
│     ├─► Create license data (HW ID, expiry, features)       │
│     ├─► Sign with RSA-2048 private key                      │
│     └─► Generate license.key file                           │
│                                                              │
│  4. Customer Installs License                               │
│     │                                                        │
│     ├─► Copy license.key to installation folder             │
│     └─► Restart application                                 │
│                                                              │
│  5. Application Validates License                           │
│     │                                                        │
│     ├─► Read license.key file                              │
│     ├─► Verify RSA signature                               │
│     ├─► Check Hardware ID matches                          │
│     ├─► Check expiration date                              │
│     └─► Activate or show error                             │
└─────────────────────────────────────────────────────────────┘
```

### Why Node-Locked?

| Reason | Benefit |
|--------|---------|
| **No Internet Required** | Works offline (critical for Algeria) |
| **Simple Deployment** | Just copy license file |
| **Hardware-Bound** | Cannot be shared across machines |
| **No Server Dependency** | No license server needed |
| **Audit-Friendly** | Clear audit trail of activations |

---

## License Types

### 1. Trial License

**Duration:** 30 days  
**Features:** Full functionality  
**Restrictions:**
- ✅ Can create unlimited entries
- ✅ Access to all features
- ✅ Export reports
- ⚠️ Watermark on printed reports: "TRIAL VERSION"
- ⏰ Expires after 30 days

**Use Case:** Evaluation, proof of concept

---

### 2. Full License

**Duration:** Perpetual or 1-year subscription  
**Features:** Complete access  
**Support:** Email support included  
**Updates:** Free updates within major version (v2.x)

**Tiers:**

| Tier | Max Users | Max Entries/Year | Price (DZD) |
|------|-----------|------------------|-------------|
| **Starter** | 1 | 5,000 | 50,000 |
| **Professional** | 3 | 20,000 | 120,000 |
| **Enterprise** | Unlimited | Unlimited | 300,000 |

---

### 3. Enterprise License

**Duration:** Annual subscription  
**Features:**
- Unlimited users
- Unlimited entries
- Priority support (phone + email)
- On-site training
- Custom reports
- API access (future)

**Includes:**
- Dedicated account manager
- Quarterly review meetings
- Migration from PCCOMPTA

---

## Hardware ID Generation

### Hardware Components Used

The Hardware ID is generated from:

1. **Motherboard Serial Number**
2. **CPU Serial Number**
3. **MAC Address (Primary NIC)**
4. **Windows Product ID** (optional)

### WMI Queries (Windows Management Instrumentation)

```csharp
public class HardwareIdGenerator : IHardwareIdGenerator
{
    public string GenerateHardwareId()
    {
        var components = new List<string>
        {
            GetMotherboardSerial(),
            GetCpuId(),
            GetMacAddress(),
            GetWindowsProductId()
        };

        // Concatenate all components
        var combinedString = string.Join("|", components.Where(c => !string.IsNullOrEmpty(c)));

        // Hash with SHA-256
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(combinedString));

        // Convert to Base64 (shorter than hex)
        return Convert.ToBase64String(hashBytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "")
            .Substring(0, 32); // 32 characters
    }

    private string GetMotherboardSerial()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT SerialNumber FROM Win32_BaseBoard");

            foreach (var obj in searcher.Get())
            {
                return obj["SerialNumber"]?.ToString() ?? "";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get motherboard serial");
        }

        return "";
    }

    private string GetCpuId()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT ProcessorId FROM Win32_Processor");

            foreach (var obj in searcher.Get())
            {
                return obj["ProcessorId"]?.ToString() ?? "";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get CPU ID");
        }

        return "";
    }

    private string GetMacAddress()
    {
        try
        {
            var interfaces = NetworkInterface.GetAllNetworkInterfaces()
                .Where(ni => ni.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                .OrderBy(ni => ni.Name)
                .ToList();

            if (interfaces.Any())
            {
                return interfaces.First().GetPhysicalAddress().ToString();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get MAC address");
        }

        return "";
    }

    private string GetWindowsProductId()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "SELECT SerialNumber FROM Win32_OperatingSystem");

            foreach (var obj in searcher.Get())
            {
                return obj["SerialNumber"]?.ToString() ?? "";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Windows Product ID");
        }

        return "";
    }
}
```

**Example Hardware ID:**
```
A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

---

## License File Format

### File Structure

**File Name:** `license.key`

**Format:** JSON with RSA-2048 signature

```json
{
  "LicenseId": "LIC-2026-001234",
  "LicenseType": "Full",
  "Tier": "Professional",
  "CompanyName": "Entreprise ABC SARL",
  "CompanyNIF": "099123456789012",
  "HardwareId": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
  "IssuedDate": "2026-02-05T00:00:00Z",
  "ExpirationDate": "2027-02-05T23:59:59Z",
  "MaxUsers": 3,
  "MaxEntriesPerYear": 20000,
  "Features": [
    "journals.create",
    "journals.post",
    "reports.export",
    "fiscal.close"
  ],
  "Signature": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
}
```

### License Properties

| Property | Type | Description |
|----------|------|-------------|
| **LicenseId** | string | Unique license identifier |
| **LicenseType** | enum | Trial, Full, Enterprise |
| **Tier** | enum | Starter, Professional, Enterprise |
| **CompanyName** | string | Licensed company name |
| **CompanyNIF** | string | Algerian tax ID |
| **HardwareId** | string | Hardware fingerprint |
| **IssuedDate** | DateTime | License issue date |
| **ExpirationDate** | DateTime | License expiry (null = perpetual) |
| **MaxUsers** | int | Maximum concurrent users |
| **MaxEntriesPerYear** | int | Maximum entries per year |
| **Features** | string[] | Enabled feature flags |
| **Signature** | string | RSA-2048 digital signature |

---

## License Generation

### Vendor License Generator Tool

```csharp
public class LicenseGenerator
{
    private readonly RSA _privateKey;

    public LicenseGenerator(string privateKeyXml)
    {
        _privateKey = RSA.Create();
        _privateKey.FromXmlString(privateKeyXml);
    }

    public License GenerateLicense(LicenseRequest request)
    {
        var license = new License
        {
            LicenseId = $"LIC-{DateTime.UtcNow.Year}-{GenerateSequentialNumber()}",
            LicenseType = request.LicenseType,
            Tier = request.Tier,
            CompanyName = request.CompanyName,
            CompanyNIF = request.CompanyNIF,
            HardwareId = request.HardwareId,
            IssuedDate = DateTime.UtcNow,
            ExpirationDate = CalculateExpiration(request),
            MaxUsers = GetMaxUsers(request.Tier),
            MaxEntriesPerYear = GetMaxEntries(request.Tier),
            Features = GetFeatures(request.Tier)
        };

        // Generate signature
        license.Signature = SignLicense(license);

        return license;
    }

    private string SignLicense(License license)
    {
        // Create canonical string (without signature field)
        var data = JsonSerializer.Serialize(new
        {
            license.LicenseId,
            license.LicenseType,
            license.Tier,
            license.CompanyName,
            license.CompanyNIF,
            license.HardwareId,
            license.IssuedDate,
            license.ExpirationDate,
            license.MaxUsers,
            license.MaxEntriesPerYear,
            license.Features
        });

        // Sign with RSA private key
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var signatureBytes = _privateKey.SignData(
            dataBytes,
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1
        );

        return Convert.ToBase64String(signatureBytes);
    }

    private DateTime? CalculateExpiration(LicenseRequest request)
    {
        return request.LicenseType switch
        {
            LicenseType.Trial => DateTime.UtcNow.AddDays(30),
            LicenseType.Full when request.Tier == LicenseTier.Enterprise => 
                DateTime.UtcNow.AddYears(1), // Annual subscription
            LicenseType.Full => null, // Perpetual
            _ => throw new ArgumentException("Invalid license type")
        };
    }

    public void SaveLicenseFile(License license, string outputPath)
    {
        var json = JsonSerializer.Serialize(license, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        File.WriteAllText(outputPath, json);
    }
}
```

### Vendor Tool Usage

```csharp
// Vendor-side tool (separate application)
var generator = new LicenseGenerator(vendorPrivateKey);

var request = new LicenseRequest
{
    LicenseType = LicenseType.Full,
    Tier = LicenseTier.Professional,
    CompanyName = "Entreprise ABC SARL",
    CompanyNIF = "099123456789012",
    HardwareId = "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6" // Provided by customer
};

var license = generator.GenerateLicense(request);
generator.SaveLicenseFile(license, "license.key");

// Send license.key file to customer via email
```

---

## License Validation

### Validation on Startup

```csharp
public class LicenseValidator : ILicenseValidator
{
    private readonly RSA _publicKey;
    private readonly IHardwareIdGenerator _hardwareIdGenerator;
    private readonly ILogger<LicenseValidator> _logger;

    public LicenseValidator(
        string publicKeyXml,
        IHardwareIdGenerator hardwareIdGenerator,
        ILogger<LicenseValidator> logger)
    {
        _publicKey = RSA.Create();
        _publicKey.FromXmlString(publicKeyXml);
        _hardwareIdGenerator = hardwareIdGenerator;
        _logger = logger;
    }

    public LicenseValidationResult ValidateLicense(string licenseFilePath)
    {
        try
        {
            // 1. Check file exists
            if (!File.Exists(licenseFilePath))
            {
                return LicenseValidationResult.FileNotFound();
            }

            // 2. Read and parse license file
            var json = File.ReadAllText(licenseFilePath);
            var license = JsonSerializer.Deserialize<License>(json);

            if (license == null)
            {
                return LicenseValidationResult.InvalidFormat();
            }

            // 3. Verify signature
            if (!VerifySignature(license))
            {
                _logger.LogWarning("License signature verification failed");
                return LicenseValidationResult.InvalidSignature();
            }

            // 4. Check hardware ID
            var currentHardwareId = _hardwareIdGenerator.GenerateHardwareId();
            if (license.HardwareId != currentHardwareId)
            {
                _logger.LogWarning(
                    "Hardware ID mismatch. Expected: {Expected}, Actual: {Actual}",
                    license.HardwareId,
                    currentHardwareId
                );
                return LicenseValidationResult.HardwareMismatch();
            }

            // 5. Check expiration
            if (license.ExpirationDate.HasValue && 
                license.ExpirationDate.Value < DateTime.UtcNow)
            {
                _logger.LogWarning("License expired on {ExpirationDate}", 
                    license.ExpirationDate.Value);
                return LicenseValidationResult.Expired(license.ExpirationDate.Value);
            }

            // 6. All checks passed
            _logger.LogInformation("License validated successfully: {LicenseId}", 
                license.LicenseId);

            return LicenseValidationResult.Success(license);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "License validation error");
            return LicenseValidationResult.ValidationError(ex.Message);
        }
    }

    private bool VerifySignature(License license)
    {
        try
        {
            // Recreate canonical data (same as signing)
            var data = JsonSerializer.Serialize(new
            {
                license.LicenseId,
                license.LicenseType,
                license.Tier,
                license.CompanyName,
                license.CompanyNIF,
                license.HardwareId,
                license.IssuedDate,
                license.ExpirationDate,
                license.MaxUsers,
                license.MaxEntriesPerYear,
                license.Features
            });

            var dataBytes = Encoding.UTF8.GetBytes(data);
            var signatureBytes = Convert.FromBase64String(license.Signature);

            // Verify with RSA public key
            return _publicKey.VerifyData(
                dataBytes,
                signatureBytes,
                HashAlgorithmName.SHA256,
                RSASignaturePadding.Pkcs1
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Signature verification failed");
            return false;
        }
    }
}
```

### Application Startup Flow

```csharp
public class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var licenseValidator = _serviceProvider.GetService<ILicenseValidator>();
        var licenseFilePath = Path.Combine(
            AppDomain.CurrentDomain.BaseDirectory,
            "license.key"
        );

        var result = licenseValidator.ValidateLicense(licenseFilePath);

        if (!result.IsValid)
        {
            ShowLicenseError(result);

            // Allow trial mode or exit
            if (!ShowTrialDialog())
            {
                Shutdown();
                return;
            }
        }

        // Store valid license in memory
        Current.Properties["License"] = result.License;

        // Continue startup
        var mainWindow = _serviceProvider.GetService<MainWindow>();
        mainWindow.Show();
    }

    private void ShowLicenseError(LicenseValidationResult result)
    {
        var message = result.ErrorCode switch
        {
            LicenseErrorCode.FileNotFound => 
                "License file not found. Please contact your vendor.",
            LicenseErrorCode.InvalidSignature => 
                "Invalid license signature. File may be corrupted or tampered.",
            LicenseErrorCode.HardwareMismatch => 
                "This license is not valid for this computer.\n" +
                $"Hardware ID: {_hardwareIdGenerator.GenerateHardwareId()}\n\n" +
                "Please contact your vendor to transfer the license.",
            LicenseErrorCode.Expired => 
                $"License expired on {result.ExpirationDate:yyyy-MM-dd}.\n" +
                "Please renew your license.",
            _ => 
                "License validation failed."
        };

        MessageBox.Show(
            message,
            "License Error",
            MessageBoxButton.OK,
            MessageBoxImage.Error
        );
    }
}
```

---

## Trial Licenses

### Trial License Generation

**Automatic Trial Mode:**
- If no license file found, offer 30-day trial
- Generate trial license bound to hardware
- Store trial start date in registry
- Cannot reset trial (hardware-bound)

```csharp
public class TrialLicenseManager
{
    private const string RegistryPath = @"SOFTWARE\TOTALFISC";
    private const string TrialStartDateKey = "TrialStartDate";
    private const string HardwareIdKey = "HardwareId";

    public License GenerateTrialLicense()
    {
        var hardwareId = _hardwareIdGenerator.GenerateHardwareId();

        // Check if trial already used
        var existingHardwareId = GetRegistryValue(HardwareIdKey);
        if (existingHardwareId == hardwareId)
        {
            throw new InvalidOperationException(
                "Trial period already used on this computer");
        }

        var trialStartDate = DateTime.UtcNow;
        var trialEndDate = trialStartDate.AddDays(30);

        // Store in registry (prevents reset)
        SetRegistryValue(TrialStartDateKey, trialStartDate.ToString("o"));
        SetRegistryValue(HardwareIdKey, hardwareId);

        return new License
        {
            LicenseId = $"TRIAL-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
            LicenseType = LicenseType.Trial,
            Tier = LicenseTier.Professional, // Full features
            CompanyName = "TRIAL",
            HardwareId = hardwareId,
            IssuedDate = trialStartDate,
            ExpirationDate = trialEndDate,
            MaxUsers = 1,
            MaxEntriesPerYear = int.MaxValue,
            Features = new[] { "*" } // All features
        };
    }

    private string GetRegistryValue(string keyName)
    {
        using var key = Registry.CurrentUser.OpenSubKey(RegistryPath);
        return key?.GetValue(keyName)?.ToString();
    }

    private void SetRegistryValue(string keyName, string value)
    {
        using var key = Registry.CurrentUser.CreateSubKey(RegistryPath);
        key?.SetValue(keyName, value);
    }
}
```

---

## License Renewal

### Renewal Process

```
1. License approaches expiration (30 days warning)
   └─► Show renewal reminder

2. Customer contacts vendor
   ├─► Provide License ID
   └─► Choose renewal term (1 year, 3 years, perpetual)

3. Vendor generates new license
   ├─► Same Hardware ID
   ├─► Extended expiration date
   └─► Same or upgraded tier

4. Customer installs new license
   └─► Replace license.key file
```

### Auto-Renewal Check

```csharp
public class LicenseExpirationChecker
{
    public void CheckExpirationWarning(License license)
    {
        if (!license.ExpirationDate.HasValue) return; // Perpetual

        var daysRemaining = (license.ExpirationDate.Value - DateTime.UtcNow).Days;

        if (daysRemaining <= 30 && daysRemaining > 0)
        {
            ShowRenewalReminder(daysRemaining);
        }
        else if (daysRemaining <= 7 && daysRemaining > 0)
        {
            ShowUrgentRenewalReminder(daysRemaining);
        }
    }

    private void ShowRenewalReminder(int daysRemaining)
    {
        MessageBox.Show(
            $"Your license will expire in {daysRemaining} days.\n\n" +
            "Please contact your vendor to renew your license.\n" +
            "License ID: " + GetCurrentLicense().LicenseId,
            "License Renewal Reminder",
            MessageBoxButton.OK,
            MessageBoxImage.Information
        );
    }
}
```

---

## Anti-Piracy Measures

### Protection Mechanisms

1. **RSA-2048 Signature**
   - Cannot forge license without private key
   - Public key embedded in application (obfuscated)

2. **Hardware Binding**
   - License works only on specific computer
   - Cannot share license file

3. **Encrypted Storage**
   - License file can be encrypted (future)
   - Registry values encrypted

4. **Code Obfuscation**
   - Use Obfuscar to obfuscate licensing code
   - Prevent reverse engineering

5. **Online Activation (Future)**
   - Validate license with vendor server
   - Detect multiple activations

6. **Audit Trail**
   - Log all license validation attempts
   - Alert on suspicious activity

### Obfuscation Example

```xml
<!-- Obfuscar configuration -->
<Obfuscator>
  <Var name="InPath" value="bin\Release" />
  <Var name="OutPath" value="bin\Obfuscated" />

  <Module file="$(InPath)\TOTALFISC.exe">
    <SkipNamespace name="System" />
    <SkipNamespace name="Microsoft" />
  </Module>

  <!-- Obfuscate licensing classes -->
  <RenameFields>true</RenameFields>
  <RenameProperties>true</RenameProperties>
  <KeepPublicApi>false</KeepPublicApi>
</Obfuscator>
```

---

## Conclusion

The TOTALFISC licensing system provides:

✅ **Node-Locked Protection** - Hardware-bound licenses prevent sharing  
✅ **RSA-2048 Signatures** - Cryptographically secure, cannot be forged  
✅ **Offline Operation** - No internet required for validation  
✅ **Flexible Tiers** - Trial, Starter, Professional, Enterprise  
✅ **Anti-Tampering** - Multiple validation layers  
✅ **Audit Trail** - Complete logging of license events  

This licensing framework protects intellectual property while providing excellent customer experience with simple file-based activation.

---

**Related Documents:**
- [AUTHENTICATION.md](AUTHENTICATION.md) - User authentication
- [DATA_SECURITY.md](DATA_SECURITY.md) - Encryption and security
- [DEPLOYMENT.md](DEPLOYMENT.md) - Installation and distribution
