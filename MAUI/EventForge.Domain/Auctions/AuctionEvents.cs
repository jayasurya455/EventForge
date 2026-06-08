using EventForge.Domain.Common;

namespace EventForge.Domain.Auctions;

// Lifecycle
public sealed record AuctionCreated(
    Guid AggregateId,
    Guid LeagueId,
    string Name,
    DateTimeOffset? ScheduledAt,
    DateTimeOffset OccurredAt,
    long PerTeamBudget
) : IDomainEvent;

public sealed record AuctionBasicsUpdated(
    Guid AggregateId,
    string Name,
    DateTimeOffset? ScheduledAt,
    DateTimeOffset OccurredAt,
    long PerTeamBudget
) : IDomainEvent;

public sealed record AuctionScheduled(
    Guid AggregateId,
    DateTimeOffset? ScheduledAt,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionLaunched(
    Guid AggregateId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionPaused(
    Guid AggregateId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionResumed(
    Guid AggregateId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionCompleted(
    Guid AggregateId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionDraftCanceled(
    Guid AggregateId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

// Teams
public sealed record AuctionTeamAdded(
    Guid AggregateId,
    Guid TeamId,
    string TeamName,
    decimal AuctionBudget,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionTeamRemoved(
    Guid AggregateId,
    Guid TeamId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionTeamBudgetUpdated(
    Guid AggregateId,
    Guid TeamId,
    decimal AuctionBudget,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionTeamsFinalized(
    Guid AggregateId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

// Players
public sealed record AuctionPlayerAdded(
    Guid AggregateId,
    Guid PlayerId,
    string PlayerName,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionPlayerRemoved(
    Guid AggregateId,
    Guid PlayerId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record AuctionPlayersFinalized(
    Guid AggregateId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

// Lots / bidding
public sealed record PlayerLotOpened(
    Guid AggregateId,
    Guid PlayerId,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record BidPlaced(
    Guid AggregateId,
    Guid PlayerId,
    Guid TeamId,
    decimal Amount,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record PlayerSold(
    Guid AggregateId,
    Guid PlayerId,
    Guid WinningTeamId,
    decimal Amount,
    DateTimeOffset OccurredAt
) : IDomainEvent;

public sealed record PlayerUnsold(
    Guid AggregateId,
    Guid PlayerId,
    DateTimeOffset OccurredAt
) : IDomainEvent;
