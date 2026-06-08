using EventForge.Domain.Leagues;
using EventForge.Hybrid.Commands;
using EventForge.Hybrid.Commands.Leagues;
using EventForge.Hybrid.Commands.Players;
using EventForge.Hybrid.Commands.Teams;
using EventForge.Hybrid.Commands.Auctions;
using EventForge.Hybrid.Handlers.Leagues;
using EventForge.Hybrid.Handlers.Players;
using EventForge.Hybrid.Handlers.Teams;
using EventForge.Hybrid.Handlers.Auctions;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Licensing;
using Microsoft.JSInterop;
using System.Text.Json;

namespace EventForge;

public static class HybridBridge
{
    private static IServiceProvider? _services;

    public static void Initialize(IServiceProvider services)
    {
        _services = services;
    }

    private static T Resolve<T>() where T : notnull
    {

        return _services.GetRequiredService<T>();
    }

    [JSInvokable]
    public static async Task<string> UploadFile()
    {
        var result = await Resolve<HybridFilePicker>().PickImageAsync();
        var imageBase = await Resolve<ImageBase64Resolver>().Resolve(result, false);
        var obj = new
        {
            path = result,
            image = imageBase
        };
        return JsonSerializer.Serialize(obj);
    }

    #region License

    [JSInvokable]
    public static string GetLicenseStatus()
    {
        var snapshot = Resolve<LicenseService>().GetSnapshot();
        return JsonSerializer.Serialize(snapshot);
    }

    [JSInvokable]
    public static string ActivateLicense(string payload)
    {
        var command = JsonSerializer.Deserialize<ActivateLicenseCommand>(payload)!;
        var snapshot = Resolve<LicenseService>().Activate(command.Key);
        return JsonSerializer.Serialize(snapshot);
    }

    [JSInvokable]
    public static string DeactivateLicense()
    {
        var snapshot = Resolve<LicenseService>().Deactivate();
        return JsonSerializer.Serialize(snapshot);
    }

    private sealed record ActivateLicenseCommand(string? Key);

    #endregion

    #region Leagues

