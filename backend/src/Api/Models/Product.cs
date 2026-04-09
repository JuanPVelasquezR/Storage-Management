namespace Api.Models;

public sealed class Product
{
    public int Id { get; set; }

    public required string Name { get; set; }
    public string? Description { get; set; }

    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public bool Active { get; set; } = true;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

