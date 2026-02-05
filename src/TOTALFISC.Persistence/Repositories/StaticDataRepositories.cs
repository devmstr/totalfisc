using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.Accounting.Interfaces;

namespace TOTALFISC.Persistence.Repositories;

public class FiscalYearRepository : RepositoryBase<FiscalYear>, IFiscalYearRepository
{
    public FiscalYearRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<FiscalYear?> GetByYearNumberAsync(int yearNumber)
    {
        return await _context.FiscalYears
            .FirstOrDefaultAsync(f => f.YearNumber == yearNumber);
    }
}

public class ThirdPartyRepository : RepositoryBase<ThirdParty>, IThirdPartyRepository
{
    public ThirdPartyRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<ThirdParty?> GetByCodeAsync(string code)
    {
        return await _context.ThirdParties
            .FirstOrDefaultAsync(t => t.Code == code);
    }
}
