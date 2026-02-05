using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TOTALFISC.Domain.Accounting.Entities;

namespace TOTALFISC.Persistence.Configurations;

public class FiscalYearConfiguration : IEntityTypeConfiguration<FiscalYear>
{
    public void Configure(EntityTypeBuilder<FiscalYear> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.YearNumber)
            .IsRequired();

        builder.HasIndex(x => x.YearNumber).IsUnique();

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();
    }
}

public class ThirdPartyConfiguration : IEntityTypeConfiguration<ThirdParty>
{
    public void Configure(EntityTypeBuilder<ThirdParty> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(x => x.Code).IsUnique();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Type)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(x => x.NIF).HasMaxLength(20);
        builder.Property(x => x.NIS).HasMaxLength(20);
        builder.Property(x => x.RC).HasMaxLength(20);
        builder.Property(x => x.Email).HasMaxLength(100);
        builder.Property(x => x.Phone).HasMaxLength(20);
    }
}
