using System;

namespace EventForge.Hybrid.Commands.Auctions;

public sealed record AuctionsByLeagueQuery(Guid LeagueId);
public sealed record AuctionDetailQuery(Guid AuctionId);
public sealed record LeagueStatsQuery(Guid LeagueId);
public sealed record AuctionListPageQuery(Guid LeagueId);
