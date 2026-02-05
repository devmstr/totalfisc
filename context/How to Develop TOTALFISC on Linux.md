# How to Develop TOTALFISC on Linux

Here's your **cross-platform development strategy**:

## Solution: Separate Frontend & Backend Development

```
┌─────────────────────────────────────────────────────────────┐
│              DEVELOPMENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LINUX Development Machine                                   │
│  ┌────────────────────────────────────────────────┐         │
│  │  1. React Frontend (Vite Dev Server)           │         │
│  │     http://localhost:5173                      │         │
│  │     ├─ Hot reload                              │         │
│  │     ├─ All React components                    │         │
│  │     └─ Calls API on localhost:5015             │         │
│  └────────────────────────────────────────────────┘         │
│                    │                                         │
│                    ▼ HTTP Requests                           │
│  ┌────────────────────────────────────────────────┐         │
│  │  2. ASP.NET Core API                           │         │
│  │     http://localhost:5015                      │         │
│  │     ├─ .NET 9 (cross-platform)                 │         │
│  │     ├─ All business logic                      │         │
│  │     └─ SQLite database                         │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  Test in: Chrome/Firefox on Linux ✅                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WINDOWS Testing Machine (CI/CD or local)                    │
│  ┌────────────────────────────────────────────────┐         │
│  │  3. WPF Desktop App                            │         │
│  │     ├─ WebView2 (Windows-only)                 │         │
│  │     ├─ Embedded Kestrel (runs API)             │         │
│  │     └─ Loads React build                       │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  Test in: Full desktop app on Windows ✅                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step: Development on Linux

### 1. Setup Your Linux Dev Environment

```bash
# Install .NET 9 SDK
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 9.0
export PATH="$HOME/.dotnet:$PATH"

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install SQLite
sudo apt-get install sqlite3 libsqlite3-dev

# Clone your repo
git clone https://github.com/your-org/totalfisc.git
cd totalfisc
```

### 2. Backend Development (ASP.NET Core API)

```bash
# Navigate to API project
cd src/TOTALFISC.Api

# Restore dependencies
dotnet restore

# Run the API
dotnet run

# API will be available at: http://localhost:5015
# OpenAPI / Swagger UI: http://localhost:5015/swagger
```

**Development workflow on Linux:**

```bash
# Watch mode (auto-reload on code changes)
dotnet watch run

# Run tests
# cd ../../tests/TOTALFISC.Tests
# dotnet test

# Database migrations
cd ../../src/TOTALFISC.Api
dotnet ef database update
```

### 3. Frontend Development (React)

```bash
# Navigate to frontend project
cd src/TOTALFISC.Web

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Frontend will be available at: http://localhost:5173
# With hot reload! 🔥
```

**Configure API URL in `.env.development`:**

```bash
# src/TOTALFISC.Web/.env.development
VITE_API_BASE_URL=http://localhost:5015
```

### 4. Test in Browser (Linux)

Open Chrome/Firefox on Linux:

```
http://localhost:5173
```

You'll see the full React UI, calling the .NET API running locally. **Everything works exactly the same** as it will in the Windows desktop app!

---

## Project Structure for Cross-Platform Dev

```
totalfisc/
├── src/
│   ├── TOTALFISC.Api/           # ASP.NET Core (cross-platform ✅)
│   │   ├── Program.cs
│   │   ├── Controllers/
│   │   ├── Services/
│   │   └── appsettings.json
│   │
│   ├── TOTALFISC.Domain/        # Pure C# (cross-platform ✅)
│   │   ├── Aggregates/
│   │   ├── Entities/
│   │   └── ValueObjects/
│   │
│   ├── TOTALFISC.Infrastructure/ # EF Core + SQLite (cross-platform ✅)
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Migrations/
│   │
│   ├── TOTALFISC.Web/           # React + Vite (cross-platform ✅)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── TOTALFISC.Host/          # WPF + WebView2 (Windows-only build, cross-platform restore ✅)
│   │   ├── MainWindow.xaml
│   │   ├── App.xaml.cs
│   │   └── TOTALFISC.Host.csproj
│   │
│   └── TOTALFISC.Shared/        # Common utilities (cross-platform ✅)
│       ├── Constants/
│       ├── Extensions/
│       └── Models/
│
├── tests/
│   └── TOTALFISC.Tests/         # xUnit (cross-platform ✅)
│
├── docker/
│   └── docker-compose.yml         # For testing full stack
│
└── .vscode/
    ├── launch.json                # VS Code debugging
    └── tasks.json                 # VS Code tasks
```

---

## VS Code Configuration for Linux

**`.vscode/launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "API: .NET Core Launch",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build-api",
      "program": "${workspaceFolder}/src/TOTALFISC.Api/bin/Debug/net10.0/TOTALFISC.Api.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/TOTALFISC.Api",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    {
      "name": "UI: Chrome Debug",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src/TOTALFISC.Web/src"
    }
  ],
  "compounds": [
    {
      "name": "Full Stack",
      "configurations": ["API: .NET Core Launch", "UI: Chrome Debug"],
      "stopAll": true
    }
  ]
}
```

**`.vscode/tasks.json`:**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-api",
      "command": "dotnet",
      "type": "process",
      "args": [
        "build",
        "${workspaceFolder}/src/TOTALFISC.Api/TOTALFISC.Api.csproj"
      ],
      "problemMatcher": "$msCompile"
    },
    {
      "label": "run-api",
      "command": "dotnet",
      "type": "process",
      "args": [
        "run",
        "--project",
        "${workspaceFolder}/src/TOTALFISC.Api/TOTALFISC.Api.csproj"
      ],
      "isBackground": true
    },
    {
      "label": "run-ui",
      "command": "npm",
      "type": "shell",
      "args": ["run", "dev"],
      "options": {
        "cwd": "${workspaceFolder}/src/TOTALFISC.Web"
      },
      "isBackground": true
    }
  ]
}
```

---

## Quick Start Script

**`dev.sh` (Linux):**

```bash
#!/bin/bash

echo "🚀 Starting TOTALFISC Development Environment"

# Start API in background
echo "📡 Starting API..."
cd src/TOTALFISC.Api
dotnet run &
API_PID=$!

# Wait for API to be ready
sleep 5

# Start UI
echo "🎨 Starting UI..."
cd ../TOTALFISC.Web
npm run dev &
UI_PID=$!

echo "✅ Development environment ready!"
echo "API:  http://localhost:5015"
echo "UI:   http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "kill $API_PID $UI_PID" EXIT
wait
```

Make executable and run:

```bash
chmod +x dev.sh
./dev.sh
```

---

## Summary

**✅ You CAN develop 95% of TOTALFISC on Linux:**

- Backend API (ASP.NET Core)
- Frontend UI (React)
- Database (SQLite)
- Business logic (Domain)
- Tests (xUnit)

**⚠️ You NEED Windows for:**

- WPF Desktop shell (5% of codebase)
- Final integration testing
- MSI installer building

**Best Practice:**

- **Develop on Linux** (faster, better tooling)
- **Test on Windows** weekly via VM or CI/CD
- **Ship from Windows** for production builds
