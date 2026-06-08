import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NativeBridgeService } from '../native-bridge/native-bridge.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  constructor(private nativeBridgeService: NativeBridgeService, private router: Router) { }

  pickImage(): Promise<any> {
    return this.nativeBridgeService.pickImage();
  }

  /**
   * Generic navigation helper that can be reused by components.
   * Accepts the same arguments as Router.navigate.
   */
  navigate(commands: any[], extras?: Parameters<Router['navigate']>[1]) {
    return this.router.navigate(commands, extras);
  }

  navigateToLeagues() {
    return this.navigate(['/leagues']);
  }

  navigateToLeagueCreate() {
    return this.navigate(['/leagues/create']);
  }

  navigateToLeagueEdit(id: string) {
    return this.navigate(['/leagues', id, 'edit']);
  }

  navigateToTeamsView() {
    return this.navigate(['/teams/view']);
  }

  navigateToTeamCreate() {
    return this.navigate(['/teams/create']);
  }

  navigateToTeamEdit(id: string) {
    return this.navigate(['/teams', id, 'edit']);
  }

  navigateToPlayersView() {
    return this.navigate(['/players/view']);
  }

  navigateToPlayerCreate() {
    return this.navigate(['/players/create']);
  }

  navigateToPlayerEdit(id: string) {
    return this.navigate(['/players', id, 'edit']);
  }

  navigateToAuctionsList(leagueId?: string) {
    return this.navigate(['/auctions'], { queryParams: { leagueId } });
  }

  navigateToAuctionEdit(auctionId?: string, leagueId?: string) {
    return this.navigate(['/auctions-steps'], { queryParams: { auctionId, leagueId } });
  }

  navigateToAuctionCreate(leagueId?: string) {
    return this.navigate(['/auctions-steps'], { queryParams: { leagueId } });
  }

  navigateToAuctionResume(auctionId?: string, leagueId?: string) {
    return this.navigate(['/auctions-resume'], { queryParams: { auctionId, leagueId } });
  }

  navigateToAuctionDetails(auctionId?: string, leagueId?: string) {
    return this.navigate(['/auctions-details'], { queryParams: { auctionId, leagueId } });
  }

  navigateToAuctionLive(auctionId?: string, leagueId?: string) {
    return this.navigate(['/auctions-live'], { queryParams: { auctionId, leagueId } });
  }

  navigateToAuctionSquads(auctionId?: string, leagueId?: string) {
    return this.navigate(['/auction-squads'], { queryParams: { auctionId, leagueId } });
  }
}