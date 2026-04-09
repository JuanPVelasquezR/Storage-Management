using System;
using Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Api.Data.Migrations;

[DbContext(typeof(AppDbContext))]
partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasAnnotation("ProductVersion", "10.0.5")
            .HasAnnotation("Relational:MaxIdentifierLength", 63);

        NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

        modelBuilder.Entity("Api.Models.Category", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer")
                .HasColumnName("id")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()");

            b.Property<string>("Name")
                .IsRequired()
                .HasMaxLength(120)
                .HasColumnType("character varying(120)")
                .HasColumnName("name");

            b.HasKey("Id");
            b.HasIndex("Name").IsUnique();
            b.ToTable("categories");
        });

        modelBuilder.Entity("Api.Models.Product", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer")
                .HasColumnName("id")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            b.Property<bool>("Active")
                .HasColumnType("boolean")
                .HasColumnName("active")
                .HasDefaultValue(true);

            b.Property<int>("CategoryId")
                .HasColumnType("integer")
                .HasColumnName("category_id");

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()");

            b.Property<string>("Description")
                .HasMaxLength(2000)
                .HasColumnType("character varying(2000)")
                .HasColumnName("description");

            b.Property<string>("ImageUrl")
                .HasMaxLength(1000)
                .HasColumnType("character varying(1000)")
                .HasColumnName("image_url");

            b.Property<string>("Name")
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("character varying(160)")
                .HasColumnName("name");

            b.Property<decimal>("Price")
                .HasPrecision(12, 2)
                .HasColumnType("numeric(12,2)")
                .HasColumnName("price");

            b.Property<int>("Stock")
                .HasColumnType("integer")
                .HasColumnName("stock");

            b.Property<DateTimeOffset>("UpdatedAt")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("updated_at")
                .HasDefaultValueSql("now()");

            b.HasKey("Id");
            b.HasIndex("CategoryId");
            b.HasIndex("CreatedAt");
            b.ToTable("products");
        });

        modelBuilder.Entity("Api.Models.Receipt", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer")
                .HasColumnName("id")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            b.Property<DateTimeOffset>("CreatedAt")
                .HasColumnType("timestamp with time zone")
                .HasColumnName("created_at")
                .HasDefaultValueSql("now()");

            b.Property<string>("ReceiptNumber")
                .IsRequired()
                .HasMaxLength(40)
                .HasColumnType("character varying(40)")
                .HasColumnName("receipt_number");

            b.Property<decimal>("TotalAmount")
                .HasPrecision(12, 2)
                .HasColumnType("numeric(12,2)")
                .HasColumnName("total_amount");

            b.HasKey("Id");
            b.HasIndex("CreatedAt");
            b.HasIndex("ReceiptNumber").IsUnique();
            b.ToTable("receipts");
        });

        modelBuilder.Entity("Api.Models.ReceiptItem", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer")
                .HasColumnName("id")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            b.Property<decimal>("LineTotal")
                .HasPrecision(12, 2)
                .HasColumnType("numeric(12,2)")
                .HasColumnName("line_total");

            b.Property<int>("ProductId")
                .HasColumnType("integer")
                .HasColumnName("product_id");

            b.Property<int>("Quantity")
                .HasColumnType("integer")
                .HasColumnName("quantity");

            b.Property<int>("ReceiptId")
                .HasColumnType("integer")
                .HasColumnName("receipt_id");

            b.Property<decimal>("UnitPrice")
                .HasPrecision(12, 2)
                .HasColumnType("numeric(12,2)")
                .HasColumnName("unit_price");

            b.HasKey("Id");
            b.HasIndex("ProductId");
            b.HasIndex("ReceiptId");
            b.ToTable("receipt_items");
        });

        modelBuilder.Entity("Api.Models.Product", b =>
        {
            b.HasOne("Api.Models.Category", "Category")
                .WithMany("Products")
                .HasForeignKey("CategoryId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.Navigation("Category");
        });

        modelBuilder.Entity("Api.Models.ReceiptItem", b =>
        {
            b.HasOne("Api.Models.Product", "Product")
                .WithMany()
                .HasForeignKey("ProductId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.HasOne("Api.Models.Receipt", "Receipt")
                .WithMany("Items")
                .HasForeignKey("ReceiptId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("Product");
            b.Navigation("Receipt");
        });

        modelBuilder.Entity("Api.Models.Category", b =>
        {
            b.Navigation("Products");
        });

        modelBuilder.Entity("Api.Models.Receipt", b =>
        {
            b.Navigation("Items");
        });
    }
}

