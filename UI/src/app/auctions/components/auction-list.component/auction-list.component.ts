import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionCardComponent } from '../auction-card.component/auction-card.component';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';
import { AuctionService } from '../../services/auction.service';
import { Auction, LeagueStats } from '../../models/auction.models';
import { League } from '../../../leagues/models/league.model';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auction-list',
  imports: [TopNavComponent, CommonModule, AuctionCardComponent, AppShellComponent, IconComponent, ButtonComponent, StatCardComponent],
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.scss']
})
export class AuctionListComponent implements OnInit, OnDestroy {
  private destroy$ = new ReplaySubject<boolean>(1);

  readonly activeTab = signal<'AUCTIONS' | 'SQUADS'>('AUCTIONS');
  readonly auctions = signal<Auction[]>([]);
  readonly league = signal<League | null>(null);
  readonly leagueStats = signal<LeagueStats | null>(null);
  readonly statsLoading = signal(true);

  readonly leagueName = computed(() => this.league()?.name || 'All');
  readonly hasStats = computed(() => !this.statsLoading() && this.leagueStats() !== null);

  private leagueId = '';

  constructor(
    private navigationService: NavigationService,
    private auctionService: AuctionService,
  ) { }

  ngOnInit(): void {
    this.auctionService.getActiveLeague().pipe(takeUntil(this.destroy$)).subscribe(activeLeague => {
      this.league.set(activeLeague);
      this.leagueId = activeLeague?.id ?? '';
      this.loadAuctions();
    });
  }

  setTab(tab: 'AUCTIONS' | 'SQUADS') {
    this.activeTab.set(tab);
  }

  async loadAuctions(): Promise<void> {
    if (!this.leagueId) return;
    const leagueId = this.leagueId;
    this.statsLoading.set(true);
    try {
      const page = await this.auctionService.getListPage(leagueId);
      if (leagueId !== this.leagueId) return;
      this.auctions.set(page.auctions ?? []);
      this.league.set(page.league);
      this.leagueStats.set(page.stats);
      this.statsLoading.set(false);
    } catch (err) {
      console.error("loadAuctions failed", err);
      this.statsLoading.set(false);
    }
  }

  createAuction() {
    this.navigationService.navigateToAuctionCreate(this.leagueId);
  }

  viewDetails(auction: Auction) {
    this.navigationService.navigateToAuctionDetails(auction.AuctionId, this.leagueId);
  }

  goLive(auction: Auction) {
    this.navigationService.navigateToAuctionLive(auction.AuctionId, this.leagueId);
  }

  viewSquads(auction: Auction) {
    if ((auction.Status || '').toUpperCase() !== 'COMPLETED') return;
    this.navigationService.navigateToAuctionSquads(auction.AuctionId, this.leagueId);
  }

  backToLeagues() {
    this.navigationService.navigateToLeagues();
  }

  formatMoney(amount: number | null | undefined): string {
    if (!amount) return '₹0';
    if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
    return `₹${amount}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
