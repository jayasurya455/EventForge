using System;
namespace EventForge.Domain.Leagues
{
    public sealed record LeagueCreated(Guid LeagueId,string Name, int MaxTeams, int MaxPlayers, string LogoSourcePath);

}
