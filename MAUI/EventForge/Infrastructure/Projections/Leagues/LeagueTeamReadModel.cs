namespace EventForge.Infrastructure.Projections.Leagues;

public sealed class LeagueTeamReadModel
{
    public Guid LeagueId { get; set; }
    public Guid TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
}
