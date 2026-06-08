using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventForge.Hybrid.DTOs;

public sealed class AuctionPlayerDto
{
    public Guid AuctionId { get; set; }
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public string Status { get; set; } = "Queued";
    public Guid? WinningTeamId { get; set; }
    public decimal? SalePrice { get; set; }
    public decimal? BasePrice { get; set; }

    [NotMapped]
    public string? ImageBase { get; set; }
}
