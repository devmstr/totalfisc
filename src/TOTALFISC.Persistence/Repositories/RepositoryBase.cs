using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TOTALFISC.Domain.Common;

namespace TOTALFISC.Persistence.Repositories;

public abstract class RepositoryBase<T> : IRepository<T> where T : AggregateRoot
{
    protected readonly ApplicationDbContext _context;

    protected RepositoryBase(ApplicationDbContext context)
    {
        _context = context;
    }

    public virtual async Task<T?> GetByIdAsync(string id)
    {
        return await _context.Set<T>().FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _context.Set<T>().ToListAsync();
    }

    public virtual async Task AddAsync(T entity)
    {
        await _context.Set<T>().AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task UpdateAsync(T entity)
    {
        _context.Set<T>().Update(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(T entity)
    {
        _context.Set<T>().Remove(entity);
        await _context.SaveChangesAsync();
    }
}
