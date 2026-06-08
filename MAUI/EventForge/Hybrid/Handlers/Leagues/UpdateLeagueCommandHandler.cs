using EventForge.Domain.Leagues;
using EventForge.Hybrid.Commands.Leagues;
using EventForge.Infrastructure;
using EventForge.Infrastructure.common;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Persistence;

namespace EventForge.Hybrid.Handlers.Leagues
{
    public sealed class UpdateLeagueCommandHandler
    {
        private readonly EventForgeDbContext _db;
        private readonly SqliteEventStore _eventStore;
        private readonly FileStorage _fileStorage;

        public UpdateLeagueCommandHandler(
            EventForgeDbContext db,
            SqliteEventStore eventStore,
            FileStorage fileStorage)
        {
            _db = db;
            _eventStore = eventStore;
            _fileStorage = fileStorage;
        }

        public async Task<CommandResult> HandleAsync(UpdateLeagueCommand cmd)
        {
            try
            {
                var league = await _db.Leagues.FindAsync(cmd.League.id);
                if (league == null) return CommandResult.Fail("No leagues found to update");

                string? newLogoPath = league.LogoPath;

                // 🔴 Replace logo if new one is provided
                if (!string.IsNullOrWhiteSpace(cmd.League.logoSourcePath))
                {
                    _fileStorage.DeleteImage(league.LogoPath);

                    newLogoPath = await _fileStorage.SaveImageAsync(AssetCategory.League, cmd.League.id, cmd.League.logoSourcePath);
                }

                var evt = new LeagueUpdated(
                    cmd.League.id,
                    cmd.League.name,
                    cmd.League.maxTeams,
                    cmd.League.maxPlayersPerTeam
                );

                await using var tx = await _db.Database.BeginTransactionAsync();

                var version = await _eventStore.AppendAsync(
                    cmd.League.id,
                    "League",
                    evt);

                league.Name = cmd.League.name;
                league.Description = cmd.League.description ?? "";
                league.MaxTeams = cmd.League.maxTeams;
                league.LogoPath = newLogoPath;
                league.MaxPlayers = cmd.League.maxPlayersPerTeam;
                league.Version = version;
                league.UpdatedAt = DateTimeOffset.Now.ToString();

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return CommandResult.Ok(
                    "League updated successfully",
                    new { cmd.League.name });
            }
            catch (Exception ex)
            {
                return CommandResult.Fail(ex.Message);
            }
        }

    }

}
