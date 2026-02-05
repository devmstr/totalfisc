using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TOTALFISC.Domain.Accounting.Entities;

namespace TOTALFISC.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Number)
            .HasConversion(
                v => v.Value,
                v => new TOTALFISC.Domain.Accounting.ValueObjects.AccountNumber(v))
            .IsRequired()
            .HasMaxLength(15);

        builder.HasIndex(x => x.Number).IsUnique();

        builder.Property(x => x.Label)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.IsSummary)
            .HasDefaultValue(false);

        builder.Property(x => x.IsAuxiliary)
            .HasDefaultValue(false);

        builder.HasOne<Account>()
            .WithMany()
            .HasForeignKey(x => x.ParentAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
