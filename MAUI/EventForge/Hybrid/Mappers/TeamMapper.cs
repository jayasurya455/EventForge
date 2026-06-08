using EventForge.Domain.Teams;
using EventForge.Hybrid.DTOs;
using EventForge.Infrastructure.FileStore;

namespace EventForge.Hybrid.Mappers
{
    public class TeamMapper
    {
        private readonly ImageBase64Resolver _image;

        public TeamMapper(ImageBase64Resolver image)
        {
            _image = image;
        }

        public TeamDto ToDto(Team? team, long version = 0)
        {
            if (team == null)
                return new TeamDto();


            return new TeamDto()
            {
                TeamId = team.id,
                Name = team.name,
                ShortName = team.shortName,
                TeamColor = team.teamColor,
                Version = version,
                TeamProvidedBudget = team.teamProvidedbudget,
                LogoPath = team.logoPath ?? string.Empty,
                CreatedAt = team.createdAt.ToString("O"),
                UpdatedAt = team.updatedAt.ToString("O")
            };
        }

        public Team ToDomain(TeamDto? dto)
        {
            if (dto == null)
                return new Team();

            return new Team()
            {
                id = dto.TeamId,
                name = dto.Name,
                teamInitial = Convert.ToString(dto.Name.ElementAt(0)),
                shortName = dto.ShortName,
                teamColor = dto.TeamColor,
                teamProvidedbudget = dto.TeamProvidedBudget,
                createdAt = DateTime.Parse(dto.CreatedAt),
                updatedAt = DateTime.Parse(dto.UpdatedAt),
                logoImage = _image.Resolve(dto.LogoPath).Result
            };
        }
    }
}
