namespace Api.DTOs;

public sealed record CategoryDto(int Id, string Name, DateTimeOffset CreatedAt);

public sealed record CreateCategoryRequest(string Name);

public sealed record UpdateCategoryRequest(string Name);

