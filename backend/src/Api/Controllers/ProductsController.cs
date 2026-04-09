using Api.Data;
using Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Authorize]
[Route("api/products")]
public sealed class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> List(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] bool? active,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = db.Products.AsNoTracking().Include(x => x.Category).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            q = q.Where(x => x.Name.Contains(s) || (x.Description != null && x.Description.Contains(s)));
        }

        if (categoryId is not null)
            q = q.Where(x => x.CategoryId == categoryId.Value);

        if (active is not null)
            q = q.Where(x => x.Active == active.Value);

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductDto(
                x.Id,
                x.Name,
                x.Description,
                x.Price,
                x.Stock,
                x.ImageUrl,
                x.Active,
                x.CategoryId,
                x.Category!.Name,
                x.CreatedAt,
                x.UpdatedAt
            ))
            .ToListAsync(ct);

        return Ok(new PagedResult<ProductDto>(items, page, pageSize, total));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> Get([FromRoute] int id, CancellationToken ct)
    {
        var p = await db.Products.AsNoTracking()
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (p is null) return NotFound(new { message = "Producto no encontrado." });

        return Ok(new ProductDto(
            p.Id, p.Name, p.Description, p.Price, p.Stock, p.ImageUrl, p.Active,
            p.CategoryId, p.Category!.Name, p.CreatedAt, p.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductRequest req, CancellationToken ct)
    {
        var name = (req.Name ?? string.Empty).Trim();
        if (name.Length < 2) return BadRequest(new { message = "El nombre es obligatorio." });
        if (req.Price < 0) return BadRequest(new { message = "El precio no puede ser negativo." });
        if (req.Stock < 0) return BadRequest(new { message = "El stock no puede ser negativo." });

        var category = await db.Categories.FirstOrDefaultAsync(x => x.Id == req.CategoryId, ct);
        if (category is null) return BadRequest(new { message = "Categoría inválida." });

        var entity = new Models.Product
        {
            Name = name,
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            Price = req.Price,
            Stock = req.Stock,
            ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim(),
            CategoryId = req.CategoryId,
            Active = req.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        db.Products.Add(entity);
        await db.SaveChangesAsync(ct);

        return Ok(new ProductDto(
            entity.Id, entity.Name, entity.Description, entity.Price, entity.Stock, entity.ImageUrl, entity.Active,
            entity.CategoryId, category.Name, entity.CreatedAt, entity.UpdatedAt
        ));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update([FromRoute] int id, [FromBody] UpdateProductRequest req, CancellationToken ct)
    {
        var entity = await db.Products.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound(new { message = "Producto no encontrado." });

        var name = (req.Name ?? string.Empty).Trim();
        if (name.Length < 2) return BadRequest(new { message = "El nombre es obligatorio." });
        if (req.Price < 0) return BadRequest(new { message = "El precio no puede ser negativo." });
        if (req.Stock < 0) return BadRequest(new { message = "El stock no puede ser negativo." });

        var category = await db.Categories.FirstOrDefaultAsync(x => x.Id == req.CategoryId, ct);
        if (category is null) return BadRequest(new { message = "Categoría inválida." });

        entity.Name = name;
        entity.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        entity.Price = req.Price;
        entity.Stock = req.Stock;
        entity.ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim();
        entity.CategoryId = req.CategoryId;
        entity.Active = req.Active;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);

        return Ok(new ProductDto(
            entity.Id, entity.Name, entity.Description, entity.Price, entity.Stock, entity.ImageUrl, entity.Active,
            entity.CategoryId, category.Name, entity.CreatedAt, entity.UpdatedAt
        ));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> SoftDelete([FromRoute] int id, CancellationToken ct)
    {
        var entity = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound(new { message = "Producto no encontrado." });

        entity.Active = false;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPatch("{id:int}/active")]
    public async Task<ActionResult> SetActive([FromRoute] int id, [FromBody] UpdateProductActiveRequest req, CancellationToken ct)
    {
        var entity = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound(new { message = "Producto no encontrado." });

        entity.Active = req.Active;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

