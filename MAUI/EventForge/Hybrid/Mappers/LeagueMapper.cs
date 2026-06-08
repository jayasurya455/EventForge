using EventForge.Domain.Leagues;
using EventForge.Hybrid.DTOs;
using EventForge.Infrastructure.FileStore;

namespace EventForge.Hybrid.Mappers;

public class LeagueMapper
{
    private readonly ImageBase64Resolver _image;

    public LeagueMapper(ImageBase64Resolver image)
    {
        _image = image;
    }

    public LeagueDto ToDto(League? league)
    {
        if (league == null)
            return new LeagueDto();


        return new LeagueDto()
        {
            LeagueId = league.id,
            Name = league.name,
            Description = league.description ?? string.Empty,
            MaxTeams = league.maxTeams,
            MaxPlayers = league.maxPlayersPerTeam,
            LogoPath = league.logoSourcePath ?? string.Empty,
            CreatedAt = league.createdAt.ToString("O"),
            UpdatedAt = league.updatedAt.ToString("O")
        };
    }

    public League ToDomain(LeagueDto? dto)
    {
        if (dto == null)
            return new League();

        return new League()
        {
            id = dto.LeagueId,
            name = dto.Name,
            description = dto.Description,
            logoSourcePath = dto.LogoPath,
            maxPlayersPerTeam = dto.MaxPlayers,
            maxTeams = dto.MaxTeams,
            createdAt = DateTime.Parse(dto.CreatedAt),
            updatedAt = DateTime.Parse(dto.UpdatedAt),
            logoImage = _image.Resolve(dto.LogoPath).Result
        };
    }
}
