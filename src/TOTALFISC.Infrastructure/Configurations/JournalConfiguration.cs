using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TOTALFISC.Domain.Accounting.Entities;
using TOTALFISC.Domain.ValueObjects;

namespace TOTALFISC.Infrastructure.Configurations;

public class JournalEntryConfiguration : IEntityTypeConfiguration<JournalEntry>
{
    public void Configure(EntityTypeBuilder<JournalEntry> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.JournalCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.FiscalYearId)
            .IsRequired();

        builder.HasIndex(x => new { x.FiscalYearId, x.EntryNumber }).IsUnique();
        builder.HasIndex(x => x.EntryDate);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.Reference)
            .HasMaxLength(100);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.HasMany(x => x.Lines)
            .WithOne()
            .HasForeignKey("JournalEntryId")
            .OnDelete(DeleteBehavior.Cascade);

        // Accessing private collection via backing field if necessary, 
        // but EF can handle IReadOnlyCollection with convention if named correctly.
        builder.Navigation(x => x.Lines).HasField("_lines");
    }
}

public class JournalLineConfiguration : IEntityTypeConfiguration<JournalLine>
{
    public void Configure(EntityTypeBuilder<JournalLine> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Label)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Debit)
            .HasConversion(v => v.AmountInMillimes, v => Money.FromMillimes(v))
            .HasColumnType("INTEGER")
            .HasColumnName("DebitMillimes")
            .IsRequired();

        builder.Property(x => x.Credit)
            .HasConversion(v => v.AmountInMillimes, v => Money.FromMillimes(v))
            .HasColumnType("INTEGER")
            .HasColumnName("CreditMillimes")
            .IsRequired();

        builder.HasOne<Account>()
            .WithMany()
            .HasForeignKey(x => x.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ThirdParty>()
            .WithMany()
            .HasForeignKey(x => x.ThirdPartyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
