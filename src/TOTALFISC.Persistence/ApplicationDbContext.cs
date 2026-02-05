using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using TOTALFISC.Domain.Accounting.Entities;

namespace TOTALFISC.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<JournalLine> JournalLines => Set<JournalLine>();
    public DbSet<FiscalYear> FiscalYears => Set<FiscalYear>();
    public DbSet<ThirdParty> ThirdParties => Set<ThirdParty>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Global Decimal to String conversion for SQLite precision
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var properties = entityType.GetProperties()
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?));

            foreach (var property in properties)
            {
                property.SetProviderClrType(typeof(string));
            }
        }
    }
}
