using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventForge.Hybrid.DTOs;

public sealed class AuctionTeamDto
{
    public Guid AuctionId { get; set; }
    public Guid TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public decimal AuctionBudget { get; set; }
    public decimal Spent { get; set; }

    [NotMapped]
    public string? ImageBase { get; set; }
}