    [JSInvokable]
    public static async Task<string> CreateLeague(string payload)
    {
        var command = JsonSerializer.Deserialize<CreateLeagueCommand>(payload)!;
        var result = await Resolve<CreateLeagueCommandHandler>().HandleAsync(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> UpdateLeague(string payload)
    {
        var command = JsonSerializer.Deserialize<UpdateLeagueCommand>(payload)!;
        var result = await Resolve<UpdateLeagueCommandHandler>().HandleAsync(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> DeleteLeague(string payload)
    {
        var command = JsonSerializer.Deserialize<DeleteLeagueCommand>(payload)!;
        var result = await Resolve<DeleteLeagueCommandHandler>().HandleAsync(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> GetLeagues()
    {
        var leagues = await Resolve<GetLeagueHandler>().GetAllAsync();
        return JsonSerializer.Serialize(leagues);
    }

    [JSInvokable]
    public static async Task<string> GetLeague(string payload)
    {
        var command = JsonSerializer.Deserialize<LeagueByIdCommand>(payload)!;
        var leagues = await Resolve<GetLeagueHandler>().GetIdAsync(command.LeagueId);
        return JsonSerializer.Serialize(leagues);
    }
    #endregion

    #region Teams
    [JSInvokable]
    public static async Task<string> CreateTeam(string payload)
    {
        var command = JsonSerializer.Deserialize<TeamCommand>(payload)!;
        var result = await Resolve<TeamCommandHandler>().CreateTeam(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> UpdateTeam(string payload)
    {
        var command = JsonSerializer.Deserialize<TeamCommand>(payload)!;
        var result = await Resolve<TeamCommandHandler>().UpdateTeam(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> DeleteTeam(string payload)
    {
        var command = JsonSerializer.Deserialize<DeleteTeamCommand>(payload)!;
        var result = await Resolve<TeamCommandHandler>().DeleteTeam(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> GetTeams()
    {
        var leagues = await Resolve<TeamCommandHandler>().GetAllTeams();
        return JsonSerializer.Serialize(leagues);
    }

    [JSInvokable]
    public static async Task<string> GetTeamById(string payload)
    {
        var command = JsonSerializer.Deserialize<GetTeamByIdQuery>(payload)!;
        var leagues = await Resolve<TeamCommandHandler>().GetTeamById(command);
        return JsonSerializer.Serialize(leagues);
    }
    #endregion

    #region Players
    [JSInvokable]
    public static async Task<string> CreatePlayer(string payload)
    {
        var command = JsonSerializer.Deserialize<PlayerCommand>(payload)!;
        var result = await Resolve<PlayerCommandHandler>().CreatePlayer(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> UpdatePlayer(string payload)
    {
        var command = JsonSerializer.Deserialize<PlayerCommand>(payload)!;
        var result = await Resolve<PlayerCommandHandler>().UpdatePlayer(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> DeletePlayer(string payload)
    {
        var command = JsonSerializer.Deserialize<DeletePlayerCommand>(payload)!;
        var result = await Resolve<PlayerCommandHandler>().DeletePlayer(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> GetPlayerById(string payload)
    {
        var command = JsonSerializer.Deserialize<GetPlayerByIdQuery>(payload)!;
        var players = await Resolve<PlayerCommandHandler>().GetPlayerById(command);
        return JsonSerializer.Serialize(players);
    }

    [JSInvokable]
    public static async Task<string> GetAllPlayers()
    {
        var players = await Resolve<PlayerCommandHandler>().GetAllPlayers();
        return JsonSerializer.Serialize(players);
    }
    #endregion

    #region Auctions
    [JSInvokable]
    public static async Task<string> CreateAuction(string payload)
    {
        var command = JsonSerializer.Deserialize<CreateAuctionCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().CreateAuction(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> UpdateAuctionBasics(string payload)
    {
        var command = JsonSerializer.Deserialize<UpdateAuctionBasicsCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().UpdateBasics(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> AddAuctionTeam(string payload)
    {
        var command = JsonSerializer.Deserialize<AddAuctionTeamCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().AddTeam(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> RemoveAuctionTeam(string payload)
    {
        var command = JsonSerializer.Deserialize<RemoveAuctionTeamCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().RemoveTeam(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> UpdateAuctionTeamBudget(string payload)
    {
        var command = JsonSerializer.Deserialize<UpdateAuctionTeamBudgetCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().UpdateTeamBudget(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> FinalizeAuctionTeams(string payload)
    {
        var command = JsonSerializer.Deserialize<FinalizeAuctionTeamsCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().FinalizeTeams(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> AddAuctionPlayer(string payload)
    {
        var command = JsonSerializer.Deserialize<AddAuctionPlayerCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().AddPlayer(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> RemoveAuctionPlayer(string payload)
    {
        var command = JsonSerializer.Deserialize<RemoveAuctionPlayerCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().RemovePlayer(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> FinalizeAuctionPlayers(string payload)
    {
        var command = JsonSerializer.Deserialize<FinalizeAuctionPlayersCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().FinalizePlayers(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> ScheduleAuction(string payload)
    {
        var command = JsonSerializer.Deserialize<ScheduleAuctionCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().Schedule(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> LaunchAuction(string payload)
    {
        var command = JsonSerializer.Deserialize<LaunchAuctionCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().Launch(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> PauseAuction(string payload)
    {
        var command = JsonSerializer.Deserialize<PauseAuctionCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().Pause(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> ResumeAuction(string payload)
    {
        var command = JsonSerializer.Deserialize<ResumeAuctionCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().Resume(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> CompleteAuction(string payload)
    {
        var command = JsonSerializer.Deserialize<CompleteAuctionCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().Complete(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> CancelAuctionDraft(string payload)
    {
        var command = JsonSerializer.Deserialize<CancelAuctionDraftCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().CancelDraft(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> OpenPlayerLot(string payload)
    {
        var command = JsonSerializer.Deserialize<OpenPlayerLotCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().OpenLot(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> PlaceAuctionBid(string payload)
    {
        var command = JsonSerializer.Deserialize<PlaceAuctionBidCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().PlaceBid(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> SellAuctionPlayer(string payload)
    {
        var command = JsonSerializer.Deserialize<SellPlayerCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().SellPlayer(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> MarkAuctionPlayerUnsold(string payload)
    {
        var command = JsonSerializer.Deserialize<MarkPlayerUnsoldCommand>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().MarkUnsold(command);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> GetAuctionsByLeague(string payload)
    {
        var query = JsonSerializer.Deserialize<AuctionsByLeagueQuery>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().GetAuctionsByLeague(query.LeagueId);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> GetAuctionDetail(string payload)
    {
        var query = JsonSerializer.Deserialize<AuctionDetailQuery>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().GetAuctionDetail(query.AuctionId);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> GetLeagueStats(string payload)
    {
        var query = JsonSerializer.Deserialize<LeagueStatsQuery>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().GetLeagueStats(query.LeagueId);
        return JsonSerializer.Serialize(result);
    }

    [JSInvokable]
    public static async Task<string> GetAuctionListPage(string payload)
    {
        var query = JsonSerializer.Deserialize<AuctionListPageQuery>(payload)!;
        var result = await Resolve<AuctionCommandHandler>().GetAuctionListPage(query.LeagueId);
        return JsonSerializer.Serialize(result);
    }
    #endregion
}
