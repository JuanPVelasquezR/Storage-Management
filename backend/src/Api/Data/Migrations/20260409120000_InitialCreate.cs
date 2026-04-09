using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Api.Data.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "categories",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_categories", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "receipts",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                receipt_number = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                total_amount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_receipts", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "products",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                price = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                stock = table.Column<int>(type: "integer", nullable: false),
                image_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                category_id = table.Column<int>(type: "integer", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_products", x => x.id);
                table.ForeignKey(
                    name: "FK_products_categories_category_id",
                    column: x => x.category_id,
                    principalTable: "categories",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "receipt_items",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                receipt_id = table.Column<int>(type: "integer", nullable: false),
                product_id = table.Column<int>(type: "integer", nullable: false),
                quantity = table.Column<int>(type: "integer", nullable: false),
                unit_price = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                line_total = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_receipt_items", x => x.id);
                table.ForeignKey(
                    name: "FK_receipt_items_products_product_id",
                    column: x => x.product_id,
                    principalTable: "products",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_receipt_items_receipts_receipt_id",
                    column: x => x.receipt_id,
                    principalTable: "receipts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_categories_name",
            table: "categories",
            column: "name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_products_category_id",
            table: "products",
            column: "category_id");

        migrationBuilder.CreateIndex(
            name: "IX_products_created_at",
            table: "products",
            column: "created_at");

        migrationBuilder.CreateIndex(
            name: "IX_receipt_items_product_id",
            table: "receipt_items",
            column: "product_id");

        migrationBuilder.CreateIndex(
            name: "IX_receipt_items_receipt_id",
            table: "receipt_items",
            column: "receipt_id");

        migrationBuilder.CreateIndex(
            name: "IX_receipts_created_at",
            table: "receipts",
            column: "created_at");

        migrationBuilder.CreateIndex(
            name: "IX_receipts_receipt_number",
            table: "receipts",
            column: "receipt_number",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "receipt_items");
        migrationBuilder.DropTable(name: "products");
        migrationBuilder.DropTable(name: "receipts");
        migrationBuilder.DropTable(name: "categories");
    }
}

