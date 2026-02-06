using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.Common;

namespace TOTALFISC.Domain.Accounting.Interfaces;

public interface IJournalEntryRepository : IRepository<JournalEntry>
{
    Task<int> GetNextEntryNumberAsync(Guid fiscalYearId, string journalCode);
    Task<IEnumerable<JournalEntry>> GetByFiscalYearAsync(Guid fiscalYearId);
}

public interface IAccountRepository : IRepository<Account>
{
    Task<Account?> GetByNumberAsync(string accountNumber);
    Task<IEnumerable<Account>> GetByClassAsync(int accountClass);
}

public interface IFiscalYearRepository : IRepository<FiscalYear>
{
    Task<FiscalYear?> GetByYearNumberAsync(int yearNumber);
}

public interface IThirdPartyRepository : IRepository<ThirdParty>
{
    Task<ThirdParty?> GetByCodeAsync(string code);
}
