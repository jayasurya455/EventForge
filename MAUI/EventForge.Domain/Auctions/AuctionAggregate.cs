using EventForge.Domain.Common;

namespace EventForge.Domain.Auctions;

public sealed class AuctionAggregate : AggregateRoot
{
    private AuctionState _status = AuctionState.Draft;
    private Guid _leagueId;
    private string _name = string.Empty;
    private DateTimeOffset? _scheduledAt;

    private bool _teamsFinalized;
    private bool _playersFinalized;

    private Guid? _currentPlayerId;
    private decimal _currentHighestBid;
    private Guid? _currentHighestBidder;
    private long _perTeamBudget;

    private readonly Dictionary<Guid, AuctionTeamState> _teams = new();
    private readonly Dictionary<Guid, AuctionPlayerState> _players = new();

    public static AuctionAggregate Create(CreateAuction command)
    {
        var aggregate = new AuctionAggregate();
        aggregate.Raise(new AuctionCreated(
            command.AuctionId,
            command.LeagueId,
            command.Name,
            command.ScheduledAt,
            DateTimeOffset.UtcNow,
            command.PerTeamBudget
        ));
        return aggregate;
    }

    // Draft / setup
    public void UpdateBasics(UpdateAuctionBasics command)
    {
        EnsureNotCompleted();
        if (_status != AuctionState.Draft && _status != AuctionState.Scheduled)
            throw new DomainException("Auction basics can only be updated in Draft or Scheduled state");

        Raise(new AuctionBasicsUpdated(Id, command.Name, command.ScheduledAt, DateTimeOffset.UtcNow, command.PerTeamBudget));
    }

    public void AddTeam(AddAuctionTeam command)
    {

        Raise(new AuctionTeamAdded(
            Id,
            command.TeamId,
            command.TeamName,
            command.AuctionBudget,
            DateTimeOffset.UtcNow
        ));
    }

    public void RemoveTeam(RemoveAuctionTeam command)
    {

        Raise(new AuctionTeamRemoved(
            Id,
            command.TeamId,
            DateTimeOffset.UtcNow
        ));
    }

    public void UpdateTeamBudget(UpdateAuctionTeamBudget command)
    {
        EnsureDraft();
        EnsureTeamsNotFinalized();
        if (!_teams.ContainsKey(command.TeamId))
            throw new DomainException("Team not part of this auction");
        if (command.AuctionBudget <= 0)
            throw new DomainException("Auction budget must be positive");

        Raise(new AuctionTeamBudgetUpdated(
            Id,
            command.TeamId,
            command.AuctionBudget,
            DateTimeOffset.UtcNow
        ));
    }

    public void FinalizeTeams(FinalizeAuctionTeams command)
    {
        if (_teamsFinalized) return;
        EnsureDraft();
        if (_teams.Count == 0)
            throw new DomainException("At least one team is required");

        Raise(new AuctionTeamsFinalized(Id, DateTimeOffset.UtcNow));
    }

    public void AddPlayer(AddAuctionPlayer command)
    {
        if (_players.ContainsKey(command.PlayerId))
            throw new DomainException("Player already added to auction");

        Raise(new AuctionPlayerAdded(
            Id,
            command.PlayerId,
            command.PlayerName,
            DateTimeOffset.UtcNow
        ));
    }

    public void RemovePlayer(RemoveAuctionPlayer command)
    {
        if (!_players.ContainsKey(command.PlayerId))
            throw new DomainException("Player is not added to auction");

        Raise(new AuctionPlayerRemoved(
            Id,
            command.PlayerId,
            DateTimeOffset.UtcNow
        ));
    }

    public void FinalizePlayers(FinalizeAuctionPlayers command)
    {
        if (_playersFinalized) return;
        EnsureDraft();
        if (_players.Count == 0)
            throw new DomainException("At least one player is required");

        Raise(new AuctionPlayersFinalized(Id, DateTimeOffset.UtcNow));
    }

    // Lifecycle
    public void Schedule(ScheduleAuction command)
    {
        EnsureNotCompleted();
        if (_status != AuctionState.Draft)
            throw new DomainException("Can only schedule from Draft");
        EnsureSetupFinalized();

        Raise(new AuctionScheduled(Id, command.ScheduledAt, DateTimeOffset.UtcNow));
    }

