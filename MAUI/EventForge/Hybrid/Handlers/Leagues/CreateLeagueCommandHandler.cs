using EventForge.Domain.Leagues;
using EventForge.Hybrid.Commands.Leagues;
using EventForge.Hybrid.DTOs;
using EventForge.Infrastructure;
using EventForge.Infrastructure.common;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Persistence;

namespace EventForge.Hybrid.Handlers.Leagues;

public sealed class CreateLeagueCommandHandler
{
    private readonly EventForgeDbContext _db;
    private readonly SqliteEventStore _eventStore;
    private readonly FileStorage _fileStorage;

    public CreateLeagueCommandHandler(
        EventForgeDbContext db,
        SqliteEventStore eventStore,
        FileStorage fileStorage)
    {
        _db = db;
        _eventStore = eventStore;
        _fileStorage = fileStorage;
    }

    public async Task<CommandResult> HandleAsync(CreateLeagueCommand cmd)
    {
        try
        {
            var leagueId = Guid.NewGuid();

            string? logoPath = null;

            if (!string.IsNullOrWhiteSpace(cmd.League.logoSourcePath))
            {
                logoPath = await _fileStorage.SaveImageAsync(AssetCategory.League,leagueId,cmd.League.logoSourcePath);
            }

            var evt = new LeagueCreated(
                leagueId,
                cmd.League.name,
                cmd.League.maxTeams,
                cmd.League.maxPlayersPerTeam,
                cmd.League.logoSourcePath ?? "");

            await using var tx = await _db.Database.BeginTransactionAsync();

            var version = await _eventStore.AppendAsync(leagueId, "League", evt);

            _db.Leagues.Add(new LeagueDto
            {
                LeagueId = leagueId,
                Name = cmd.League.name,
                Description = cmd.League.description ?? "",
                MaxTeams = cmd.League.maxTeams,
                MaxPlayers = cmd.League.maxPlayersPerTeam,
                LogoPath = logoPath ?? string.Empty,
                Version = version,
                CreatedAt = DateTimeOffset.Now.ToString(),
                UpdatedAt = DateTimeOffset.Now.ToString(),
            });

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return CommandResult.Ok(
                "League created successfully",
                new { leagueId });
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }
}
