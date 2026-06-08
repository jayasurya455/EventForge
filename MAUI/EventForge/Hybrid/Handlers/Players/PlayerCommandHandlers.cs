using EventForge.Domain.Players;
using EventForge.Domain.Teams;
using EventForge.Hybrid.Commands.Players;
using EventForge.Hybrid.DTOs;
using EventForge.Hybrid.Mappers;
using EventForge.Infrastructure;
using EventForge.Infrastructure.common;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventForge.Hybrid.Handlers.Players
{
    public class PlayerCommandHandler
    {
        private readonly EventForgeDbContext _db;
        private readonly SqliteEventStore _eventStore;
        private readonly FileStorage _fileStorage;
        private readonly PlayerMapper _mapper;

        public PlayerCommandHandler(
            EventForgeDbContext db,
            SqliteEventStore eventStore,
            FileStorage fileStorage,
            PlayerMapper mapper)
        {
            _db = db;
            _eventStore = eventStore;
            _fileStorage = fileStorage;
            _mapper = mapper;
        }

        public async Task<List<Player>> GetAllPlayers()
        {
            var result = await _db.Players.OrderBy(t => t.Name).ToListAsync();

            return result.Select(x => _mapper.ToDomain(x)).ToList();
        }

        public async Task<Player> GetPlayerById(GetPlayerByIdQuery query)
        {
            var result = await _db.Players.Where(t => t.PlayerId == query.PlayerId).FirstOrDefaultAsync();
            return _mapper.ToDomain(result);
        }

        public async Task<CommandResult> CreatePlayer(PlayerCommand cmd)
        {
            try
            {
                var playerId = Guid.NewGuid();

                string? logoPath = null;

                if (!string.IsNullOrWhiteSpace(cmd.Player.imagePath))
                {
                    logoPath = await _fileStorage.SaveImageAsync(AssetCategory.Player, playerId, cmd.Player.imagePath);
                }

                var evt = new PlayerCreated(
                    playerId,
                    cmd.Player.name,
                    logoPath
                );

                await using var tx = await _db.Database.BeginTransactionAsync();

                var version = await _eventStore.AppendAsync(playerId, "Player", evt);

                _db.Players.Add(new PlayerDto
                {
                    PlayerId = playerId,
                    Name = cmd.Player.name,
                    PhotoPath = logoPath,
                    BasePrice = cmd.Player.basePrice,
                    Email = cmd.Player.email,
                    Role = cmd.Player.role ?? "",
                    Area = cmd.Player.area,
                    Version = version,
                    CreatedAt = DateTimeOffset.Now.ToString(),
                    UpdatedAt = DateTimeOffset.Now.ToString()
                });

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return CommandResult.Ok("Player created successfully", new { playerId });
            }
            catch (Exception ex)
            {
                return CommandResult.Fail(ex.Message);
            }
        }

        public async Task<CommandResult> UpdatePlayer(PlayerCommand cmd)
        {
            try
            {
                var existing = await _db.Players
                    .FirstOrDefaultAsync(t => t.PlayerId == cmd.Player.id);

                if (existing is null)
                    return CommandResult.Fail("Player does not exist");

                string? logoPath = existing.PhotoPath;

                if (!string.IsNullOrWhiteSpace(cmd.Player.imagePath))
                {
                    logoPath = await _fileStorage.SaveImageAsync(
                        AssetCategory.Player,
                        existing.PlayerId,
                        cmd.Player.imagePath);
                }

                var evt = new PlayerUpdated(
                    existing.PlayerId,
                    cmd.Player.name,
                    logoPath
                );

                await using var tx = await _db.Database.BeginTransactionAsync();

                var version = await _eventStore.AppendAsync(
                    existing.PlayerId,
                    "Player",
                    evt);

                existing.Name = cmd.Player.name;
                existing.BasePrice = cmd.Player.basePrice;
                existing.Role = cmd.Player.role ?? "";
                existing.Area = cmd.Player.area;
                existing.Email = cmd.Player.email;
                existing.PhotoPath = logoPath;
                existing.Version = version;
                existing.UpdatedAt = DateTimeOffset.Now.ToString();

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return CommandResult.Ok("Player updated successfully");
            }
            catch (Exception ex)
            {
                return CommandResult.Fail(ex.Message);
            }
        }

        public async Task<CommandResult> DeletePlayer(DeletePlayerCommand cmd)
        {
            try
            {
                var existing = await _db.Players.FirstOrDefaultAsync(t => t.PlayerId == cmd.PlayerId);

                if (existing is null)
                    return CommandResult.Ok("Player already deleted");

                var evt = new PlayerDeleted(
                    existing.PlayerId
                );

                await using var tx = await _db.Database.BeginTransactionAsync();

                // 1️⃣ Append delete event
                await _eventStore.AppendAsync(existing.PlayerId, "Player", evt);

                _db.Players.Remove(existing);
                _fileStorage.DeleteImage(existing.PhotoPath);

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return CommandResult.Ok("Player deleted successfully");
            }
            catch (Exception ex)
            {
                return CommandResult.Fail(ex.Message);
            }
        }
    }
}