    public void Launch(LaunchAuction command)
    {
        EnsureNotCompleted();
        EnsureSetupFinalized();

        Raise(new AuctionLaunched(Id, DateTimeOffset.UtcNow));
    }

    public void Pause(PauseAuction command)
    {
        if (_status != AuctionState.Live)
            throw new DomainException("Can only pause a live auction");

        Raise(new AuctionPaused(Id, DateTimeOffset.UtcNow));
    }

    public void Resume(ResumeAuction command)
    {
        if (_status != AuctionState.Paused)
            throw new DomainException("Can only resume a paused auction");

        Raise(new AuctionResumed(Id, DateTimeOffset.UtcNow));
    }

    public void Complete(CompleteAuction command)
    {
        if (_status != AuctionState.Live && _status != AuctionState.Paused)
            throw new DomainException("Only live or paused auctions can be completed");
        if (_currentPlayerId is not null)
            throw new DomainException("Cannot complete while a lot is active");

        Raise(new AuctionCompleted(Id, DateTimeOffset.UtcNow));
    }

    public void CancelDraft(CancelAuctionDraft command)
    {
        if (_status == AuctionState.Completed)
            throw new DomainException("Completed auctions cannot be canceled");

        Raise(new AuctionDraftCanceled(Id, DateTimeOffset.UtcNow));
    }

    // Live lots / bidding
    public void OpenLot(OpenPlayerLot command)
    {
        EnsureLiveOrPaused();
        EnsureSetupFinalized();
        if (_currentPlayerId is not null)
            throw new DomainException("Another player is already active");
        if (!_players.TryGetValue(command.PlayerId, out var player))
            throw new DomainException("Player not part of auction");
        if (player.Status != PlayerAuctionStatus.Queued)
            throw new DomainException("Player already processed or active");

        Raise(new PlayerLotOpened(Id, command.PlayerId, DateTimeOffset.UtcNow));
    }

    public void PlaceBid(PlaceBid command)
    {
        EnsureLiveOrPaused();
        if (_currentPlayerId is null)
            throw new DomainException("No active lot");
        if (!_teams.TryGetValue(command.TeamId, out var team))
            throw new DomainException("Team not participating in this auction");

        var remaining = team.AuctionBudget - team.Spent;
        if (command.Amount <= _currentHighestBid)
            throw new DomainException("Bid must be higher than current highest");
        if (command.Amount > remaining)
            throw new DomainException("Bid exceeds remaining budget");

        Raise(new BidPlaced(Id, _currentPlayerId.Value, command.TeamId, command.Amount, DateTimeOffset.UtcNow));
    }

    public void SellPlayer(SellPlayer command)
    {
        EnsureLiveOrPaused();
        if (_currentPlayerId is null)
            throw new DomainException("No active lot");
        if (command.PlayerId != _currentPlayerId)
            throw new DomainException("Player mismatch for active lot");
        if (_currentHighestBidder is null)
            throw new DomainException("Cannot sell without a bid");
        if (_currentHighestBidder != command.WinningTeamId)
            throw new DomainException("Winning team must match highest bidder");
        if (command.Amount != _currentHighestBid)
            throw new DomainException("Winning amount must match highest bid");

        Raise(new PlayerSold(
            Id,
            command.PlayerId,
            command.WinningTeamId,
            command.Amount,
            DateTimeOffset.UtcNow
        ));
    }

    public void MarkUnsold(MarkPlayerUnsold command)
    {
        EnsureLiveOrPaused();
        if (_currentPlayerId is null)
            throw new DomainException("No active lot");
        if (command.PlayerId != _currentPlayerId)
            throw new DomainException("Player mismatch for active lot");

        Raise(new PlayerUnsold(Id, command.PlayerId, DateTimeOffset.UtcNow));
    }

