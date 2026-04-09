using Api.Data;
using Api.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Authorize]
[Route("api/receipts")]
public sealed class ReceiptsController(AppDbContext db, ReceiptService receipts) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ReceiptDto>> Create([FromBody] CreateReceiptRequest req, CancellationToken ct)
    {
        try
        {
            var receipt = await receipts.CreateReceipt(req, ct);

            var full = await db.Receipts.AsNoTracking()
                .Include(r => r.Items)
                .ThenInclude(i => i.Product)
                .FirstAsync(r => r.Id == receipt.Id, ct);

            return Ok(ToDto(full));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ReceiptListItemDto>>> List(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = db.Receipts.AsNoTracking().AsQueryable();
        if (from is not null) q = q.Where(r => r.CreatedAt >= from.Value);
        if (to is not null) q = q.Where(r => r.CreatedAt <= to.Value);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReceiptListItemDto(r.Id, r.ReceiptNumber, r.CreatedAt, r.TotalAmount))
            .ToListAsync(ct);

        return Ok(new PagedResult<ReceiptListItemDto>(items, page, pageSize, total));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReceiptDto>> Get([FromRoute] int id, CancellationToken ct)
    {
        var r = await db.Receipts.AsNoTracking()
            .Include(x => x.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (r is null) return NotFound(new { message = "Recibo no encontrado." });
        return Ok(ToDto(r));
    }

    private static ReceiptDto ToDto(Models.Receipt r)
    {
        var items = r.Items
            .OrderBy(i => i.Id)
            .Select(i => new ReceiptItemDto(
                i.ProductId,
                i.Product?.Name ?? "Producto",
                i.Quantity,
                i.UnitPrice,
                i.LineTotal
            ))
            .ToList();

        return new ReceiptDto(r.Id, r.ReceiptNumber, r.CreatedAt, r.TotalAmount, items);
    }
}

