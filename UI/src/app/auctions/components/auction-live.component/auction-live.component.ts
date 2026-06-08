import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { AuctionService } from '../../services/auction.service';
import { ReplaySubject } from 'rxjs';
import { Auction, AuctionPlayer, AuctionTeam } from '../../models/auction.models';

@Component({
  selector: 'app-auction-live',
  standalone: true,
  imports: [CommonModule, AppShellComponent, TopNavComponent, IconComponent, ButtonComponent],
  templateUrl: './auction-live.component.html',
  styleUrls: ['./auction-live.component.scss'],
})
export class AuctionLiveComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  activeAuction: Auction | null = null;
  auctionId: string = '';
  leagueId: string = '';
  auctionTeams: AuctionTeam[] = [];
  auctionPlayers: AuctionPlayer[] = [];

  // Bidding state (lives in component only — aggregate memory, not persisted to snapshot)
  currentBid: number = 0;
  currentLeadingTeamId: string | null = null;
  selectedTeamId: string | null = null;

  // Last processed player — shown in center after sell/unsold until next lot opens
  lastProcessedPlayer: AuctionPlayer | null = null;
  lastProcessedStatus: 'Sold' | 'Unsold' | null = null;
  lastProcessedTeamName: string | null = null;
  lastProcessedAmount: number = 0;
  avatarError: boolean = false;

  // UI state
  isProcessing: boolean = false;
  errorMessage: string = '';

  // Timer
  countdownSeconds = 45;
  remainingSeconds = this.countdownSeconds;
  private timerId?: ReturnType<typeof setInterval>;

  readonly quickBidIncrements = [500, 1000, 5000, 10000];

  private readonly teamColors = ['#8c52ff', '#e14b6a', '#4c9aff', '#5ad8a0', '#d84c85', '#f59e0b', '#06b6d4'];

  constructor(
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private auctionService: AuctionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.queryParamMap.get('auctionId') ?? '';
    this.leagueId = this.route.snapshot.queryParamMap.get('leagueId') ?? '';
    if (this.auctionId) {
      this.auctionService.setActiveAuctionId(this.auctionId);
    }
    this.loadAuctionData();
  }

  // ─── Data loading ───────────────────────────────────────────────────────────

  async loadAuctionData(): Promise<void> {
    if (!this.auctionId) return;
    const detail = await this.auctionService.getDetail(this.auctionId);
    if (!detail) return;
    this.activeAuction = detail.auction;
    this.auctionTeams = detail.teams ?? [];
    this.auctionPlayers = detail.players ?? [];
    this.cdr.detectChanges();
  }

  // ─── Computed properties ────────────────────────────────────────────────────

  get currentPlayer(): AuctionPlayer | null {
    if (!this.activeAuction?.CurrentPlayerId) return null;
    return this.auctionPlayers.find(p => p.PlayerId === this.activeAuction!.CurrentPlayerId) ?? null;
  }

  get queuedPlayers(): AuctionPlayer[] {
    return this.auctionPlayers.filter(p => p.Status === 'Queued');
  }

  get processedCount(): number {
    return this.auctionPlayers.filter(p => p.Status === 'Sold' || p.Status === 'Unsold').length;
  }

  get processedPlayers(): AuctionPlayer[] {
    return this.auctionPlayers.filter(p => p.Status === 'Sold' || p.Status === 'Unsold');
  }

  getWinningTeamName(player: AuctionPlayer): string {
    if (!player.WinningTeamId) return '';
    return this.auctionTeams.find(t => t.TeamId === player.WinningTeamId)?.TeamName ?? '';
  }

  get currentLeadingTeam(): AuctionTeam | null {
    if (!this.currentLeadingTeamId) return null;
    return this.auctionTeams.find(t => t.TeamId === this.currentLeadingTeamId) ?? null;
  }

  get selectedTeam(): AuctionTeam | null {
    if (!this.selectedTeamId) return null;
    return this.auctionTeams.find(t => t.TeamId === this.selectedTeamId) ?? null;
  }

  get canSell(): boolean {
    return !!this.currentPlayer && !!this.currentLeadingTeamId && this.currentBid > 0 && !this.isProcessing;
  }

  get canMarkUnsold(): boolean {
    return !!this.currentPlayer && !this.isProcessing;
  }

  get canPlaceBid(): boolean {
    return !!this.currentPlayer && !!this.selectedTeamId && !this.isProcessing;
  }

  get isPaused(): boolean {
    return this.activeAuction?.Status?.toUpperCase() === 'PAUSED';
  }

  get playerProgress(): string {
    const total = this.auctionPlayers.length;
    return total ? `${this.processedCount} of ${total}` : '—';
  }

  getBudgetRemaining(team: AuctionTeam): number {
    return (team.AuctionBudget ?? 0) - (team.Spent ?? 0);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getTeamColor(index: number): string {
    return this.teamColors[index % this.teamColors.length];
  }

  onAvatarError(): void {
    this.avatarError = true;
    this.cdr.detectChanges();
  }

  isLeadingTeam(team: AuctionTeam): boolean {
    return team.TeamId === this.currentLeadingTeamId;
  }

  isSelectedTeam(team: AuctionTeam): boolean {
    return team.TeamId === this.selectedTeamId;
  }

  // ─── Actions ────────────────────────────────────────────────────────────────

  async openLot(player: AuctionPlayer): Promise<void> {
    if (!this.auctionId || this.isProcessing || this.currentPlayer) return;
    await this.runAction(async () => {
      const result = await this.auctionService.openLot({ auctionId: this.auctionId, playerId: player.PlayerId });
      if (result.Success) {
        this.currentBid = 0;
        this.currentLeadingTeamId = null;
        this.selectedTeamId = null;
        this.lastProcessedPlayer = null;
        this.lastProcessedStatus = null;
        this.avatarError = false;
        await this.loadAuctionData();
        this.startTimer();
      } else {
        this.errorMessage = result.Message ?? 'Failed to open lot';
      }
    });
  }

  selectTeam(team: AuctionTeam): void {
    if (!this.currentPlayer) return;
    this.selectedTeamId = this.selectedTeamId === team.TeamId ? null : team.TeamId;
    this.cdr.detectChanges();
  }

  async placeBid(increment: number): Promise<void> {
    if (!this.canPlaceBid) return;
    const newBid = this.currentBid + increment;
    await this.runAction(async () => {
      const result = await this.auctionService.placeBid({
        auctionId: this.auctionId,
        teamId: this.selectedTeamId!,
        amount: newBid,
      });
      if (result.Success) {
        this.currentBid = newBid;
        this.currentLeadingTeamId = this.selectedTeamId;
        this.startTimer();
      } else {
        this.errorMessage = result.Message ?? 'Bid failed';
      }
    });
  }

  async sellCurrentPlayer(): Promise<void> {
    if (!this.canSell) return;
    const snapshot = this.currentPlayer!;
    const teamName = this.currentLeadingTeam?.TeamName ?? null;
    const amount = this.currentBid;
    await this.runAction(async () => {
      const result = await this.auctionService.sellPlayer({
        auctionId: this.auctionId,
        playerId: snapshot.PlayerId,
        winningTeamId: this.currentLeadingTeamId!,
        amount,
      });
      if (result.Success) {
        this.clearTimer();
        this.lastProcessedPlayer = snapshot;
        this.lastProcessedStatus = 'Sold';
        this.lastProcessedTeamName = teamName;
        this.lastProcessedAmount = amount;
        this.currentBid = 0;
        this.currentLeadingTeamId = null;
        this.selectedTeamId = null;
        this.avatarError = false;
        await this.loadAuctionData();
      } else {
        this.errorMessage = result.Message ?? 'Failed to sell player';
      }
    });
  }

  async markUnsold(): Promise<void> {
    if (!this.canMarkUnsold) return;
    const snapshot = this.currentPlayer!;
    await this.runAction(async () => {
      const result = await this.auctionService.markUnsold({
        auctionId: this.auctionId,
        playerId: snapshot.PlayerId,
      });
      if (result.Success) {
        this.clearTimer();
        this.lastProcessedPlayer = snapshot;
        this.lastProcessedStatus = 'Unsold';
        this.lastProcessedTeamName = null;
        this.lastProcessedAmount = 0;
        this.currentBid = 0;
        this.currentLeadingTeamId = null;
        this.selectedTeamId = null;
        this.avatarError = false;
        await this.loadAuctionData();
      } else {
        this.errorMessage = result.Message ?? 'Failed to mark unsold';
      }
    });
  }

  async pausePlayAuction(): Promise<void> {
    if (!this.activeAuction || this.isProcessing) return;
    await this.runAction(async () => {
      let result;
      if (this.isPaused) {
        result = await this.auctionService.resume(this.auctionId);
        if (result.Success) this.activeAuction!.Status = 'Live';
      } else {
        result = await this.auctionService.pause(this.auctionId);
        if (result.Success) this.activeAuction!.Status = 'Paused';
      }
      if (!result.Success) {
        this.errorMessage = result.Message ?? 'Failed to pause/resume auction';
      }
    });
  }

  async endAuction(): Promise<void> {
    if (this.isProcessing) return;
    await this.runAction(async () => {
      const result = await this.auctionService.complete(this.auctionId);
      if (result.Success) {
        this.clearTimer();
        this.navigationService.navigateToAuctionDetails(this.auctionId, this.leagueId);
      } else {
        this.errorMessage = result.Message ?? 'Failed to end auction';
      }
    });
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  // ─── Timer ──────────────────────────────────────────────────────────────────

  startTimer(): void {
    this.clearTimer();
    this.remainingSeconds = this.countdownSeconds;
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds -= 1;
        this.cdr.detectChanges();
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  get timerDisplay(): string {
    const mins = Math.floor(this.remainingSeconds / 60).toString().padStart(2, '0');
    const secs = (this.remainingSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  get timerPercent(): number {
    return (this.remainingSeconds / this.countdownSeconds) * 100;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async runAction(fn: () => Promise<void>): Promise<void> {
    this.isProcessing = true;
    this.errorMessage = '';
    try {
      await fn();
    } finally {
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
