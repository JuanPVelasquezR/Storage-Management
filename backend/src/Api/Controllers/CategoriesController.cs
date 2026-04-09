using Api.Data;
using Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Authorize]
[Route("api/categories")]
public sealed class CategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> List(CancellationToken ct)
    {
        var items = await db.Categories
            .OrderBy(x => x.Name)
            .Select(x => new CategoryDto(x.Id, x.Name, x.CreatedAt))
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest req, CancellationToken ct)
    {
        var name = (req.Name ?? string.Empty).Trim();
        if (name.Length < 2) return BadRequest(new { message = "El nombre es obligatorio." });

        var exists = await db.Categories.AnyAsync(x => x.Name == name, ct);
        if (exists) return Conflict(new { message = "Ya existe una categoría con ese nombre." });

        var entity = new Models.Category { Name = name };
        db.Categories.Add(entity);
        await db.SaveChangesAsync(ct);

        return Ok(new CategoryDto(entity.Id, entity.Name, entity.CreatedAt));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Update([FromRoute] int id, [FromBody] UpdateCategoryRequest req, CancellationToken ct)
    {
        var entity = await db.Categories.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound(new { message = "Categoría no encontrada." });

        var name = (req.Name ?? string.Empty).Trim();
        if (name.Length < 2) return BadRequest(new { message = "El nombre es obligatorio." });

        var exists = await db.Categories.AnyAsync(x => x.Id != id && x.Name == name, ct);
        if (exists) return Conflict(new { message = "Ya existe una categoría con ese nombre." });

        entity.Name = name;
        await db.SaveChangesAsync(ct);

        return Ok(new CategoryDto(entity.Id, entity.Name, entity.CreatedAt));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete([FromRoute] int id, CancellationToken ct)
    {
        var entity = await db.Categories.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound(new { message = "Categoría no encontrada." });

        var hasProducts = await db.Products.AnyAsync(x => x.CategoryId == id, ct);
        if (hasProducts) return BadRequest(new { message = "No se puede borrar una categoría con productos." });

        db.Categories.Remove(entity);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

