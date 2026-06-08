import { Injectable } from '@angular/core';
import { NativeBridgeService } from '../../shared/services/native-bridge/native-bridge.service';
import { Auction, AuctionListPage, AuctionPlayer, AuctionTeam, AuctionWizardProps, LeagueStats } from '../models/auction.models';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommandResult } from '../../shared/models/command-result.model';
import { League } from '../../leagues/models/league.model';

@Injectable({ providedIn: 'root' })
export class AuctionService {
  private auctionWizardProps = new BehaviorSubject<AuctionWizardProps>({ mode: 'Create', activeAuction: null, activeAuctionPlayers: [], activeAuctionTeams: [] })

  public getAuctionWizardProps(): Observable<AuctionWizardProps> {
    return this.auctionWizardProps.asObservable();
  }

  public setAuctionWizardProps(prop: AuctionWizardProps) {
    this.auctionWizardProps.next(prop)
  }

  private activeAuctionId = new BehaviorSubject<string>('');

  public getActiveAuctionId(): Observable<string> {
    return this.activeAuctionId.asObservable();
  }

  public setActiveAuctionId(id: string) {
    this.activeAuctionId.next(id);
  }

  private activeLeagueId = new BehaviorSubject<string>('');

  public getActiveLeagueId(): Observable<string> {
    return this.activeLeagueId.asObservable();
  }

  public setActiveLeagueId(id: string) {
    this.activeLeagueId.next(id);
  }

  private auctionStep = new BehaviorSubject<number>(0);

  public getAuctionStep(): Observable<number> {
    return this.auctionStep.asObservable();
  }

  public setAuctionStep(step: number) {
    this.auctionStep.next(step);
  }

  private activeLeague = new BehaviorSubject<League>({} as League);

  public getActiveLeague(): Observable<League> {
    return this.activeLeague.asObservable();
  }

  public setActiveLeague(league: League) {
    this.activeLeague.next(league);
  }

  constructor(private readonly bridge: NativeBridgeService) { }

  createAuction(payload: { auctionId: string; leagueId: string; name: string; scheduledAt?: string | null; perTeamBudget?: number }): Promise<CommandResult> {
    return this.bridge.createAuction({ AuctionId: payload.auctionId, LeagueId: payload.leagueId, Name: payload.name, ScheduledAt: payload.scheduledAt, PerTeamBudget: payload.perTeamBudget });
  }

  updateBasics(payload: { auctionId: string; name: string; scheduledAt?: string | null; perTeamBudget?: number }): Promise<CommandResult> {
    return this.bridge.updateAuctionBasics({ AuctionId: payload.auctionId, Name: payload.name, ScheduledAt: payload.scheduledAt, PerTeamBudget: payload.perTeamBudget });
  }

  addTeam(payload: { auctionId: string; teamId: string; teamName: string; auctionBudget: number }): Promise<CommandResult> {
    return this.bridge.addAuctionTeam({ AuctionId: payload.auctionId, TeamId: payload.teamId, TeamName: payload.teamName, AuctionBudget: payload.auctionBudget });
  }

  removeTeam(payload: { auctionId: string; teamId: string;}): Promise<CommandResult> {
    return this.bridge.removeAuctionTeam({ AuctionId: payload.auctionId, TeamId: payload.teamId});
  }

  updateTeamBudget(payload: { auctionId: string; teamId: string; auctionBudget: number }): Promise<CommandResult> {
    return this.bridge.updateAuctionTeamBudget(payload);
  }

  finalizeTeams(auctionId: string): Promise<CommandResult> {
    return this.bridge.finalizeAuctionTeams({ AuctionId: auctionId });
  }

  addPlayer(payload: { auctionId: string; playerId: string; playerName: string }): Promise<CommandResult> {
    return this.bridge.addAuctionPlayer({ AuctionId: payload.auctionId, PlayerId: payload.playerId, PlayerName: payload.playerName });
  }

  removePlayer(payload: { auctionId: string; playerId: string }): Promise<CommandResult> {
    return this.bridge.removeAuctionPlayer({ AuctionId: payload.auctionId, PlayerId: payload.playerId});
  }

  finalizePlayers(auctionId: string): Promise<CommandResult> {
    return this.bridge.finalizeAuctionPlayers({ AuctionId: auctionId });
  }

  schedule(payload: { auctionId: string; scheduledAt?: string }): Promise<CommandResult> {
    return this.bridge.scheduleAuction({ AuctionId: payload.auctionId, ScheduledAt: payload.scheduledAt });
  }

  launch(auctionId: string): Promise<CommandResult> {
    return this.bridge.launchAuction({ AuctionId: auctionId });
  }

  pause(auctionId: string): Promise<CommandResult> {
    return this.bridge.pauseAuction({ AuctionId: auctionId });
  }

  resume(auctionId: string): Promise<CommandResult> {
    return this.bridge.resumeAuction({ AuctionId: auctionId });
  }

  complete(auctionId: string): Promise<CommandResult> {
    return this.bridge.completeAuction({ AuctionId: auctionId });
  }

  cancelDraft(auctionId: string): Promise<CommandResult> {
    return this.bridge.cancelAuctionDraft({ AuctionId: auctionId });
  }

  openLot(payload: { auctionId: string; playerId: string }): Promise<CommandResult> {
    return this.bridge.openPlayerLot({ AuctionId: payload.auctionId, PlayerId: payload.playerId });
  }

  placeBid(payload: { auctionId: string; teamId: string; amount: number }): Promise<CommandResult> {
    return this.bridge.placeAuctionBid({ AuctionId: payload.auctionId, TeamId: payload.teamId, Amount: payload.amount });
  }

  sellPlayer(payload: { auctionId: string; playerId: string; winningTeamId: string; amount: number }): Promise<CommandResult> {
    return this.bridge.sellAuctionPlayer({ AuctionId: payload.auctionId, PlayerId: payload.playerId, WinningTeamId: payload.winningTeamId, Amount: payload.amount });
  }

  markUnsold(payload: { auctionId: string; playerId: string }): Promise<CommandResult> {
    return this.bridge.markAuctionPlayerUnsold({ AuctionId: payload.auctionId, PlayerId: payload.playerId });
  }

  listByLeague(leagueId: string): Promise<Auction[]> {
    return this.bridge.getAuctionsByLeague({ LeagueId: leagueId });
  }

  getListPage(leagueId: string): Promise<AuctionListPage> {
    return this.bridge.getAuctionListPage({ LeagueId: leagueId });
  }

  getDetail(auctionId: string): Promise<{ auction: any; teams: AuctionTeam[]; players: AuctionPlayer[] } | null> {
    return this.bridge.getAuctionDetail({ AuctionId: auctionId });
  }

  getLeagueStats(leagueId: string): Promise<LeagueStats> {
    return this.bridge.getLeagueStats({ LeagueId: leagueId });
  }
}
