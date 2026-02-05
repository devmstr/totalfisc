# DEVELOPMENT_SETUP.md
# TOTALFISC - Development Environment Setup

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Estimated Setup Time:** 45-60 minutes  

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Required Tools](#required-tools)
3. [Backend Setup (.NET)](#backend-setup-net)
4. [Frontend Setup (React)](#frontend-setup-react)
5. [Database Setup (SQLite)](#database-setup-sqlite)
6. [IDE Configuration](#ide-configuration)
7. [Running the Application](#running-the-application)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | Dual-core 2.0 GHz | Quad-core 3.0 GHz+ |
| **RAM** | 8 GB | 16 GB+ |
| **Disk Space** | 10 GB free | 20 GB+ SSD |
| **Display** | 1366x768 | 1920x1080+ |

### Operating System

- **Primary:** Windows 10/11 (64-bit)
- **Alternative:** Windows Server 2019/2022
- **Not Supported:** macOS, Linux (due to WPF dependency)

### Internet Connection

Required for:
- Initial tool downloads
- NuGet package restore
- NPM package installation
- Documentation access

**Once setup complete:** Offline development is fully supported

---

## Required Tools

### 1. .NET 9 SDK

**Version:** 9.0.0 or later

**Download:** https://dotnet.microsoft.com/download/dotnet/9.0

**Verification:**
```bash
dotnet --version
# Expected: 9.0.0 or higher
```

**Installation:**
1. Download .NET 9 SDK installer (x64)
2. Run installer with default options
3. Restart terminal/IDE after installation

---

### 2. Visual Studio 2022

**Edition:** Community (free), Professional, or Enterprise

**Version:** 17.8.0 or later

**Workloads Required:**
- ✅ .NET desktop development
- ✅ ASP.NET and web development
- ✅ Data storage and processing (for SQLite tools)

**Individual Components:**
- ✅ .NET 9.0 Runtime
- ✅ WPF
- ✅ Entity Framework Core tools
- ✅ SQLite/SQL Server Compact Toolbox (optional, for database browsing)

**Download:** https://visualstudio.microsoft.com/downloads/

**Installation:**
```
1. Run vs_community.exe
2. Select workloads:
   - .NET desktop development
   - ASP.NET and web development
3. Click Install (15-20 GB download)
4. Restart computer after installation
```

**Extensions (Optional but Recommended):**
- **ReSharper** - Code analysis and refactoring
- **CodeMaid** - Code cleanup
- **Productivity Power Tools** - Enhancements
- **SQLite/SQL Server Compact Toolbox** - Database viewer

---

### 3. Node.js & NPM

**Version:** Node.js 20.x LTS or later

**Download:** https://nodejs.org/

**Verification:**
```bash
node --version
# Expected: v20.x.x or higher

npm --version
# Expected: 10.x.x or higher
```

**Installation:**
1. Download Node.js LTS installer (64-bit)
2. Run installer with default options
3. Check "Automatically install necessary tools" (Python, Visual Studio Build Tools)

**Alternative Package Manager (Optional):**
```bash
# Install pnpm (faster alternative to npm)
npm install -g pnpm

# Verify
pnpm --version
```

---

### 4. Git

**Version:** 2.40.0 or later

**Download:** https://git-scm.com/downloads

**Configuration:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf true  # Important for Windows
git config --global init.defaultBranch main
```

**GUI Tools (Optional):**
- **GitHub Desktop** - https://desktop.github.com/
- **GitKraken** - https://www.gitkraken.com/
- **SourceTree** - https://www.sourcetreeapp.com/

---

### 5. Database Tools

#### DB Browser for SQLite (Recommended)

**Purpose:** Browse and edit SQLite databases visually

**Download:** https://sqlitebrowser.org/

**Features:**
- View tables and data
- Run SQL queries
- Edit schema
- Export data

#### Alternative: SQLite CLI

**Download:** https://www.sqlite.org/download.html

**Installation:**
```bash
# Download sqlite-tools-win64-x64-*.zip
# Extract to C:\Tools\sqlite3
# Add to PATH environment variable
```

**Verification:**
```bash
sqlite3 --version
# Expected: 3.x.x
```

---

### 6. VS Code (Optional - for React Development)

**Purpose:** Lightweight editor optimized for TypeScript/React

**Download:** https://code.visualstudio.com/

**Extensions:**
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript Vue Plugin (Volar)** - TypeScript support
- **Tailwind CSS IntelliSense** - Tailwind autocompletion
- **GitLens** - Enhanced Git integration
- **REST Client** - Test API endpoints

---

## Backend Setup (.NET)

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/TOTALFISC.git
cd TOTALFISC
```

### 2. Restore NuGet Packages

```bash
# Restore all packages (reads Directory.Packages.props)
dotnet restore TOTALFISC.sln
```

**Expected Output:**
```
Determining projects to restore...
Restored C:\Projects\TOTALFISC\src\TOTALFISC.Domain\TOTALFISC.Domain.csproj
Restored C:\Projects\TOTALFISC\src\TOTALFISC.Application\TOTALFISC.Application.csproj
...
Restore succeeded.
```

### 3. Build Solution

```bash
# Build all projects
dotnet build TOTALFISC.sln --configuration Debug
```

**Expected Output:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

### 4. Run Database Migrations

```bash
# Navigate to Persistence project
cd src/TOTALFISC.Persistence

# Apply migrations (creates database)
dotnet ef database update --startup-project ../TOTALFISC.Api/TOTALFISC.Api.csproj

# Verify database created
ls database/
# Expected: totalfisc.db
```

**Seed Initial Data:**
```bash
# Run seeder (creates default admin user, chart of accounts, etc.)
dotnet run --project ../TOTALFISC.Api/TOTALFISC.Api.csproj -- seed-data
```

---

## Frontend Setup (React)

### 1. Navigate to Frontend Project

```bash
cd src/TOTALFISC.Web
```

### 2. Install NPM Packages

```bash
# Install all dependencies from package.json
npm install

# Or using pnpm (faster)
pnpm install
```

**Expected Duration:** 2-5 minutes (depends on internet speed)

**Expected Output:**
```
added 1234 packages in 3m
```

### 3. Generate TypeScript API Client

```bash
# Generate TypeScript client from OpenAPI spec
npm run generate-api
```

**This will:**
1. Start the API server temporarily
2. Download OpenAPI JSON spec
3. Generate TypeScript client using NSwag
4. Save to `src/api/generated/api-client.ts`

### 4. Start Development Server

```bash
# Start Vite dev server (hot reload enabled)
npm run dev
```

**Expected Output:**
```
  VITE v6.0.3  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Browser Auto-Opens:** http://localhost:3000

---

## Database Setup (SQLite)

### 1. Create Database Schema

**Option A: Using Pre-Built SQL Script**
```bash
# Navigate to database folder
cd database/schema

# Create database from SQL script
sqlite3 ../totalfisc.db < totalfisc_schema.sql
```

**Option B: Using EF Core Migrations**
```bash
# Navigate to API project
cd src/TOTALFISC.Api

# Apply migrations
dotnet ef database update
```

### 2. Seed Initial Data

**Seed Chart of Accounts (SCF):**
```bash
dotnet run --project src/TOTALFISC.Api/TOTALFISC.Api.csproj -- seed-accounts
```

**Seed Tax Configuration:**
```bash
dotnet run --project src/TOTALFISC.Api/TOTALFISC.Api.csproj -- seed-tax
```

**Seed Demo Data (Optional):**
```bash
dotnet run --project src/TOTALFISC.Api/TOTALFISC.Api.csproj -- seed-demo
```

### 3. Verify Database

**Open in DB Browser:**
```bash
# Open database in DB Browser for SQLite
start "" "C:\Program Files\DB Browser for SQLite\DB Browser for SQLite.exe" database/totalfisc.db
```

**Or using SQLite CLI:**
```bash
sqlite3 database/totalfisc.db

sqlite> .tables
# Expected: Accounts, JournalEntries, JournalLines, etc.

sqlite> SELECT COUNT(*) FROM Accounts;
# Expected: 200+ accounts (SCF Chart)

sqlite> .exit
```

---

## IDE Configuration

### Visual Studio 2022

#### 1. Open Solution

```
File → Open → Project/Solution
Navigate to: TOTALFISC.sln
```

#### 2. Set Startup Projects

```
Right-click Solution → Properties
→ Common Properties → Startup Project
→ Multiple startup projects
  ✅ TOTALFISC.Host (Action: Start)
  ✅ TOTALFISC.Api (Action: Start)
```

#### 3. Configure Code Style

**Install EditorConfig Support:**
```
Tools → Options → Text Editor → C# → Code Style
→ Apply .editorconfig settings
```

**Format on Save:**
```
Tools → Options → Text Editor → C# → Advanced
→ ✅ Format document on save
```

#### 4. Enable Nullable Reference Types

Already configured in `Directory.Build.props`:
```xml
<Nullable>enable</Nullable>
```

#### 5. Configure Debugging

**Break on Exceptions:**
```
Debug → Windows → Exception Settings
→ ✅ Common Language Runtime Exceptions
```

**Disable "Just My Code"** (to debug into libraries):
```
Tools → Options → Debugging → General
→ ❌ Enable Just My Code
```

---

### VS Code (for React)

#### 1. Open Frontend Folder

```bash
cd src/TOTALFISC.Web
code .
```

#### 2. Install Recommended Extensions

**When prompted, click "Install All"**

Or manually install:
```
ext install dbaeumer.vscode-eslint
ext install esbenp.prettier-vscode
ext install bradlc.vscode-tailwindcss
ext install eamodio.gitlens
```

#### 3. Configure Settings

**Create `.vscode/settings.json`:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\(([^)]*)\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\(([^)]*)\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### 4. Configure Debugging

**Create `.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

---

## Running the Application

### Development Mode

**Option 1: Run from Visual Studio**

1. Open `TOTALFISC.sln` in Visual Studio
2. Press **F5** or click **Start Debugging**
3. WPF Host window opens
4. WebView2 loads React UI from http://localhost:3000
5. API runs on http://localhost:5000

**Option 2: Run Separately**

**Terminal 1 - API Server:**
```bash
cd src/TOTALFISC.Api
dotnet run
```

**Terminal 2 - React Dev Server:**
```bash
cd src/TOTALFISC.Web
npm run dev
```

**Terminal 3 - WPF Host:**
```bash
cd src/TOTALFISC.Host
dotnet run
```

### Production Mode

**Build for Release:**
```bash
# Build entire solution in Release mode
dotnet build TOTALFISC.sln --configuration Release

# Build React frontend
cd src/TOTALFISC.Web
npm run build

# Copy build output to WPF Host
xcopy /E /I /Y dist ..\TOTALFISC.Host\Resources\WebApp
```

**Run Production Build:**
```bash
cd src/TOTALFISC.Host/bin/Release/net9.0-windows
.\TOTALFISC.exe
```

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Restore packages (if package files changed)
dotnet restore
cd src/TOTALFISC.Web && npm install && cd ../..

# 3. Run database migrations (if new migrations exist)
cd src/TOTALFISC.Persistence
dotnet ef database update --startup-project ../TOTALFISC.Api

# 4. Start development
# Open Visual Studio → Press F5
# OR run separate terminals (API + React + Host)

# 5. Make changes, test, commit
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### Creating Database Migrations

```bash
cd src/TOTALFISC.Persistence

# Create new migration
dotnet ef migrations add AddNewColumn --startup-project ../TOTALFISC.Api

# Apply migration to database
dotnet ef database update --startup-project ../TOTALFISC.Api

# Remove last migration (if mistake)
dotnet ef migrations remove --startup-project ../TOTALFISC.Api
```

### Running Tests

```bash
# Run all tests
dotnet test TOTALFISC.sln

# Run specific test project
dotnet test tests/TOTALFISC.Domain.Tests/

# Run with coverage
dotnet test TOTALFISC.sln --collect:"XPlat Code Coverage"
```

### Code Formatting

**Backend (.NET):**
```bash
# Format all C# files
dotnet format TOTALFISC.sln
```

**Frontend (React):**
```bash
cd src/TOTALFISC.Web

# Format all TypeScript/React files
npm run format

# Check formatting
npm run lint
```

---

## Troubleshooting

### Issue: "WebView2 Runtime not found"

**Solution:**
```bash
# Download WebView2 Runtime installer
# https://developer.microsoft.com/en-us/microsoft-edge/webview2/

# Or install via Chocolatey
choco install webview2-runtime
```

---

### Issue: "Could not load file or assembly 'Microsoft.EntityFrameworkCore'"

**Solution:**
```bash
# Clean solution
dotnet clean TOTALFISC.sln

# Restore packages
dotnet restore TOTALFISC.sln

# Rebuild
dotnet build TOTALFISC.sln
```

---

### Issue: "npm install fails with EACCES error"

**Solution:**
```bash
# Fix npm permissions (Windows)
npm config set prefix "C:\Users\{YourUsername}\AppData\Roaming\npm"

# Or run as Administrator
```

---

### Issue: "SQLite database locked"

**Solution:**
```bash
# Close all applications using the database
# (DB Browser for SQLite, running application instances)

# Delete lock file
del database\totalfisc.db-wal
del database\totalfisc.db-shm

# Restart application
```

---

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process by PID
taskkill /PID {PID} /F

# Or change port in appsettings.json
```

---

### Issue: "CORS error in browser console"

**Solution:**
```csharp
// In TOTALFISC.Api/Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("DevPolicy");
```

---

### Issue: "React hot reload not working"

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

---

### Issue: "EF Core migrations fail"

**Solution:**
```bash
# Ensure startup project is set correctly
cd src/TOTALFISC.Persistence

dotnet ef database update --startup-project ../TOTALFISC.Api/TOTALFISC.Api.csproj

# If still fails, check connection string in appsettings.json
```

---

## Next Steps

Once setup is complete:

1. ✅ Read [ARCHITECTURE.md](ARCHITECTURE.md) for system overview
2. ✅ Review [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) for data model
3. ✅ Study [SCF_COMPLIANCE.md](SCF_COMPLIANCE.md) for accounting rules
4. ✅ Explore [CODING_STANDARDS.md](CODING_STANDARDS.md) for code style
5. ✅ Start with feature development using [GIT_WORKFLOW.md](GIT_WORKFLOW.md)

---

## Getting Help

**Documentation:** `/docs` folder  
**Issues:** GitHub Issues  
**Team Chat:** Slack/Microsoft Teams  
**Email:** dev@totalfisc.dz  

---

**Happy Coding! 🚀**
