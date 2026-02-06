using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.Accounting.Interfaces;

namespace TOTALFISC.Infrastructure.Repositories;

public class AccountRepository : RepositoryBase<Account>, IAccountRepository
{
    public AccountRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Account?> GetByNumberAsync(string accountNumber)
    {
        return await _context.Accounts
            .FirstOrDefaultAsync(a => a.Number.Value == accountNumber);
    }

    public async Task<IEnumerable<Account>> GetByClassAsync(int accountClass)
    {
        string classPrefix = accountClass.ToString();
        return await _context.Accounts
            .Where(a => a.Number.Value.StartsWith(classPrefix))
            .ToListAsync();
    }
}

public class JournalEntryRepository : RepositoryBase<JournalEntry>, IJournalEntryRepository
{
    public JournalEntryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<JournalEntry?> GetByIdAsync(Guid id)
    {
        return await _context.JournalEntries
            .Include(e => e.Lines)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<int> GetNextEntryNumberAsync(Guid fiscalYearId, string journalCode)
    {
        var maxNumber = await _context.JournalEntries
            .Where(e => e.FiscalYearId == fiscalYearId && e.JournalCode == journalCode)
            .MaxAsync(e => (int?)e.EntryNumber) ?? 0;

        return maxNumber + 1;
    }

    public async Task<IEnumerable<JournalEntry>> GetByFiscalYearAsync(Guid fiscalYearId, int? limit = null)
    {
        var query = _context.JournalEntries
            .Where(e => e.FiscalYearId == fiscalYearId)
            .Include(e => e.Lines);

        if (limit.HasValue)
        {
            return await query
                .OrderByDescending(e => e.EntryDate)
                .ThenByDescending(e => (int)e.EntryNumber)
                .Take(limit.Value)
                .ToListAsync();
        }

        return await query
            .OrderBy(e => e.EntryDate)
            .ThenBy(e => (int)e.EntryNumber)
            .ToListAsync();
    }
}
