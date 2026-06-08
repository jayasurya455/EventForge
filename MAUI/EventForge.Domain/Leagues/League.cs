using EventForge.Domain.Common;

namespace EventForge.Domain.Leagues
{
    public class League : BaseEntity
    {
        public string name { get; set; } = string.Empty;
        public string? description { get; set; }
        public string? logoSourcePath { get; set; }
        public int maxTeams { get; set; }
        public int maxPlayersPerTeam { get; set; }
        public string? logoImage { get; set; }
    }
}
