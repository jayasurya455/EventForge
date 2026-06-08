using EventForge.Domain.Auctions;
using EventForge.Domain.Common;
using EventForge.Hybrid.Commands.Auctions;
using EventForge.Hybrid.DTOs;
using EventForge.Infrastructure;
using EventForge.Infrastructure.common;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventForge.Hybrid.Handlers.Auctions;

public sealed class AuctionCommandHandler
{
    private readonly EventForgeDbContext _db;
    private readonly SqliteEventStore _eventStore;
    private readonly ImageBase64Resolver _imageResolver;

    public AuctionCommandHandler(EventForgeDbContext db, SqliteEventStore eventStore, ImageBase64Resolver imageResolver)
    {
        _db = db;
        _eventStore = eventStore;
        _imageResolver = imageResolver;
    }

    // Draft / setup
    public async Task<CommandResult> CreateAuction(CreateAuctionCommand cmd)
    {
        try
        {
            var newAuctionId = Guid.NewGuid();
            var aggregate = AuctionAggregate.Create(new CreateAuction(newAuctionId, Guid.Parse(cmd.LeagueId), cmd.Name, cmd.ScheduledAt, cmd.PerTeamBudget));

            await using var tx = await _db.Database.BeginTransactionAsync();
            await PersistAsync(aggregate);
            await tx.CommitAsync();

            return CommandResult.Ok("Auction created", new { auctionId = newAuctionId });
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    public async Task<CommandResult> UpdateBasics(UpdateAuctionBasicsCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.UpdateBasics(new UpdateAuctionBasics(Guid.Parse(cmd.AuctionId), cmd.Name, cmd.ScheduledAt, cmd.PerTeamBudget)), "Auction basics updated");
    }

    public async Task<CommandResult> AddTeam(AddAuctionTeamCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.AddTeam(new AddAuctionTeam(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.TeamId), cmd.TeamName, cmd.AuctionBudget)), "Team added to auction");
    }

    public async Task<CommandResult> RemoveTeam(RemoveAuctionTeamCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.RemoveTeam(new RemoveAuctionTeam(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.TeamId))), "Team added to auction");
    }

    public async Task<CommandResult> UpdateTeamBudget(UpdateAuctionTeamBudgetCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.UpdateTeamBudget(new UpdateAuctionTeamBudget(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.TeamId), cmd.AuctionBudget)), "Auction team budget updated");
    }

    public async Task<CommandResult> FinalizeTeams(FinalizeAuctionTeamsCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.FinalizeTeams(new FinalizeAuctionTeams(Guid.Parse(cmd.AuctionId))), "Auction teams finalized");
    }

    public async Task<CommandResult> AddPlayer(AddAuctionPlayerCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.AddPlayer(new AddAuctionPlayer(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.PlayerId), cmd.PlayerName)), "Player added to auction");
    }

    public async Task<CommandResult> RemovePlayer(RemoveAuctionPlayerCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.RemovePlayer(new RemoveAuctionPlayer(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.PlayerId))), "Player removed from auction");
    }

    public async Task<CommandResult> FinalizePlayers(FinalizeAuctionPlayersCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.FinalizePlayers(new FinalizeAuctionPlayers(Guid.Parse(cmd.AuctionId))), "Auction players finalized");
    }

    // Lifecycle
    public async Task<CommandResult> Schedule(ScheduleAuctionCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.Schedule(new ScheduleAuction(Guid.Parse(cmd.AuctionId), cmd.ScheduledAt)), "Auction scheduled");
    }

    public async Task<CommandResult> Launch(LaunchAuctionCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.Launch(new LaunchAuction(Guid.Parse(cmd.AuctionId))), "Auction launched");
    }

    public async Task<CommandResult> Pause(PauseAuctionCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.Pause(new PauseAuction(Guid.Parse(cmd.AuctionId))), "Auction paused");
    }

    public async Task<CommandResult> Resume(ResumeAuctionCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.Resume(new ResumeAuction(Guid.Parse(cmd.AuctionId))), "Auction resumed");
    }

    public async Task<CommandResult> Complete(CompleteAuctionCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.Complete(new CompleteAuction(Guid.Parse(cmd.AuctionId))), "Auction completed");
    }

    public async Task<CommandResult> CancelDraft(CancelAuctionDraftCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.CancelDraft(new CancelAuctionDraft(Guid.Parse(cmd.AuctionId))), "Auction draft canceled");
    }

    // Live lots / bidding
    public async Task<CommandResult> OpenLot(OpenPlayerLotCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.OpenLot(new OpenPlayerLot(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.PlayerId))), "Player lot opened");
    }

    public async Task<CommandResult> PlaceBid(PlaceAuctionBidCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.PlaceBid(new PlaceBid(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.TeamId), cmd.Amount)), "Bid placed");
    }

    public async Task<CommandResult> SellPlayer(SellPlayerCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.SellPlayer(new SellPlayer(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.PlayerId), Guid.Parse(cmd.WinningTeamId), cmd.Amount)), "Player sold");
    }

    public async Task<CommandResult> MarkUnsold(MarkPlayerUnsoldCommand cmd)
    {
        return await Execute(Guid.Parse(cmd.AuctionId), aggregate => aggregate.MarkUnsold(new MarkPlayerUnsold(Guid.Parse(cmd.AuctionId), Guid.Parse(cmd.PlayerId))), "Player marked unsold");
    }

    // Queries (read side)
    public async Task<IEnumerable<AuctionDto>> GetAuctionsByLeague(Guid leagueId)
    {
        var auctions = await _db.Auctions.Where(a => a.LeagueId == leagueId).ToListAsync();
        return auctions.OrderByDescending(a => a.CreatedAt).ToList();
    }

    public async Task<object?> GetAuctionDetail(Guid auctionId)
    {
        var auction = await _db.Auctions.FirstOrDefaultAsync(a => a.AuctionId == auctionId);
        if (auction is null) return null;

        var teams = await _db.AuctionTeams.Where(t => t.AuctionId == auctionId).ToListAsync();
        var players = await _db.AuctionPlayers.Where(p => p.AuctionId == auctionId).ToListAsync();

        // Enrich players with images from master Players table
        var playerIds = players.Select(p => p.PlayerId).ToList();
        var masterPlayers = await _db.Players
            .Where(p => playerIds.Contains(p.PlayerId))
            .Select(p => new { p.PlayerId, p.PhotoPath })
            .ToListAsync();

        foreach (var ap in players)
        {
            var master = masterPlayers.FirstOrDefault(m => m.PlayerId == ap.PlayerId);
            if (master?.PhotoPath is not null)
                ap.ImageBase = await _imageResolver.Resolve(master.PhotoPath);
        }

        // Enrich teams with images from master Teams table
        var teamIds = teams.Select(t => t.TeamId).ToList();
        var masterTeams = await _db.Teams
            .Where(t => teamIds.Contains(t.TeamId))
            .Select(t => new { t.TeamId, t.LogoPath })
            .ToListAsync();

        foreach (var at in teams)
        {
            var master = masterTeams.FirstOrDefault(m => m.TeamId == at.TeamId);
            if (master?.LogoPath is not null)
                at.ImageBase = await _imageResolver.Resolve(master.LogoPath);
        }

        return new { auction, teams, players };
    }

    public async Task<object> GetAuctionListPage(Guid leagueId)
    {
        var league = await _db.Leagues.FirstOrDefaultAsync(l => l.LeagueId == leagueId);

        var auctions = await _db.Auctions
            .Where(a => a.LeagueId == leagueId)
            .ToListAsync();

        var auctionIds = auctions.Select(a => a.AuctionId).ToList();

        var totalSpent = auctionIds.Count == 0 ? 0m :
            await _db.AuctionTeams.Where(t => auctionIds.Contains(t.AuctionId)).SumAsync(t => t.Spent);

        var totalTeams = auctionIds.Count == 0 ? 0 :
            await _db.AuctionTeams.Where(t => auctionIds.Contains(t.AuctionId)).Select(t => t.TeamId).Distinct().CountAsync();

        var totalPlayers = auctionIds.Count == 0 ? 0 :
            await _db.AuctionPlayers.Where(p => auctionIds.Contains(p.AuctionId)).CountAsync();

        return new
        {
            auctions = auctions.OrderByDescending(a => a.CreatedAt).ToList(),
            league,
            stats = new
            {
                TotalAuctions = auctions.Count,
                TotalSpent = totalSpent,
                TotalTeams = totalTeams,
                TotalPlayers = totalPlayers
            }
        };
    }

    public async Task<object> GetLeagueStats(Guid leagueId)
    {
        var auctionIds = await _db.Auctions
            .Where(a => a.LeagueId == leagueId)
            .Select(a => a.AuctionId)
            .ToListAsync();

        var totalAuctions = auctionIds.Count;

        var totalSpent = auctionIds.Count == 0 ? 0m :
            await _db.AuctionTeams
                .Where(t => auctionIds.Contains(t.AuctionId))
                .SumAsync(t => t.Spent);

        var totalTeams = auctionIds.Count == 0 ? 0 :
            await _db.AuctionTeams
                .Where(t => auctionIds.Contains(t.AuctionId))
                .Select(t => t.TeamId)
                .Distinct()
                .CountAsync();

        var totalPlayers = auctionIds.Count == 0 ? 0 :
            await _db.AuctionPlayers
                .Where(p => auctionIds.Contains(p.AuctionId))
                .CountAsync();

        return new
        {
            TotalAuctions = totalAuctions,
            TotalSpent = totalSpent,
            TotalTeams = totalTeams,
            TotalPlayers = totalPlayers
        };
    }

    // Internal helpers
    private async Task<CommandResult> Execute(Guid auctionId, Action<AuctionAggregate> act, string successMessage)
    {
        try
        {
            var aggregate = await LoadAggregate(auctionId);
            act(aggregate);

            await using var tx = await _db.Database.BeginTransactionAsync();
            await PersistAsync(aggregate);
            await tx.CommitAsync();

            return CommandResult.Ok(successMessage, new { auctionId });
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    private async Task<AuctionAggregate> LoadAggregate(Guid auctionId)
    {
        var events = await _db.Events
            .Where(e => e.AggregateId == auctionId && e.AggregateType == "Auction")
            .OrderBy(e => e.EventNumber)
            .ToListAsync();

        var aggregate = new AuctionAggregate();
        aggregate.LoadFromHistory(events.Select(e => DeserializeEvent(e.EventType, e.PayloadJson)));
        aggregate.ClearUncommittedEvents();

        return aggregate;
    }

    private async Task PersistAsync(AuctionAggregate aggregate)
    {
        foreach (var @event in aggregate.UncommittedEvents)
        {
            var version = await _eventStore.AppendAsync(aggregate.Id, "Auction", @event);
            await ApplySnapshotAsync(@event, version);
        }

        await _db.SaveChangesAsync();
        aggregate.ClearUncommittedEvents();
    }

    private async Task ApplySnapshotAsync(object @event, long version)
    {
        switch (@event)
        {
            case AuctionCreated e:
                _db.Auctions.Add(new AuctionDto
                {
                    AuctionId = e.AggregateId,
                    LeagueId = e.LeagueId,
                    Name = e.Name,
                    ScheduledAt = e.ScheduledAt,
                    PerTeamBudget = e.PerTeamBudget,
                    Status = AuctionState.Draft.ToString(),
                    Version = version,
                    CreatedAt = DateTimeOffset.UtcNow
                });
                break;

            case AuctionBasicsUpdated e:
                var basics = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                basics.Name = e.Name;
                basics.ScheduledAt = e.ScheduledAt;
                basics.Version = version;
                basics.PerTeamBudget = e.PerTeamBudget;
                break;

            case AuctionScheduled e:
                var scheduled = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                scheduled.ScheduledAt = e.ScheduledAt;
                scheduled.Status = AuctionState.Scheduled.ToString();
                scheduled.Version = version;
                break;

            case AuctionLaunched e:
                var launched = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                launched.Status = AuctionState.Live.ToString();
                launched.Version = version;
                break;

            case AuctionPaused e:
                var paused = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                paused.Status = AuctionState.Paused.ToString();
                paused.Version = version;
                break;

            case AuctionResumed e:
                var resumed = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                resumed.Status = AuctionState.Live.ToString();
                resumed.Version = version;
                break;

            case AuctionCompleted e:
                var completed = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                completed.Status = AuctionState.Completed.ToString();
                completed.Version = version;
                break;

            case AuctionDraftCanceled e:
                var canceled = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                canceled.Status = AuctionState.Canceled.ToString();
                canceled.Version = version;
                break;

            case AuctionTeamAdded e:
                _db.AuctionTeams.Add(new AuctionTeamDto
                {
                    AuctionId = e.AggregateId,
                    TeamId = e.TeamId,
                    TeamName = e.TeamName,
                    AuctionBudget = e.AuctionBudget,
                    Spent = 0m
                });
                break;

            case AuctionTeamRemoved e:
                var removeTeam = await _db.AuctionTeams.FirstAsync(t => t.AuctionId == e.AggregateId && t.TeamId == e.TeamId);
                _db.AuctionTeams.Remove(removeTeam);
                break;

            case AuctionTeamBudgetUpdated e:
                var team = await _db.AuctionTeams.FirstAsync(t => t.AuctionId == e.AggregateId && t.TeamId == e.TeamId);
                team.AuctionBudget = e.AuctionBudget;
                break;

            case AuctionTeamsFinalized:
                break; // nothing to snapshot

            case AuctionPlayerAdded e:
                _db.AuctionPlayers.Add(new AuctionPlayerDto
                {
                    AuctionId = e.AggregateId,
                    PlayerId = e.PlayerId,
                    PlayerName = e.PlayerName,
                    Status = "Queued"
                });
                break;

            case AuctionPlayerRemoved e:
                var removePlayer = await _db.AuctionPlayers.FirstAsync(t => t.AuctionId == e.AggregateId && t.PlayerId == e.PlayerId);
                _db.AuctionPlayers.Remove(removePlayer);
                break;

            case AuctionPlayersFinalized:
                break; // nothing to snapshot

            case PlayerLotOpened e:
                var lotAuction = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                lotAuction.CurrentPlayerId = e.PlayerId;
                lotAuction.Version = version;
                // We do not persist highest bid; kept in aggregate memory. Add table if needed later.
                var lotPlayer = await _db.AuctionPlayers.FirstAsync(p => p.AuctionId == e.AggregateId && p.PlayerId == e.PlayerId);
                lotPlayer.Status = "Active";
                break;

            case BidPlaced:
                // No snapshot change (aggregate-only bidding state)
                break;

            case PlayerSold e:
                var soldPlayer = await _db.AuctionPlayers.FirstAsync(p => p.AuctionId == e.AggregateId && p.PlayerId == e.PlayerId);
                soldPlayer.Status = "Sold";
                soldPlayer.WinningTeamId = e.WinningTeamId;
                soldPlayer.SalePrice = e.Amount;

                var winningTeam = await _db.AuctionTeams.FirstAsync(t => t.AuctionId == e.AggregateId && t.TeamId == e.WinningTeamId);
                winningTeam.Spent += e.Amount;

                var soldAuction = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                soldAuction.CurrentPlayerId = null;
                soldAuction.Version = version;
                break;

            case PlayerUnsold e:
                var unsoldPlayer = await _db.AuctionPlayers.FirstAsync(p => p.AuctionId == e.AggregateId && p.PlayerId == e.PlayerId);
                unsoldPlayer.Status = "Unsold";

                var unsoldAuction = await _db.Auctions.FirstAsync(a => a.AuctionId == e.AggregateId);
                unsoldAuction.CurrentPlayerId = null;
                unsoldAuction.Version = version;
                break;
        }
    }

    private IDomainEvent DeserializeEvent(string eventType, string payloadJson)
    {
        return eventType switch
        {
            nameof(AuctionCreated) => System.Text.Json.JsonSerializer.Deserialize<AuctionCreated>(payloadJson)!,
            nameof(AuctionBasicsUpdated) => System.Text.Json.JsonSerializer.Deserialize<AuctionBasicsUpdated>(payloadJson)!,
            nameof(AuctionScheduled) => System.Text.Json.JsonSerializer.Deserialize<AuctionScheduled>(payloadJson)!,
            nameof(AuctionLaunched) => System.Text.Json.JsonSerializer.Deserialize<AuctionLaunched>(payloadJson)!,
            nameof(AuctionPaused) => System.Text.Json.JsonSerializer.Deserialize<AuctionPaused>(payloadJson)!,
            nameof(AuctionResumed) => System.Text.Json.JsonSerializer.Deserialize<AuctionResumed>(payloadJson)!,
            nameof(AuctionCompleted) => System.Text.Json.JsonSerializer.Deserialize<AuctionCompleted>(payloadJson)!,
            nameof(AuctionTeamAdded) => System.Text.Json.JsonSerializer.Deserialize<AuctionTeamAdded>(payloadJson)!,
            nameof(AuctionTeamRemoved) => System.Text.Json.JsonSerializer.Deserialize<AuctionTeamRemoved>(payloadJson)!,
            nameof(AuctionTeamBudgetUpdated) => System.Text.Json.JsonSerializer.Deserialize<AuctionTeamBudgetUpdated>(payloadJson)!,
            nameof(AuctionTeamsFinalized) => System.Text.Json.JsonSerializer.Deserialize<AuctionTeamsFinalized>(payloadJson)!,
            nameof(AuctionPlayerAdded) => System.Text.Json.JsonSerializer.Deserialize<AuctionPlayerAdded>(payloadJson)!,
            nameof(AuctionPlayerRemoved) => System.Text.Json.JsonSerializer.Deserialize<AuctionPlayerRemoved>(payloadJson)!,
            nameof(AuctionPlayersFinalized) => System.Text.Json.JsonSerializer.Deserialize<AuctionPlayersFinalized>(payloadJson)!,
            nameof(AuctionDraftCanceled) => System.Text.Json.JsonSerializer.Deserialize<AuctionDraftCanceled>(payloadJson)!,
            nameof(PlayerLotOpened) => System.Text.Json.JsonSerializer.Deserialize<PlayerLotOpened>(payloadJson)!,
            nameof(BidPlaced) => System.Text.Json.JsonSerializer.Deserialize<BidPlaced>(payloadJson)!,
            nameof(PlayerSold) => System.Text.Json.JsonSerializer.Deserialize<PlayerSold>(payloadJson)!,
            nameof(PlayerUnsold) => System.Text.Json.JsonSerializer.Deserialize<PlayerUnsold>(payloadJson)!,
            _ => throw new InvalidOperationException($"Unknown event type {eventType}")
        };
    }
}
