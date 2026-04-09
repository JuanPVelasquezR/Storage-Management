namespace Api.DTOs;

public sealed record CreateReceiptItemRequest(int ProductId, int Quantity);

public sealed record CreateReceiptRequest(IReadOnlyList<CreateReceiptItemRequest> Items);

public sealed record ReceiptItemDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal LineTotal);

public sealed record ReceiptDto(
    int Id,
    string ReceiptNumber,
    DateTimeOffset CreatedAt,
    decimal TotalAmount,
    IReadOnlyList<ReceiptItemDto> Items
);

public sealed record ReceiptListItemDto(int Id, string ReceiptNumber, DateTimeOffset CreatedAt, decimal TotalAmount);

