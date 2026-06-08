using System;

namespace EventForge.Hybrid.Commands.Auctions;

// Draft / setup
public sealed record CreateAuctionCommand(string AuctionId, string LeagueId, string Name, DateTimeOffset? ScheduledAt, long PerTeamBudget);
public sealed record UpdateAuctionBasicsCommand(string AuctionId, string Name, DateTimeOffset? ScheduledAt, long PerTeamBudget);
public sealed record AddAuctionTeamCommand(string AuctionId, string TeamId, string TeamName, decimal AuctionBudget);
public sealed record RemoveAuctionTeamCommand(string AuctionId, string TeamId);
public sealed record UpdateAuctionTeamBudgetCommand(string AuctionId, string TeamId, decimal AuctionBudget);
public sealed record FinalizeAuctionTeamsCommand(string AuctionId);
public sealed record AddAuctionPlayerCommand(string AuctionId, string PlayerId, string PlayerName);
public sealed record RemoveAuctionPlayerCommand(string AuctionId, string PlayerId);
public sealed record FinalizeAuctionPlayersCommand(string AuctionId);

// Lifecycle
public sealed record ScheduleAuctionCommand(string AuctionId, DateTimeOffset? ScheduledAt);
public sealed record LaunchAuctionCommand(string AuctionId);
public sealed record PauseAuctionCommand(string AuctionId);
public sealed record ResumeAuctionCommand(string AuctionId);
public sealed record CompleteAuctionCommand(string AuctionId);
public sealed record CancelAuctionDraftCommand(string AuctionId);

// Live lots / bidding
public sealed record OpenPlayerLotCommand(string AuctionId, string PlayerId);
public sealed record PlaceAuctionBidCommand(string AuctionId, string TeamId, decimal Amount);
public sealed record SellPlayerCommand(string AuctionId, string PlayerId, string WinningTeamId, decimal Amount);
public sealed record MarkPlayerUnsoldCommand(string AuctionId, string PlayerId);
