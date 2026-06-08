using EventForge.Domain.Leagues;
using EventForge.Hybrid.Commands.Leagues;
using EventForge.Infrastructure;
using EventForge.Infrastructure.common;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Persistence;

namespace EventForge.Hybrid.Handlers.Leagues
{
    public sealed class DeleteLeagueCommandHandler
    {
        private readonly EventForgeDbContext _db;
        private readonly SqliteEventStore _eventStore;
        private readonly FileStorage _fileStorage;

        public DeleteLeagueCommandHandler(
            EventForgeDbContext db,
            SqliteEventStore eventStore,
            FileStorage fileStorage)
        {
            _db = db;
            _eventStore = eventStore;
            _fileStorage = fileStorage;
        }

        public async Task<CommandResult> HandleAsync(DeleteLeagueCommand cmd)
        {
            try
            {
                var league = await _db.Leagues.FindAsync(cmd.LeagueId);
                if (league == null) return CommandResult.Fail("No leagues were found to delete");

                var evt = new LeagueDeleted(cmd.LeagueId);

                await using var tx = await _db.Database.BeginTransactionAsync();

                await _eventStore.AppendAsync(
                    cmd.LeagueId,
                    "League",
                    evt);

                _db.Leagues.Remove(league);

                _fileStorage.DeleteImage(league.LogoPath);

                await _db.SaveChangesAsync();
                await tx.CommitAsync();
                return CommandResult.Ok("League deleted successfully");
            }
            catch (Exception ex)
            {
                return CommandResult.Fail($"An error occurred while deleting the league: {ex.Message}");
            }
        }

    }

}
