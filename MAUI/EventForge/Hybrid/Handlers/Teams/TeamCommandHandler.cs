using EventForge.Domain.Leagues;
using EventForge.Domain.Teams;
using EventForge.Hybrid.Commands.Teams;
using EventForge.Hybrid.DTOs;
using EventForge.Hybrid.Mappers;
using EventForge.Infrastructure;
using EventForge.Infrastructure.common;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventForge.Hybrid.Handlers.Teams;

public sealed class TeamCommandHandler
{
    private readonly EventForgeDbContext _db;
    private readonly SqliteEventStore _eventStore;
    private readonly FileStorage _fileStorage;
    private readonly TeamMapper _mapper;

    public TeamCommandHandler(
        EventForgeDbContext db,
        SqliteEventStore eventStore,
        FileStorage fileStorage,
        TeamMapper mapper)
    {
        _db = db;
        _eventStore = eventStore;
        _fileStorage = fileStorage;
        _mapper = mapper;
    }

    public async Task<List<Team>> GetAllTeams()
    {
        var result = await _db.Teams.OrderBy(t => t.Name).ToListAsync();
        return result.Select(x => _mapper.ToDomain(x)).ToList();
    }

    public async Task<Team> GetTeamById(GetTeamByIdQuery query)
    {
        var result = await _db.Teams.Where(t => t.TeamId == query.TeamId).FirstOrDefaultAsync();
        return _mapper.ToDomain(result);
    }

    public async Task<CommandResult> CreateTeam(TeamCommand cmd)
    {
        try
        {
            var teamId = Guid.NewGuid();

            string? logoPath = null;

            if (!string.IsNullOrWhiteSpace(cmd.Team.logoPath))
            {
                logoPath = await _fileStorage.SaveImageAsync(AssetCategory.Team, teamId, cmd.Team.logoPath);
            }

            var evt = new TeamCreated(
                teamId,
                cmd.Team.name,
                cmd.Team.shortName,
                logoPath
            );

            await using var tx = await _db.Database.BeginTransactionAsync();

            var version = await _eventStore.AppendAsync(teamId, "Team", evt);

            cmd.Team.id = teamId;
            cmd.Team.logoPath = logoPath;
            cmd.Team.createdAt = DateTime.Now;
            cmd.Team.updatedAt = DateTime.Now;

            _db.Teams.Add(_mapper.ToDto(cmd.Team, version));

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return CommandResult.Ok(
                "Team created successfully",
                new { teamId });
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    public async Task<CommandResult> UpdateTeam(TeamCommand cmd)
    {
        try
        {
            var existing = await _db.Teams
                .FirstOrDefaultAsync(t => t.TeamId == cmd.Team.id);

            if (existing is null)
                return CommandResult.Fail("Team does not exist");

            string? logoPath = existing.LogoPath;

            if (!string.IsNullOrWhiteSpace(cmd.Team.logoPath))
            {
                logoPath = await _fileStorage.SaveImageAsync(
                    AssetCategory.Team,
                    existing.TeamId,
                    cmd.Team.logoPath);
            }

            var evt = new TeamUpdated(
                existing.TeamId,
                cmd.Team.name,
                cmd.Team.shortName,
                logoPath
            );

            await using var tx = await _db.Database.BeginTransactionAsync();

            // 1️⃣ Append event
            var version = await _eventStore.AppendAsync(
                existing.TeamId,
                "Team",
                evt);

            // 2️⃣ Update projection
            existing.Name = cmd.Team.name;
            existing.ShortName = cmd.Team.shortName;
            existing.TeamProvidedBudget = cmd.Team.teamProvidedbudget;
            existing.LogoPath = logoPath;
            existing.Version = version;
            existing.UpdatedAt = DateTime.Now.ToString();

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return CommandResult.Ok("Team updated successfully");
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    public async Task<CommandResult> DeleteTeam(DeleteTeamCommand cmd)
    {
        try
        {
            var existing = await _db.Teams
                .FirstOrDefaultAsync(t => t.TeamId == cmd.TeamId);

            // 🔒 Idempotency: already deleted → OK
            if (existing is null)
                return CommandResult.Ok("Team already deleted");

            var evt = new TeamDeleted(existing.TeamId);

            await using var tx = await _db.Database.BeginTransactionAsync();

            // 1️⃣ Append delete event
            await _eventStore.AppendAsync(existing.TeamId, "Team", evt);

            _db.Teams.Remove(existing);
            _fileStorage.DeleteImage(existing.LogoPath);

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return CommandResult.Ok("Team deleted successfully");
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }
}
