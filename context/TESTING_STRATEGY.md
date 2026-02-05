# TESTING_STRATEGY.md
# TOTALFISC - Testing Strategy

**Version:** 2.0  
**Last Updated:** February 5, 2026  
**Test Coverage Goal:** 80%+  

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Pyramid](#test-pyramid)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Test Data Management](#test-data-management)
7. [Continuous Integration](#continuous-integration)
8. [Code Coverage](#code-coverage)

---

## Testing Philosophy

### Core Principles

1. **Test Early, Test Often** - Write tests as you develop
2. **Test Behavior, Not Implementation** - Focus on what, not how
3. **Arrange-Act-Assert (AAA)** - Clear test structure
4. **Fast Feedback** - Tests should run quickly
5. **Isolated Tests** - No dependencies between tests
6. **Meaningful Names** - Test name explains what's being tested

### Testing Goals

| Goal | Target | Current |
|------|--------|---------|
| **Unit Test Coverage** | 80%+ | 75% |
| **Critical Path Coverage** | 100% | 95% |
| **Integration Test Coverage** | 60%+ | 55% |
| **Build Time** | <5 minutes | 3.5 min |
| **Test Execution Time** | <30 seconds | 18 sec |

---

## Test Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │  ← Few (5-10)
                    │   (Playwright)  │     Slow, Expensive
                    └─────────────────┘
                ┌───────────────────────┐
                │  Integration Tests    │  ← Some (50-100)
                │  (WebApplicationFactory) │  Medium Speed
                └───────────────────────┘
        ┌──────────────────────────────────┐
        │        Unit Tests                │  ← Many (500+)
        │   (xUnit + Moq + FluentAssertions) │  Fast, Cheap
        └──────────────────────────────────┘
```

### Distribution

- **70% Unit Tests** - Test individual components in isolation
- **20% Integration Tests** - Test component interactions
- **10% E2E Tests** - Test complete user workflows

---

## Unit Testing

### Framework: xUnit + Moq + FluentAssertions

```xml
<PackageReference Include="xunit" Version="2.6.6" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
<PackageReference Include="Moq" Version="4.20.70" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
```

### Test Project Structure

```
tests/
├─ TOTALFISC.Domain.Tests/
│  ├─ Entities/
│  │  ├─ JournalEntryTests.cs
│  │  ├─ AccountTests.cs
│  │  └─ ThirdPartyTests.cs
│  ├─ ValueObjects/
│  │  ├─ MoneyTests.cs
│  │  └─ AccountNumberTests.cs
│  └─ Services/
│     └─ FiscalYearClosingServiceTests.cs
├─ TOTALFISC.Application.Tests/
│  ├─ Commands/
│  │  ├─ CreateJournalEntryCommandHandlerTests.cs
│  │  ├─ PostJournalEntryCommandHandlerTests.cs
│  │  └─ VoidJournalEntryCommandHandlerTests.cs
│  ├─ Queries/
│  │  ├─ GetJournalEntryByIdQueryHandlerTests.cs
│  │  └─ GetTrialBalanceQueryHandlerTests.cs
│  └─ Validators/
│     └─ CreateJournalEntryCommandValidatorTests.cs
└─ TOTALFISC.Infrastructure.Tests/
   ├─ Repositories/
   │  └─ JournalEntryRepositoryTests.cs
   └─ Security/
      ├─ PasswordHasherTests.cs
      └─ LicenseValidatorTests.cs
```

### Example: Domain Entity Tests

```csharp
public class JournalEntryTests
{
    [Fact]
    public void Post_ValidEntry_SetsStatusToPosted()
    {
        // Arrange
        var entry = CreateValidJournalEntry();
        var hash = "test-hash";
        var previousHash = "previous-hash";
        var userId = "user-123";

        // Act
        var result = entry.Post(hash, previousHash, userId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        entry.Status.Should().Be(EntryStatus.Posted);
        entry.PostedAt.Should().NotBeNull();
        entry.PostedBy.Should().Be(userId);
        entry.ValidationHash.Should().Be(hash);
    }

    [Fact]
    public void Post_UnbalancedEntry_ReturnsFailure()
    {
        // Arrange
        var entry = new JournalEntry
        {
            EntryId = Guid.NewGuid().ToString(),
            EntryDate = DateTime.UtcNow
        };

        entry.AddLine(new JournalLine
        {
            AccountId = "acc-411",
            Debit = 1000,
            Credit = 0
        });

        entry.AddLine(new JournalLine
        {
            AccountId = "acc-700",
            Debit = 0,
            Credit = 500 // Not balanced!
        });

        // Act
        var result = entry.Post("hash", "prev", "user");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("not balanced");
        entry.Status.Should().Be(EntryStatus.Draft);
    }

    [Fact]
    public void Post_AlreadyPosted_ReturnsFailure()
    {
        // Arrange
        var entry = CreateValidJournalEntry();
        entry.Post("hash1", "prev1", "user1");

        // Act
        var result = entry.Post("hash2", "prev2", "user2");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("already posted");
    }

    [Fact]
    public void AddLine_AuxiliaryAccountWithoutThirdParty_ThrowsException()
    {
        // Arrange
        var entry = CreateValidJournalEntry();
        var line = new JournalLine
        {
            AccountId = "acc-411", // Requires auxiliary
            ThirdPartyId = null,   // Missing!
            Debit = 1000,
            Credit = 0
        };

        // Act
        Action act = () => entry.AddLine(line);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*auxiliary*");
    }

    private JournalEntry CreateValidJournalEntry()
    {
        var entry = new JournalEntry
        {
            EntryId = Guid.NewGuid().ToString(),
            EntryNumber = 123,
            EntryDate = DateTime.UtcNow,
            JournalCode = "VTE",
            Description = "Test entry",
            Status = EntryStatus.Draft
        };

        entry.AddLine(new JournalLine
        {
            AccountId = "acc-411",
            ThirdPartyId = "tp-001",
            Label = "Sale",
            Debit = 11900,
            Credit = 0
        });

        entry.AddLine(new JournalLine
        {
            AccountId = "acc-700",
            Label = "Revenue",
            Debit = 0,
            Credit = 10000
        });

        entry.AddLine(new JournalLine
        {
            AccountId = "acc-4457",
            Label = "VAT",
            Debit = 0,
            Credit = 1900
        });

        return entry;
    }
}
```

### Example: Command Handler Tests

```csharp
public class CreateJournalEntryCommandHandlerTests
{
    private readonly Mock<IJournalEntryRepository> _repositoryMock;
    private readonly Mock<IFiscalYearRepository> _fiscalYearRepositoryMock;
    private readonly Mock<IAccountRepository> _accountRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserMock;
    private readonly Mock<IDateTimeService> _dateTimeMock;
    private readonly CreateJournalEntryCommandHandler _handler;

    public CreateJournalEntryCommandHandlerTests()
    {
        _repositoryMock = new Mock<IJournalEntryRepository>();
        _fiscalYearRepositoryMock = new Mock<IFiscalYearRepository>();
        _accountRepositoryMock = new Mock<IAccountRepository>();
        _currentUserMock = new Mock<ICurrentUserService>();
        _dateTimeMock = new Mock<IDateTimeService>();

        _currentUserMock.Setup(x => x.UserId).Returns("user-123");
        _dateTimeMock.Setup(x => x.UtcNow).Returns(new DateTime(2026, 2, 5));

        _handler = new CreateJournalEntryCommandHandler(
            _repositoryMock.Object,
            _accountRepositoryMock.Object,
            _fiscalYearRepositoryMock.Object,
            _currentUserMock.Object,
            _dateTimeMock.Object
        );
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesEntry()
    {
        // Arrange
        var command = CreateValidCommand();

        _fiscalYearRepositoryMock
            .Setup(r => r.GetByIdAsync("fy-2026"))
            .ReturnsAsync(new FiscalYear { Status = FiscalYearStatus.Open });

        _accountRepositoryMock
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(new List<Account>
            {
                new() { AccountId = "acc-411" },
                new() { AccountId = "acc-700" },
                new() { AccountId = "acc-4457" }
            });

        _repositoryMock
            .Setup(r => r.GetNextEntryNumberAsync("fy-2026"))
            .ReturnsAsync(123);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNullOrEmpty();

        _repositoryMock.Verify(
            r => r.AddAsync(It.Is<JournalEntry>(e => 
                e.EntryNumber == 123 &&
                e.Lines.Count == 3 &&
                e.CreatedBy == "user-123"
            )),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_ClosedFiscalYear_ReturnsFailure()
    {
        // Arrange
        var command = CreateValidCommand();

        _fiscalYearRepositoryMock
            .Setup(r => r.GetByIdAsync("fy-2026"))
            .ReturnsAsync(new FiscalYear { Status = FiscalYearStatus.Closed });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("closed fiscal year");

        _repositoryMock.Verify(
            r => r.AddAsync(It.IsAny<JournalEntry>()),
            Times.Never
        );
    }

    [Theory]
    [InlineData(11900, 11900)] // Balanced
    [InlineData(10000, 10000)] // Balanced
    [InlineData(5000, 5000)]   // Balanced
    public async Task Handle_BalancedEntry_Succeeds(decimal debit, decimal credit)
    {
        // Arrange
        var command = new CreateJournalEntryCommand
        {
            EntryDate = new DateTime(2026, 2, 5),
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>
            {
                new() { AccountId = "acc-411", Debit = debit, Credit = 0 },
                new() { AccountId = "acc-700", Debit = 0, Credit = credit }
            }
        };

        SetupValidMocks();

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    private CreateJournalEntryCommand CreateValidCommand()
    {
        return new CreateJournalEntryCommand
        {
            EntryDate = new DateTime(2026, 2, 5),
            JournalCode = "VTE",
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>
            {
                new() { AccountId = "acc-411", Debit = 11900, Credit = 0 },
                new() { AccountId = "acc-700", Debit = 0, Credit = 10000 },
                new() { AccountId = "acc-4457", Debit = 0, Credit = 1900 }
            }
        };
    }
}
```

### Example: Validator Tests

```csharp
public class CreateJournalEntryCommandValidatorTests
{
    private readonly CreateJournalEntryCommandValidator _validator;

    public CreateJournalEntryCommandValidatorTests()
    {
        _validator = new CreateJournalEntryCommandValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = new CreateJournalEntryCommand
        {
            EntryDate = DateTime.UtcNow,
            JournalCode = "VTE",
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>
            {
                new() { AccountId = "acc-411", Debit = 1000, Credit = 0, Label = "Test" },
                new() { AccountId = "acc-700", Debit = 0, Credit = 1000, Label = "Test" }
            }
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_MissingEntryDate_FailsValidation()
    {
        // Arrange
        var command = new CreateJournalEntryCommand
        {
            EntryDate = default, // Invalid!
            JournalCode = "VTE",
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>()
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "EntryDate");
    }

    [Fact]
    public void Validate_UnbalancedEntry_FailsValidation()
    {
        // Arrange
        var command = new CreateJournalEntryCommand
        {
            EntryDate = DateTime.UtcNow,
            JournalCode = "VTE",
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>
            {
                new() { AccountId = "acc-411", Debit = 1000, Credit = 0, Label = "Test" },
                new() { AccountId = "acc-700", Debit = 0, Credit = 500, Label = "Test" } // Unbalanced!
            }
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage.Contains("balanced"));
    }
}
```

---

## Integration Testing

### Framework: WebApplicationFactory

```csharp
public class JournalEntriesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public JournalEntriesControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove real database
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory database
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseSqlite("DataSource=:memory:");
                });

                // Seed test data
                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                context.Database.EnsureCreated();
                SeedTestData(context);
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task CreateJournalEntry_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var command = new CreateJournalEntryCommand
        {
            EntryDate = new DateTime(2026, 2, 5),
            JournalCode = "VTE",
            FiscalYearId = "fy-2026",
            Lines = new List<JournalLineDto>
            {
                new() { AccountId = "acc-411", Debit = 11900, Credit = 0, Label = "Sale" },
                new() { AccountId = "acc-700", Debit = 0, Credit = 10000, Label = "Revenue" },
                new() { AccountId = "acc-4457", Debit = 0, Credit = 1900, Label = "VAT" }
            }
        };

        var content = new StringContent(
            JsonSerializer.Serialize(command),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/api/journal-entries", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var locationHeader = response.Headers.Location;
        locationHeader.Should().NotBeNull();

        // Verify entry was created
        var getResponse = await _client.GetAsync(locationHeader);
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var entry = await JsonSerializer.DeserializeAsync<JournalEntryDto>(
            await getResponse.Content.ReadAsStreamAsync()
        );

        entry.Should().NotBeNull();
        entry.Lines.Should().HaveCount(3);
        entry.TotalDebit.Should().Be(11900);
        entry.TotalCredit.Should().Be(11900);
    }

    [Fact]
    public async Task PostJournalEntry_ValidEntry_UpdatesStatus()
    {
        // Arrange
        var entryId = "entry-123"; // Pre-seeded entry

        // Act
        var response = await _client.PostAsync($"/api/journal-entries/{entryId}/post", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify status changed
        var getResponse = await _client.GetAsync($"/api/journal-entries/{entryId}");
        var entry = await JsonSerializer.DeserializeAsync<JournalEntryDto>(
            await getResponse.Content.ReadAsStreamAsync()
        );

        entry.Status.Should().Be("Posted");
        entry.PostedAt.Should().NotBeNull();
        entry.ValidationHash.Should().NotBeNullOrEmpty();
    }

    private void SeedTestData(ApplicationDbContext context)
    {
        // Seed fiscal year
        context.FiscalYears.Add(new FiscalYear
        {
            FiscalYearId = "fy-2026",
            YearNumber = 2026,
            StartDate = new DateTime(2026, 1, 1),
            EndDate = new DateTime(2026, 12, 31),
            Status = FiscalYearStatus.Open
        });

        // Seed accounts
        context.Accounts.AddRange(
            new Account { AccountId = "acc-411", AccountNumber = "411", AccountLabel = "Clients" },
            new Account { AccountId = "acc-700", AccountNumber = "700", AccountLabel = "Ventes" },
            new Account { AccountId = "acc-4457", AccountNumber = "4457", AccountLabel = "TVA collectée" }
        );

        // Seed draft entry
        var entry = new JournalEntry
        {
            EntryId = "entry-123",
            EntryNumber = 1,
            EntryDate = new DateTime(2026, 2, 1),
            JournalCode = "VTE",
            Status = EntryStatus.Draft,
            FiscalYearId = "fy-2026"
        };

        entry.Lines.Add(new JournalLine
        {
            LineId = "line-1",
            EntryId = "entry-123",
            AccountId = "acc-411",
            Debit = 1000,
            Credit = 0,
            Label = "Test"
        });

        entry.Lines.Add(new JournalLine
        {
            LineId = "line-2",
            EntryId = "entry-123",
            AccountId = "acc-700",
            Debit = 0,
            Credit = 1000,
            Label = "Test"
        });

        context.JournalEntries.Add(entry);

        context.SaveChanges();
    }
}
```

---

## End-to-End Testing

### Framework: Playwright

```typescript
// tests/e2e/journal-entries.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Journal Entries', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('create new journal entry', async ({ page }) => {
    // Navigate to journal entries
    await page.click('text=Journal Entries');
    await page.waitForURL('**/journal-entries');

    // Click create button
    await page.click('button:has-text("New Entry")');

    // Fill form
    await page.fill('input[name="entryDate"]', '2026-02-05');
    await page.selectOption('select[name="journalCode"]', 'VTE');
    await page.fill('input[name="reference"]', 'FAC-2026-001');
    await page.fill('textarea[name="description"]', 'Test sale');

    // Add first line
    await page.click('button:has-text("Add Line")');
    await page.fill('input[name="lines.0.accountNumber"]', '411');
    await page.fill('input[name="lines.0.debit"]', '11900');
    await page.fill('input[name="lines.0.label"]', 'Client ABC');

    // Add second line
    await page.click('button:has-text("Add Line")');
    await page.fill('input[name="lines.1.accountNumber"]', '700');
    await page.fill('input[name="lines.1.credit"]', '10000');
    await page.fill('input[name="lines.1.label"]', 'Sale');

    // Add third line
    await page.click('button:has-text("Add Line")');
    await page.fill('input[name="lines.2.accountNumber"]', '4457');
    await page.fill('input[name="lines.2.credit"]', '1900');
    await page.fill('input[name="lines.2.label"]', 'VAT 19%');

    // Verify balance
    const balanceText = await page.textContent('.balance-indicator');
    expect(balanceText).toContain('Balanced');

    // Submit
    await page.click('button:has-text("Save")');

    // Wait for success message
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Entry created');

    // Verify redirect to entry detail
    await page.waitForURL('**/journal-entries/*');

    // Verify entry details
    await expect(page.locator('h1')).toContainText('Entry #');
    await expect(page.locator('.status-badge')).toContainText('Draft');
  });

  test('post journal entry', async ({ page }) => {
    // Navigate to existing draft entry
    await page.goto('http://localhost:3000/journal-entries/entry-123');

    // Verify status is Draft
    await expect(page.locator('.status-badge')).toContainText('Draft');

    // Click Post button
    await page.click('button:has-text("Post Entry")');

    // Confirm dialog
    await page.click('button:has-text("Confirm")');

    // Wait for success
    await expect(page.locator('.toast-success')).toBeVisible();

    // Verify status changed to Posted
    await expect(page.locator('.status-badge')).toContainText('Posted');

    // Verify Edit button is disabled
    await expect(page.locator('button:has-text("Edit")')).toBeDisabled();
  });

  test('search journal entries', async ({ page }) => {
    await page.goto('http://localhost:3000/journal-entries');

    // Enter search term
    await page.fill('input[placeholder="Search..."]', 'FAC-2026');

    // Wait for results
    await page.waitForTimeout(500); // Debounce

    // Verify filtered results
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Verify all results contain search term
    const cells = await page.locator('table tbody tr td').allTextContents();
    const matchingCells = cells.filter(text => text.includes('FAC-2026'));
    expect(matchingCells.length).toBeGreaterThan(0);
  });
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Test Data Management

### Test Data Builders

```csharp
public class JournalEntryBuilder
{
    private string _entryId = Guid.NewGuid().ToString();
    private int _entryNumber = 1;
    private DateTime _entryDate = DateTime.UtcNow;
    private string _journalCode = "VTE";
    private EntryStatus _status = EntryStatus.Draft;
    private List<JournalLine> _lines = new();

    public JournalEntryBuilder WithId(string id)
    {
        _entryId = id;
        return this;
    }

    public JournalEntryBuilder WithNumber(int number)
    {
        _entryNumber = number;
        return this;
    }

    public JournalEntryBuilder WithDate(DateTime date)
    {
        _entryDate = date;
        return this;
    }

    public JournalEntryBuilder WithStatus(EntryStatus status)
    {
        _status = status;
        return this;
    }

    public JournalEntryBuilder WithLine(JournalLine line)
    {
        _lines.Add(line);
        return this;
    }

    public JournalEntryBuilder WithBalancedLines()
    {
        _lines.Add(new JournalLine
        {
            AccountId = "acc-411",
            Debit = 1000,
            Credit = 0,
            Label = "Test"
        });

        _lines.Add(new JournalLine
        {
            AccountId = "acc-700",
            Debit = 0,
            Credit = 1000,
            Label = "Test"
        });

        return this;
    }

    public JournalEntry Build()
    {
        var entry = new JournalEntry
        {
            EntryId = _entryId,
            EntryNumber = _entryNumber,
            EntryDate = _entryDate,
            JournalCode = _journalCode,
            Status = _status
        };

        foreach (var line in _lines)
        {
            entry.AddLine(line);
        }

        return entry;
    }
}

// Usage:
var entry = new JournalEntryBuilder()
    .WithNumber(123)
    .WithDate(new DateTime(2026, 2, 5))
    .WithBalancedLines()
    .Build();
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: windows-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 9.0.x

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 20.x

    - name: Restore dependencies
      run: dotnet restore

    - name: Build
      run: dotnet build --no-restore --configuration Release

    - name: Run unit tests
      run: dotnet test --no-build --configuration Release --logger "trx;LogFileName=test-results.trx"

    - name: Install frontend dependencies
      working-directory: ./src/TOTALFISC.Web
      run: npm ci

    - name: Run frontend tests
      working-directory: ./src/TOTALFISC.Web
      run: npm test

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: '**/test-results.trx'
```

---

## Code Coverage

### Coverlet Configuration

```xml
<PackageReference Include="coverlet.collector" Version="6.0.0" />
```

### Generate Coverage Report

```bash
# Run tests with coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generate HTML report
reportgenerator -reports:**/coverage.opencover.xml -targetdir:coverage-report -reporttypes:Html

# Open report
start coverage-report/index.html
```

### Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| **Domain** | 90%+ | 88% |
| **Application** | 80%+ | 76% |
| **Infrastructure** | 70%+ | 68% |
| **Overall** | 80%+ | 75% |

---

## Conclusion

The TOTALFISC testing strategy provides:

✅ **Comprehensive Coverage** - Unit, integration, and E2E tests  
✅ **Fast Feedback** - Tests run in <30 seconds  
✅ **Reliable** - Isolated tests with no flakiness  
✅ **Maintainable** - Clear test structure with builders  
✅ **CI/CD Integration** - Automated testing on every commit  
✅ **Quality Metrics** - Code coverage tracking  

This testing framework ensures code quality, prevents regressions, and enables confident refactoring while maintaining rapid development velocity.

---

**Related Documents:**
- [CQRS_IMPLEMENTATION.md](CQRS_IMPLEMENTATION.md) - Command/query handlers to test
- [DOMAIN_DRIVEN_DESIGN.md](DOMAIN_DRIVEN_DESIGN.md) - Domain entities to test
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - Performance testing
