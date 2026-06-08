namespace EventForge.Hybrid.DTOs;

public class LeagueDto
{
    public Guid LeagueId { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string LogoPath { get; set; } = default!;
    public int MaxTeams { get; set; }
    public int MaxPlayers { get; set; }
    public long Version { get; set; }
    public string CreatedAt { get; set; } = default!;
    public string UpdatedAt { get; set; } = default!;
}