    // Event application
    protected override void Apply(IDomainEvent @event)
    {
        switch (@event)
        {
            case AuctionCreated e:
                Id = e.AggregateId;
                _leagueId = e.LeagueId;
                _name = e.Name;
                _scheduledAt = e.ScheduledAt;
                _status = AuctionState.Draft;
                _perTeamBudget = e.PerTeamBudget;
                break;

            case AuctionBasicsUpdated e:
                _name = e.Name;
                _scheduledAt = e.ScheduledAt;
                _status = AuctionState.Draft;
                _perTeamBudget = e.PerTeamBudget;
                break;

            case AuctionScheduled e:
                _scheduledAt = e.ScheduledAt;
                _status = AuctionState.Scheduled;
                break;

            case AuctionLaunched:
                _status = AuctionState.Live;
                break;

            case AuctionPaused:
                _status = AuctionState.Paused;
                break;

            case AuctionResumed:
                _status = AuctionState.Live;
                break;

            case AuctionCompleted:
                _status = AuctionState.Completed;
                break;

            case AuctionDraftCanceled:
                _status = AuctionState.Canceled;
                break;

            case AuctionTeamAdded e:
                _teams[e.TeamId] = new AuctionTeamState(e.TeamId, e.TeamName, e.AuctionBudget, 0m);
                break;

            case AuctionTeamBudgetUpdated e:
                if (_teams.TryGetValue(e.TeamId, out var teamBudget))
                {
                    _teams[e.TeamId] = teamBudget with { AuctionBudget = e.AuctionBudget };
                }
                break;

            case AuctionTeamsFinalized:
                _teamsFinalized = true;
                break;

            case AuctionPlayerAdded e:
                _players[e.PlayerId] = new AuctionPlayerState(e.PlayerId, e.PlayerName, PlayerAuctionStatus.Queued, null, null);
                break;

            case AuctionPlayersFinalized:
                _playersFinalized = true;
                break;

            case PlayerLotOpened e:
                _currentPlayerId = e.PlayerId;
                _currentHighestBid = 0m;
                _currentHighestBidder = null;
                if (_players.TryGetValue(e.PlayerId, out var lotPlayer))
                    _players[e.PlayerId] = lotPlayer with { Status = PlayerAuctionStatus.Active };
                break;

            case BidPlaced e:
                _currentHighestBid = e.Amount;
                _currentHighestBidder = e.TeamId;
                break;

            case PlayerSold e:
                if (_players.TryGetValue(e.PlayerId, out var soldPlayer))
                    _players[e.PlayerId] = soldPlayer with
                    {
                        Status = PlayerAuctionStatus.Sold,
                        WinningTeamId = e.WinningTeamId,
                        SalePrice = e.Amount
                    };

                if (_teams.TryGetValue(e.WinningTeamId, out var winningTeam))
                    _teams[e.WinningTeamId] = winningTeam with { Spent = winningTeam.Spent + e.Amount };

                _currentPlayerId = null;
                _currentHighestBid = 0m;
                _currentHighestBidder = null;
                break;

            case PlayerUnsold e:
                if (_players.TryGetValue(e.PlayerId, out var unsoldPlayer))
                    _players[e.PlayerId] = unsoldPlayer with { Status = PlayerAuctionStatus.Unsold };

                _currentPlayerId = null;
                _currentHighestBid = 0m;
                _currentHighestBidder = null;
                break;
        }
    }

    // Helpers
    private void EnsureDraft()
    {
        if (_status != AuctionState.Draft)
            throw new DomainException("Operation allowed only in Draft");
    }

    private void EnsureNotCompleted()
    {
        if (_status == AuctionState.Completed)
            throw new DomainException("Auction is completed");
    }

    private void EnsureTeamsNotFinalized()
    {
        if (_teamsFinalized)
            throw new DomainException("Teams are finalized");
    }

    private void EnsurePlayersNotFinalized()
    {
        if (_playersFinalized)
            throw new DomainException("Players are finalized");
    }

    private void EnsureSetupFinalized()
    {
        if (!_teamsFinalized || !_playersFinalized)
            throw new DomainException("Teams and players must be finalized");
    }

    private void EnsureLiveOrPaused()
    {
        if (_status != AuctionState.Live && _status != AuctionState.Paused)
            throw new DomainException("Auction must be live or paused");
    }

    private record AuctionTeamState(Guid TeamId, string TeamName, decimal AuctionBudget, decimal Spent);

    private record AuctionPlayerState(
        Guid PlayerId,
        string PlayerName,
        PlayerAuctionStatus Status,
        Guid? WinningTeamId,
        decimal? SalePrice
    );

    private enum PlayerAuctionStatus
    {
        Queued = 0,
        Active = 1,
        Sold = 2,
        Unsold = 3
    }
}
