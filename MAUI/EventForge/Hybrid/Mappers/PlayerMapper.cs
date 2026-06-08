using EventForge.Domain.Players;
using EventForge.Hybrid.DTOs;
using EventForge.Infrastructure.FileStore;

namespace EventForge.Hybrid.Mappers
{
    public class PlayerMapper
    {
        private readonly ImageBase64Resolver _image;

        public PlayerMapper(ImageBase64Resolver image)
        {
            _image = image;
        }

        public PlayerDto ToDto(Player? player, long version = 0)
        {
            if (player == null)
                return new PlayerDto();


            return new PlayerDto()
            {
                PlayerId = player.id,
                Name = player.name,
                Role = player.role ?? "",
                Email = player.email,
                BasePrice = player.basePrice,
                Version = version,
                PhotoPath = player.imagePath ?? string.Empty,
                Area = player.area,
                CreatedAt = player.createdAt.ToString("O"),
                UpdatedAt = player.updatedAt.ToString("O")
            };
        }

        public Player ToDomain(PlayerDto? dto)
        {
            if (dto == null)
                return new Player();

            return new Player()
            {
                id = dto.PlayerId,
                name = dto.Name,
                email = dto.Email,
                imagePath = dto.PhotoPath,
                role = dto.Role,
                basePrice = dto.BasePrice,
                area = dto.Area,
                initial = Convert.ToString(dto.Name.ElementAt(0)),
                createdAt = DateTime.Parse(dto.CreatedAt),
                updatedAt = DateTime.Parse(dto.UpdatedAt),
                imageBase = _image.Resolve(dto.PhotoPath).Result
            };
        }
    }
}
