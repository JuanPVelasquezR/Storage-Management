using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Receipt> Receipts => Set<Receipt>();
    public DbSet<ReceiptItem> ReceiptItems => Set<ReceiptItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>(b =>
        {
            b.ToTable("categories");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.Name).HasColumnName("name").HasMaxLength(120).IsRequired();
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            b.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<Product>(b =>
        {
            b.ToTable("products");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.Name).HasColumnName("name").HasMaxLength(160).IsRequired();
            b.Property(x => x.Description).HasColumnName("description").HasMaxLength(2000);
            b.Property(x => x.Price).HasColumnName("price").HasPrecision(12, 2).IsRequired();
            b.Property(x => x.Stock).HasColumnName("stock").IsRequired();
            b.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(1000);
            b.Property(x => x.Active).HasColumnName("active").HasDefaultValue(true);
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            b.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

            b.Property(x => x.CategoryId).HasColumnName("category_id").IsRequired();
            b.HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => x.CategoryId);
            b.HasIndex(x => x.CreatedAt);
        });

        modelBuilder.Entity<Receipt>(b =>
        {
            b.ToTable("receipts");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.ReceiptNumber).HasColumnName("receipt_number").HasMaxLength(40).IsRequired();
            b.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            b.Property(x => x.TotalAmount).HasColumnName("total_amount").HasPrecision(12, 2).IsRequired();
            b.HasIndex(x => x.ReceiptNumber).IsUnique();
            b.HasIndex(x => x.CreatedAt);
        });

        modelBuilder.Entity<ReceiptItem>(b =>
        {
            b.ToTable("receipt_items");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");

            b.Property(x => x.ReceiptId).HasColumnName("receipt_id").IsRequired();
            b.HasOne(x => x.Receipt)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.ReceiptId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
            b.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            b.Property(x => x.Quantity).HasColumnName("quantity").IsRequired();
            b.Property(x => x.UnitPrice).HasColumnName("unit_price").HasPrecision(12, 2).IsRequired();
            b.Property(x => x.LineTotal).HasColumnName("line_total").HasPrecision(12, 2).IsRequired();
        });
    }
}

