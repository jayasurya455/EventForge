namespace EventForge.Domain.Auctions;

public enum AuctionState
{
    Draft = 0,
    Scheduled = 1,
    Live = 2,
    Paused = 3,
    Completed = 4,
    Canceled = 5
}
