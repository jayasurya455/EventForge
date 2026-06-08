using System;

namespace EventForge.Hybrid.DTOs;

public sealed class AuctionDto
{
    public Guid AuctionId { get; set; }
    public Guid LeagueId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset? ScheduledAt { get; set; }
    public string Status { get; set; } = "Draft";
    public Guid? CurrentPlayerId { get; set; }
    public long Version { get; set; }
    public long PerTeamBudget { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
