using Api.Data;
using Api.DTOs;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public sealed class ReceiptService(AppDbContext db)
{
    public async Task<Receipt> CreateReceipt(CreateReceiptRequest req, CancellationToken ct)
    {
        if (req.Items is null || req.Items.Count == 0)
            throw new InvalidOperationException("La compra no tiene items.");

        var normalized = req.Items
            .Where(i => i.Quantity > 0)
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .ToList();

        if (normalized.Count == 0)
            throw new InvalidOperationException("Las cantidades deben ser mayores que 0.");

        var ids = normalized.Select(x => x.ProductId).ToList();
        var products = await db.Products
            .Where(p => ids.Contains(p.Id))
            .ToListAsync(ct);

        if (products.Count != ids.Count)
            throw new InvalidOperationException("Hay productos inválidos en la compra.");

        foreach (var line in normalized)
        {
            var p = products.First(x => x.Id == line.ProductId);
            if (!p.Active) throw new InvalidOperationException($"El producto \"{p.Name}\" está inactivo.");
            if (p.Stock < line.Quantity) throw new InvalidOperationException($"Stock insuficiente para \"{p.Name}\".");
        }

        // Descontar stock
        foreach (var line in normalized)
        {
            var p = products.First(x => x.Id == line.ProductId);
            p.Stock -= line.Quantity;
            p.UpdatedAt = DateTimeOffset.UtcNow;
        }

        // Generar recibo
        var receipt = new Receipt
        {
            ReceiptNumber = GenerateReceiptNumber(),
            CreatedAt = DateTimeOffset.UtcNow,
            TotalAmount = 0m,
        };

        foreach (var line in normalized)
        {
            var p = products.First(x => x.Id == line.ProductId);
            var unit = p.Price;
            var total = unit * line.Quantity;
            receipt.Items.Add(new ReceiptItem
            {
                ProductId = p.Id,
                Quantity = line.Quantity,
                UnitPrice = unit,
                LineTotal = total,
            });
            receipt.TotalAmount += total;
        }

        db.Receipts.Add(receipt);
        await db.SaveChangesAsync(ct);

        return receipt;
    }

    private static string GenerateReceiptNumber()
    {
        // Ejemplo: R-20260409-153012-4821
        var now = DateTime.UtcNow;
        var suffix = Random.Shared.Next(1000, 9999);
        return $"R-{now:yyyyMMdd}-{now:HHmmss}-{suffix}";
    }
}

