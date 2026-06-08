namespace EventForge.Domain.Auctions;

// Draft / setup
public sealed record CreateAuction(
    Guid AuctionId,
    Guid LeagueId,
    string Name,
    DateTimeOffset? ScheduledAt,
    long PerTeamBudget
);

public sealed record UpdateAuctionBasics(
    Guid AuctionId,
    string Name,
    DateTimeOffset? ScheduledAt,
    long PerTeamBudget
);

public sealed record AddAuctionTeam(
    Guid AuctionId,
    Guid TeamId,
    string TeamName,
    decimal AuctionBudget
);
public sealed record RemoveAuctionTeam(
    Guid AuctionId,
    Guid TeamId
);


public sealed record UpdateAuctionTeamBudget(
    Guid AuctionId,
    Guid TeamId,
    decimal AuctionBudget
);

public sealed record FinalizeAuctionTeams(
    Guid AuctionId
);

public sealed record AddAuctionPlayer(
    Guid AuctionId,
    Guid PlayerId,
    string PlayerName
);

public sealed record RemoveAuctionPlayer(
    Guid AuctionId,
    Guid PlayerId
);

public sealed record FinalizeAuctionPlayers(
    Guid AuctionId
);

// Lifecycle
public sealed record ScheduleAuction(
    Guid AuctionId,
    DateTimeOffset? ScheduledAt
);

public sealed record LaunchAuction(
    Guid AuctionId
);

public sealed record PauseAuction(
    Guid AuctionId
);

public sealed record ResumeAuction(
    Guid AuctionId
);

public sealed record CompleteAuction(
    Guid AuctionId
);

public sealed record CancelAuctionDraft(
    Guid AuctionId
);

// Live lots / bidding
public sealed record OpenPlayerLot(
    Guid AuctionId,
    Guid PlayerId
);

public sealed record PlaceBid(
    Guid AuctionId,
    Guid TeamId,
    decimal Amount
);

public sealed record SellPlayer(
    Guid AuctionId,
    Guid PlayerId,
    Guid WinningTeamId,
    decimal Amount
);

public sealed record MarkPlayerUnsold(
    Guid AuctionId,
    Guid PlayerId
);
