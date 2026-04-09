namespace Api.Models;

public sealed class Receipt
{
    public int Id { get; set; }
    public required string ReceiptNumber { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public decimal TotalAmount { get; set; }

    public List<ReceiptItem> Items { get; set; } = [];
}

