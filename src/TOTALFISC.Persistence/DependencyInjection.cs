using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TOTALFISC.Domain.Accounting.Interfaces;
using TOTALFISC.Persistence.Repositories;

namespace TOTALFISC.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IJournalEntryRepository, JournalEntryRepository>();
        services.AddScoped<IFiscalYearRepository, FiscalYearRepository>();
        services.AddScoped<IThirdPartyRepository, ThirdPartyRepository>();

        return services;
    }
}
