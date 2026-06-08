namespace EventForge.Infrastructure.Projections.Leagues;

public sealed class LeagueReadModel
{
    public Guid LeagueId { get; init; }
    public string Name { get; init; } = default!;
    public int MaxTeams { get; init; }
    public decimal BudgetPerTeam { get; init; }
}

