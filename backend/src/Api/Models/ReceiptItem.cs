namespace Api.Models;

public sealed class ReceiptItem
{
    public int Id { get; set; }

    public int ReceiptId { get; set; }
    public Receipt? Receipt { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

