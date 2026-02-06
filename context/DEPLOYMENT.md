# DEPLOYMENT.md
# TOTALFISC - Deployment Guide

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Target Platform:** Windows 10/11, Windows Server 2019/2022  

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Build Process](#build-process)
4. [Installation Package](#installation-package)
5. [Silent Installation](#silent-installation)
6. [Updates & Patching](#updates--patching)
7. [Uninstallation](#uninstallation)
8. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

### Deployment Options

| Option | Use Case | Complexity |
|--------|----------|------------|
| **MSI Installer** | Standard installation | Low |
| **MSIX Package** | Windows Store distribution | Medium |
| **ClickOnce** | Auto-update deployment | Medium |
| **Portable** | No installation required | Low |
| **Group Policy** | Enterprise deployment | High |

**Recommended:** MSI Installer with WiX Toolset

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10 (1909+) | Windows 11 |
| **CPU** | Dual-core 2.0 GHz | Quad-core 3.0 GHz+ |
| **RAM** | 4 GB | 8 GB+ |
| **Disk** | 500 MB free | 2 GB+ |
| **Display** | 1366x768 | 1920x1080+ |

### Runtime Dependencies

```
✅ .NET 9 Desktop Runtime (x64)
✅ WebView2 Runtime
✅ Visual C++ Redistributable 2022
```

**All dependencies bundled in installer** (bootstrapper handles installation)

---

## Build Process

### Step 1: Publish Backend

```bash
# Navigate to project directory
cd src/TotalFisc.Desktop

# Publish for Windows x64
dotnet publish -c Release -r win-x64 --self-contained false -p:PublishSingleFile=false

# Output: bin/Release/net9.0-windows/win-x64/publish/
```

### Step 2: Build Frontend

```bash
# Navigate to frontend
cd src/TotalFisc.UI

# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/
```

### Step 3: Combine Output

```powershell
# Create deployment folder
$deployDir = "deploy/TOTALFISC"
New-Item -ItemType Directory -Force -Path $deployDir

# Copy backend binaries
Copy-Item -Path "src/TotalFisc.Desktop/bin/Release/net9.0-windows/win-x64/publish/*" `
          -Destination $deployDir -Recurse

# Copy frontend build
New-Item -ItemType Directory -Force -Path "$deployDir/Resources/WebApp"
Copy-Item -Path "src/TotalFisc.UI/dist/*" `
          -Destination "$deployDir/Resources/WebApp" -Recurse

# Copy database schema
Copy-Item -Path "database/schema/totalfisc_schema.sql" `
          -Destination "$deployDir/Resources/Schema.sql"
```

### Step 4: Sign Executables

```powershell
# Sign with code signing certificate
$certPath = "certificates/TOTALFISC.pfx"
$certPassword = Read-Host -AsSecureString "Enter certificate password"

# Sign main executable
signtool sign /f $certPath /p $certPassword /t http://timestamp.digicert.com `
    /fd SHA256 /v "$deployDir/TOTALFISC.exe"

# Sign all DLLs
Get-ChildItem -Path $deployDir -Filter "*.dll" -Recurse | ForEach-Object {
    signtool sign /f $certPath /p $certPassword /t http://timestamp.digicert.com `
        /fd SHA256 /v $_.FullName
}
```

---

## Installation Package

### WiX Toolset Configuration

```xml
<!-- Product.wxs -->
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*"
           Name="TOTALFISC"
           Language="1033"
           Version="2.0.0.0"
           Manufacturer="Your Company"
           UpgradeCode="12345678-1234-1234-1234-123456789012">

    <Package InstallerVersion="200"
             Compressed="yes"
             InstallScope="perMachine"
             Description="TOTALFISC Accounting Software" />

    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />

    <MediaTemplate EmbedCab="yes" />

    <!-- Feature: Main Application -->
    <Feature Id="ProductFeature" Title="TOTALFISC" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
      <ComponentGroupRef Id="Shortcuts" />
    </Feature>

    <!-- Directory Structure -->
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFiles64Folder">
        <Directory Id="INSTALLFOLDER" Name="TOTALFISC">
          <Directory Id="DatabaseFolder" Name="Database" />
          <Directory Id="ResourcesFolder" Name="Resources">
            <Directory Id="WebAppFolder" Name="WebApp" />
          </Directory>
        </Directory>
      </Directory>

      <Directory Id="ProgramMenuFolder">
        <Directory Id="ApplicationProgramsFolder" Name="TOTALFISC" />
      </Directory>

      <Directory Id="DesktopFolder" Name="Desktop" />
    </Directory>

    <!-- Components -->
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="MainExecutable" Guid="*">
        <File Id="TOTALFISCExe"
              Source="$(var.PublishDir)/TOTALFISC.exe"
              KeyPath="yes" />
      </Component>

      <!-- Include all DLLs, config files, etc. -->
      <Component Id="AllFiles" Guid="*">
        <CreateFolder />
      </Component>
    </ComponentGroup>

    <!-- Shortcuts -->
    <ComponentGroup Id="Shortcuts" Directory="ApplicationProgramsFolder">
      <Component Id="StartMenuShortcut" Guid="*">
        <Shortcut Id="ApplicationStartMenuShortcut"
                  Name="TOTALFISC"
                  Description="Accounting Software"
                  Target="[INSTALLFOLDER]TOTALFISC.exe"
                  WorkingDirectory="INSTALLFOLDER" />
        <RemoveFolder Id="ApplicationProgramsFolder" On="uninstall" />
        <RegistryValue Root="HKCU"
                       Key="Software\TOTALFISC"
                       Name="installed"
                       Type="integer"
                       Value="1"
                       KeyPath="yes" />
      </Component>

      <Component Id="DesktopShortcut" Guid="*">
        <Shortcut Id="ApplicationDesktopShortcut"
                  Name="TOTALFISC"
                  Description="Accounting Software"
                  Target="[INSTALLFOLDER]TOTALFISC.exe"
                  WorkingDirectory="INSTALLFOLDER"
                  Directory="DesktopFolder" />
        <RegistryValue Root="HKCU"
                       Key="Software\TOTALFISC"
                       Name="desktop"
                       Type="integer"
                       Value="1"
                       KeyPath="yes" />
      </Component>
    </ComponentGroup>

    <!-- Custom Actions -->
    <CustomAction Id="CreateDatabase"
                  Directory="DatabaseFolder"
                  ExeCommand="[INSTALLFOLDER]TOTALFISC.exe --init-database"
                  Execute="deferred"
                  Impersonate="no"
                  Return="check" />

    <InstallExecuteSequence>
      <Custom Action="CreateDatabase" After="InstallFiles">
        NOT Installed
      </Custom>
    </InstallExecuteSequence>

    <!-- UI -->
    <UIRef Id="WixUI_Minimal" />
    <UIRef Id="WixUI_ErrorProgressText" />

    <WixVariable Id="WixUILicenseRtf" Value="Resources\License.rtf" />
    <WixVariable Id="WixUIBannerBmp" Value="Resources\Banner.bmp" />
    <WixVariable Id="WixUIDialogBmp" Value="Resources\Dialog.bmp" />

  </Product>
</Wix>
```

### Build MSI

```bash
# Build WiX project
dotnet build Installer/TOTALFISC.Installer.wixproj -c Release

# Output: Installer/bin/Release/TOTALFISC.msi
```

### Bootstrapper (Bundle Dependencies)

```xml
<!-- Bundle.wxs -->
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi"
     xmlns:bal="http://schemas.microsoft.com/wix/BalExtension"
     xmlns:util="http://schemas.microsoft.com/wix/UtilExtension">

  <Bundle Name="TOTALFISC Setup"
          Version="2.0.0.0"
          Manufacturer="Your Company"
          UpgradeCode="87654321-4321-4321-4321-210987654321">

    <BootstrapperApplicationRef Id="WixStandardBootstrapperApplication.RtfLicense">
      <bal:WixStandardBootstrapperApplication
          LicenseFile="Resources\License.rtf"
          LogoFile="Resources\Logo.png"
          ThemeFile="Resources\Theme.xml" />
    </BootstrapperApplicationRef>

    <Chain>
      <!-- .NET 9 Desktop Runtime -->
      <PackageGroupRef Id="NetDesktopRuntime90" />

      <!-- WebView2 Runtime -->
      <ExePackage Id="WebView2"
                  SourceFile="Prerequisites\MicrosoftEdgeWebview2Setup.exe"
                  DetectCondition="WebView2Installed"
                  InstallCommand="/silent /install"
                  Permanent="yes" />

      <!-- Visual C++ Redistributable -->
      <ExePackage Id="VCRedist"
                  SourceFile="Prerequisites\VC_redist.x64.exe"
                  DetectCondition="VCRedist2022Installed"
                  InstallCommand="/quiet /norestart"
                  Permanent="yes" />

      <!-- Main Application -->
      <MsiPackage Id="MainPackage"
                  SourceFile="TOTALFISC.msi"
                  Vital="yes"
                  DisplayInternalUI="yes" />
    </Chain>

    <!-- Detection Conditions -->
    <util:RegistrySearch Id="WebView2Search"
                         Root="HKLM"
                         Key="SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
                         Variable="WebView2Installed" />

    <util:RegistrySearch Id="VCRedist2022Search"
                         Root="HKLM"
                         Key="SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\X64"
                         Value="Version"
                         Variable="VCRedist2022Installed" />

  </Bundle>
</Wix>
```

---

## Silent Installation

### Command-Line Parameters

```bash
# Silent install to default location
TOTALFISCSetup.exe /quiet /norestart

# Silent install to custom location
TOTALFISCSetup.exe /quiet /norestart INSTALLFOLDER="D:\TOTALFISC"

# Install with logging
TOTALFISCSetup.exe /quiet /norestart /log "C:\Temp\install.log"

# Install without desktop shortcut
TOTALFISCSetup.exe /quiet /norestart ADDDESKTOPSHORTCUT=0
```

### MSI Properties

| Property | Default | Description |
|----------|---------|-------------|
| `INSTALLFOLDER` | `C:\Program Files\TOTALFISC` | Installation directory |
| `ADDDESKTOPSHORTCUT` | `1` | Create desktop shortcut (1=yes, 0=no) |
| `CREATEDB` | `1` | Initialize database (1=yes, 0=no) |
| `LAUNCHAPP` | `0` | Launch after install (1=yes, 0=no) |

---

## Updates & Patching

### Update Mechanism

```
┌─────────────────────────────────────────────────────────────┐
│                    UPDATE PROCESS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Check for Updates (on startup)                          │
│     │                                                        │
│     ├─► Query: https://updates.totalfisc.dz/version  │
│     └─► Compare local version vs. latest                    │
│                                                              │
│  2. Download Update Package                                 │
│     │                                                        │
│     ├─► Download: TOTALFISC_2.1.0_Update.exe         │
│     ├─► Verify signature                                   │
│     └─► Verify hash                                        │
│                                                              │
│  3. Apply Update                                            │
│     │                                                        │
│     ├─► Close application                                  │
│     ├─► Backup current version                             │
│     ├─► Run update installer                               │
│     └─► Restart application                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Update Service

```csharp
public interface IUpdateService
{
    Task<UpdateInfo> CheckForUpdatesAsync();
    Task<bool> DownloadUpdateAsync(UpdateInfo update, IProgress<int> progress);
    Task<bool> ApplyUpdateAsync(string updatePath);
}

public class UpdateService : IUpdateService
{
    private const string UpdateCheckUrl = "https://updates.totalfisc.dz/api/version";

    public async Task<UpdateInfo> CheckForUpdatesAsync()
    {
        try
        {
            using var client = new HttpClient();
            var response = await client.GetAsync(UpdateCheckUrl);
            response.EnsureSuccessStatusCode();

            var updateInfo = await response.Content.ReadFromJsonAsync<UpdateInfo>();

            var currentVersion = Assembly.GetExecutingAssembly().GetName().Version;
            var latestVersion = Version.Parse(updateInfo.Version);

            updateInfo.IsUpdateAvailable = latestVersion > currentVersion;

            return updateInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check for updates");
            return new UpdateInfo { IsUpdateAvailable = false };
        }
    }

    public async Task<bool> DownloadUpdateAsync(UpdateInfo update, IProgress<int> progress)
    {
        try
        {
            var updateFileName = $"TOTALFISC_{update.Version}_Update.exe";
            var downloadPath = Path.Combine(Path.GetTempPath(), updateFileName);

            using var client = new HttpClient();
            using var response = await client.GetAsync(update.DownloadUrl, HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();

            var totalBytes = response.Content.Headers.ContentLength ?? 0;
            var downloadedBytes = 0L;

            using var contentStream = await response.Content.ReadAsStreamAsync();
            using var fileStream = File.Create(downloadPath);

            var buffer = new byte[8192];
            int bytesRead;

            while ((bytesRead = await contentStream.ReadAsync(buffer)) > 0)
            {
                await fileStream.WriteAsync(buffer.AsMemory(0, bytesRead));
                downloadedBytes += bytesRead;

                if (totalBytes > 0)
                {
                    var percentage = (int)((downloadedBytes * 100) / totalBytes);
                    progress?.Report(percentage);
                }
            }

            // Verify signature
            if (!VerifySignature(downloadPath))
            {
                File.Delete(downloadPath);
                throw new InvalidOperationException("Update signature verification failed");
            }

            // Verify hash
            if (!VerifyHash(downloadPath, update.Hash))
            {
                File.Delete(downloadPath);
                throw new InvalidOperationException("Update hash verification failed");
            }

            _updateDownloadPath = downloadPath;
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download update");
            return false;
        }
    }

    public async Task<bool> ApplyUpdateAsync(string updatePath)
    {
        try
        {
            // Create backup
            var backupPath = CreateBackup();

            // Launch update installer
            var startInfo = new ProcessStartInfo
            {
                FileName = updatePath,
                Arguments = "/quiet /norestart",
                UseShellExecute = true,
                Verb = "runas" // Require admin
            };

            Process.Start(startInfo);

            // Exit current application
            Application.Current.Shutdown();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to apply update");
            return false;
        }
    }
}
```

### Update UI

```csharp
public partial class UpdateDialog : Window
{
    private readonly IUpdateService _updateService;
    private UpdateInfo _updateInfo;

    public async Task CheckForUpdates()
    {
        StatusText.Text = "Checking for updates...";

        _updateInfo = await _updateService.CheckForUpdatesAsync();

        if (_updateInfo.IsUpdateAvailable)
        {
            StatusText.Text = $"Version {_updateInfo.Version} is available!";
            ReleaseNotesText.Text = _updateInfo.ReleaseNotes;
            DownloadButton.Visibility = Visibility.Visible;
        }
        else
        {
            StatusText.Text = "You're running the latest version.";
        }
    }

    private async void DownloadButton_Click(object sender, RoutedEventArgs e)
    {
        DownloadButton.IsEnabled = false;
        ProgressBar.Visibility = Visibility.Visible;

        var progress = new Progress<int>(percentage =>
        {
            ProgressBar.Value = percentage;
            StatusText.Text = $"Downloading... {percentage}%";
        });

        var success = await _updateService.DownloadUpdateAsync(_updateInfo, progress);

        if (success)
        {
            var result = MessageBox.Show(
                "Update downloaded successfully. Install now?\n\n" +
                "The application will close and restart after installation.",
                "Install Update",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question
            );

            if (result == MessageBoxResult.Yes)
            {
                await _updateService.ApplyUpdateAsync(_updateService.GetDownloadPath());
            }
        }
        else
        {
            MessageBox.Show(
                "Failed to download update. Please try again later.",
                "Update Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );
        }
    }
}
```

---

## Uninstallation

### Clean Uninstall

The MSI installer provides standard Windows uninstallation:

**Option 1: Control Panel**
```
Settings → Apps → TOTALFISC → Uninstall
```

**Option 2: Command Line**
```bash
# Uninstall silently
msiexec /x {ProductCode} /quiet /norestart

# Uninstall with logging
msiexec /x {ProductCode} /quiet /norestart /log "C:\Temp\uninstall.log"
```

### Cleanup Script

```powershell
# cleanup.ps1 - Remove all traces of TOTALFISC

# Stop any running instances
Get-Process -Name "TOTALFISC" -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove registry keys
Remove-Item -Path "HKCU:\Software\TOTALFISC" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKLM:\Software\TOTALFISC" -Recurse -Force -ErrorAction SilentlyContinue

# Remove application data
$appDataPath = Join-Path $env:LOCALAPPDATA "TOTALFISC"
if (Test-Path $appDataPath) {
    Remove-Item -Path $appDataPath -Recurse -Force
}

# Remove common app data
$commonAppDataPath = Join-Path $env:ProgramData "TOTALFISC"
if (Test-Path $commonAppDataPath) {
    Remove-Item -Path $commonAppDataPath -Recurse -Force
}

Write-Host "TOTALFISC removed successfully"
```

---

## Troubleshooting

### Common Issues

#### 1. WebView2 Not Found

**Error:** "WebView2 Runtime not installed"

**Solution:**
```bash
# Download and install WebView2 Runtime
# https://developer.microsoft.com/microsoft-edge/webview2/

# Or install via Chocolatey
choco install webview2-runtime
```

#### 2. .NET Runtime Missing

**Error:** "You must install .NET Desktop Runtime 9.0"

**Solution:**
```bash
# Download from Microsoft
# https://dotnet.microsoft.com/download/dotnet/9.0

# Or install via winget
winget install Microsoft.DotNet.DesktopRuntime.9
```

#### 3. Database Locked

**Error:** "Database file is locked"

**Solution:**
```bash
# Close all instances of TOTALFISC
taskkill /F /IM TOTALFISC.exe

# Delete lock files
del "%PROGRAMDATA%\TOTALFISC\Database\*.db-wal"
del "%PROGRAMDATA%\TOTALFISC\Database\*.db-shm"
```

#### 4. Permission Denied

**Error:** "Access to path denied"

**Solution:**
```bash
# Run as Administrator
# Right-click TOTALFISC.exe → Run as administrator

# Or grant permissions to database folder
icacls "%PROGRAMDATA%\TOTALFISC" /grant Users:(OI)(CI)F /T
```

#### 5. License Validation Failed

**Error:** "License signature verification failed"

**Solution:**
```bash
# Check system date/time is correct
# Verify license.key file is not corrupted
# Re-download license file from vendor

# Check hardware ID
TOTALFISC.exe --show-hardware-id
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage > 80%
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] License files included
- [ ] Certificate acquired (code signing)

### Build

- [ ] Backend published (Release, x64)
- [ ] Frontend built (production)
- [ ] All dependencies bundled
- [ ] Executables signed
- [ ] Version numbers updated
- [ ] MSI package built
- [ ] Bootstrapper created

### Testing

- [ ] Fresh install tested
- [ ] Upgrade from previous version tested
- [ ] Silent install tested
- [ ] Uninstall tested
- [ ] License validation tested
- [ ] Database initialization tested

### Distribution

- [ ] Installer uploaded to distribution server
- [ ] Download link tested
- [ ] Update manifest updated
- [ ] Release notes published
- [ ] User documentation updated
- [ ] Support team notified

---

## Conclusion

The TOTALFISC deployment process provides:

✅ **Professional Installer** - WiX-based MSI with bootstrapper  
✅ **Automatic Updates** - Built-in update mechanism  
✅ **Silent Deployment** - Enterprise-ready command-line install  
✅ **Signed Binaries** - Code-signed for security  
✅ **Clean Uninstall** - Complete removal capability  
✅ **Troubleshooting** - Comprehensive error resolution  

This deployment framework ensures smooth installation, updates, and maintenance while maintaining security and user experience.

---

**Related Documents:**
- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) - Development environment
- [LICENSING.md](LICENSING.md) - License activation
- [DATA_SECURITY.md](DATA_SECURITY.md) - Security considerations
