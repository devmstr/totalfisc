using System.Collections.Generic;
using System.Threading.Tasks;

namespace TOTALFISC.Domain.Common;

public interface IRepository<T> where T : AggregateRoot
{
    Task<T?> GetByIdAsync(string id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}
