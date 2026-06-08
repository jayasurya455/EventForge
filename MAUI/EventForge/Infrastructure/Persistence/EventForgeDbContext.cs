using EventForge.Hybrid.DTOs;
using EventForge.Infrastructure.Projections.Leagues;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace EventForge.Infrastructure.Persistence;

public sealed class EventForgeDbContext : DbContext
{
    public EventForgeDbContext(DbContextOptions<EventForgeDbContext> options) : base(options) { }

    public DbSet<LeagueDto> Leagues => Set<LeagueDto>();
    public DbSet<TeamDto> Teams => Set<TeamDto>();
    public DbSet<PlayerDto> Players => Set<PlayerDto>();

    public DbSet<AuctionDto> Auctions => Set<AuctionDto>();
    public DbSet<AuctionTeamDto> AuctionTeams => Set<AuctionTeamDto>();
    public DbSet<AuctionPlayerDto> AuctionPlayers => Set<AuctionPlayerDto>();

    public DbSet<LeagueTeamReadModel> LeagueTeams => Set<LeagueTeamReadModel>();

    public DbSet<EventEntity> Events => Set<EventEntity>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<LeagueDto>()
            .HasKey(x => x.LeagueId);

        model.Entity<TeamDto>()
        .HasKey(x => x.TeamId);

        model.Entity<PlayerDto>()
        .HasKey(x => x.PlayerId);

        model.Entity<LeagueTeamReadModel>()
            .HasKey(x => new { x.LeagueId, x.TeamId });

        model.Entity<AuctionDto>()
            .HasKey(x => x.AuctionId);

        model.Entity<AuctionTeamDto>()
            .HasKey(x => new { x.AuctionId, x.TeamId });

        model.Entity<AuctionPlayerDto>()
            .HasKey(x => new { x.AuctionId, x.PlayerId });

        model.Entity<EventEntity>()
    .HasKey(e => new { e.AggregateId, e.EventNumber });
    }
}
