using EventForge.Domain.Leagues;

namespace EventForge.Hybrid.Commands.Leagues;

public sealed record CreateLeagueCommand(
    League League
);
