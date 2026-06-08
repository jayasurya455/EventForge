using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;



namespace EventForge;

public static class NativeCommandRouter
{
    public static async Task<string> RouteAsync(
        string method,
        string? payloadJson)
    {
        return method switch
        {
            // --------Common ---------
            "system.pickImage" =>
                await HybridBridge.UploadFile(),

            // -------- LEAGUE --------
            "league.getAll" =>
                await HybridBridge.GetLeagues(),

            "league.create" =>
                await HybridBridge.CreateLeague(payloadJson!),

            "league.update" =>
                await HybridBridge.UpdateLeague(payloadJson!),

            "league.delete" =>
                await HybridBridge.DeleteLeague(payloadJson!),

            "league.getById" =>
                await HybridBridge.GetLeague(payloadJson!),

            // -------- TEAMS --------
            "team.getAll" =>
                await HybridBridge.GetTeams(),

            "team.create" =>
                await HybridBridge.CreateTeam(payloadJson!),

            "team.update" =>
                await HybridBridge.UpdateTeam(payloadJson!),

            "team.delete" =>
                await HybridBridge.DeleteTeam(payloadJson!),

            "team.getById" =>
                await HybridBridge.GetTeamById(payloadJson!),

            // -------- PLAYERS --------
            "player.getAll" =>
                await HybridBridge.GetAllPlayers(),

            "player.create" =>
                await HybridBridge.CreatePlayer(payloadJson!),

            "player.update" =>
                await HybridBridge.UpdatePlayer(payloadJson!),

            "player.delete" =>
                await HybridBridge.DeletePlayer(payloadJson!),

            "player.getById" =>
                await HybridBridge.GetPlayerById(payloadJson!),

            // -------- AUCTIONS --------
            "auction.create" =>
                await HybridBridge.CreateAuction(payloadJson!),
            "auction.updateBasics" =>
                await HybridBridge.UpdateAuctionBasics(payloadJson!),
            "auction.addTeam" =>
                await HybridBridge.AddAuctionTeam(payloadJson!),
            "auction.removeTeam" =>
                await HybridBridge.RemoveAuctionTeam(payloadJson!),
            "auction.updateTeamBudget" =>
                await HybridBridge.UpdateAuctionTeamBudget(payloadJson!),
            "auction.finalizeTeams" =>
                await HybridBridge.FinalizeAuctionTeams(payloadJson!),
            "auction.addPlayer" =>
                await HybridBridge.AddAuctionPlayer(payloadJson!),
            "auction.removePlayer" =>
                await HybridBridge.RemoveAuctionPlayer(payloadJson!),
            "auction.finalizePlayers" =>
                await HybridBridge.FinalizeAuctionPlayers(payloadJson!),
            "auction.schedule" =>
                await HybridBridge.ScheduleAuction(payloadJson!),
            "auction.launch" =>
                await HybridBridge.LaunchAuction(payloadJson!),
            "auction.pause" =>
                await HybridBridge.PauseAuction(payloadJson!),
            "auction.resume" =>
                await HybridBridge.ResumeAuction(payloadJson!),

            "auction.complete" =>
                await HybridBridge.CompleteAuction(payloadJson!),

            "auction.cancelDraft" =>
                await HybridBridge.CancelAuctionDraft(payloadJson!),

            "auction.openLot" =>
                await HybridBridge.OpenPlayerLot(payloadJson!),
            "auction.placeBid" =>
                await HybridBridge.PlaceAuctionBid(payloadJson!),
            "auction.sellPlayer" =>
                await HybridBridge.SellAuctionPlayer(payloadJson!),
            "auction.markUnsold" =>
                await HybridBridge.MarkAuctionPlayerUnsold(payloadJson!),
            "auction.listByLeague" =>
                await HybridBridge.GetAuctionsByLeague(payloadJson!),
            "auction.detail" =>
                await HybridBridge.GetAuctionDetail(payloadJson!),
            "auction.leagueStats" =>
                await HybridBridge.GetLeagueStats(payloadJson!),
            "auction.listPage" =>
                await HybridBridge.GetAuctionListPage(payloadJson!),

            _ => throw new NotSupportedException($"Unknown method: {method}")
        };
    }
}
