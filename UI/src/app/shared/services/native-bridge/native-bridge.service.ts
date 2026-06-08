import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NativeBridgeService {

  invoke<T = any>(method: string, payload?: any): Promise<T> {
    return (window as any).EventForge.invoke(method, payload);
  }

  //license
  getLicenseStatus(): Promise<any> {
    return this.invoke('license.status');
  }

  activateLicense(key: string): Promise<any> {
    return this.invoke('license.activate', { key });
  }

  deactivateLicense(): Promise<any> {
    return this.invoke('license.deactivate');
  }

  //Leagues
  createLeague(payload: any): Promise<any> {
    return this.invoke('league.create', payload);
  }

  updateLeague(payload: any): Promise<any> {
    return this.invoke('league.update', payload);
  }

  deleteLeague(payload: any): Promise<boolean> {
    return this.invoke('league.delete', payload);
  }

  getAllLeagues(): Promise<any[]> {
    return this.invoke('league.getAll');
  }

  getLeagueById(payload: any): Promise<any | null> {
    return this.invoke('league.getById', payload);
  }

  //teams
  createTeam(payload: any): Promise<any> {
    return this.invoke('team.create', payload);
  }

  updateTeam(payload: any): Promise<any> {
    return this.invoke('team.update', payload);
  }

  deleteteam(payload: any): Promise<boolean> {
    return this.invoke('team.delete', payload);
  }

  getAllTeams(): Promise<any[]> {
    return this.invoke('team.getAll');
  }

  getTeamById(payload: any): Promise<any | null> {
    return this.invoke('team.getById', payload);
  }

  getTeamByLeague(payload: any): Promise<any | null> {
    return this.invoke('team.getByLeague', payload);
  }

  //players
  createPlayer(payload: any): Promise<any> {
    return this.invoke('player.create', payload);
  }

  updatePlayer(payload: any): Promise<any> {
    return this.invoke('player.update', payload);
  }

  deletePlayer(payload: any): Promise<boolean> {
    return this.invoke('player.delete', payload);
  }

  getAllPlayers(): Promise<any[]> {
    return this.invoke('player.getAll');
  }

  getPlayerById(payload: any): Promise<any | null> {
    return this.invoke('player.getById', payload);
  }

  // auctions
  createAuction(payload: any): Promise<any> {
    return this.invoke('auction.create', payload);
  }

  updateAuctionBasics(payload: any): Promise<any> {
    return this.invoke('auction.updateBasics', payload);
  }

  addAuctionTeam(payload: any): Promise<any> {
    return this.invoke('auction.addTeam', payload);
  }

  removeAuctionTeam(payload: any): Promise<any> {
    return this.invoke('auction.removeTeam', payload);
  }

  updateAuctionTeamBudget(payload: any): Promise<any> {
    return this.invoke('auction.updateTeamBudget', payload);
  }

  finalizeAuctionTeams(payload: any): Promise<any> {
    return this.invoke('auction.finalizeTeams', payload);
  }

  addAuctionPlayer(payload: any): Promise<any> {
    return this.invoke('auction.addPlayer', payload);
  }

  removeAuctionPlayer(payload: any): Promise<any> {
    return this.invoke('auction.removePlayer', payload);
  }

  finalizeAuctionPlayers(payload: any): Promise<any> {
    return this.invoke('auction.finalizePlayers', payload);
  }

  scheduleAuction(payload: any): Promise<any> {
    return this.invoke('auction.schedule', payload);
  }

  launchAuction(payload: any): Promise<any> {
    return this.invoke('auction.launch', payload);
  }

  pauseAuction(payload: any) {
    return this.invoke('auction.pause', payload);
  }

  resumeAuction(payload: any) {
    return this.invoke('auction.resume', payload);
  }

  completeAuction(payload: any) {
    return this.invoke('auction.complete', payload);
  }

  cancelAuctionDraft(payload: any) {
    return this.invoke('auction.cancelDraft', payload);
  }

  openPlayerLot(payload: any): Promise<any> {
    return this.invoke('auction.openLot', payload);
  }

  placeAuctionBid(payload: any): Promise<any> {
    return this.invoke('auction.placeBid', payload);
  }

  sellAuctionPlayer(payload: any): Promise<any> {
    return this.invoke('auction.sellPlayer', payload);
  }

  markAuctionPlayerUnsold(payload: any): Promise<any> {
    return this.invoke('auction.markUnsold', payload);
  }

  getAuctionsByLeague(payload: any): Promise<any[]> {
    return this.invoke('auction.listByLeague', payload);
  }

  getAuctionListPage(payload: any): Promise<any> {
    return this.invoke('auction.listPage', payload);
  }

  getAuctionDetail(payload: any): Promise<any> {
    return this.invoke('auction.detail', payload);
  }

  getLeagueStats(payload: any): Promise<any> {
    return this.invoke('auction.leagueStats', payload);
  }

  pickImage(): Promise<any> {
    return this.invoke('system.pickImage');
  }
}
