import { Component, ChangeDetectorRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeagueService } from '../../services/league.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { ActionCardComponent } from '../../../shared/components/action-card/action-card';
import { LeagueCardComponent } from '../league-card.component/league-card.component';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { Router } from '@angular/router';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { League } from '../../models/league.model';
import { LoaderComponent } from '../../../shared/components/loader.component/loader.component';
import { UiRefreshService } from '../../../shared/services/ui-refresh/ui-refresh.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';
import { AuctionService } from '../../../auctions/services/auction.service';
import { LeagueStats } from '../../../auctions/models/auction.models';

@Component({
  selector: 'league-list',
  imports: [CommonModule, TopNavComponent, AppShellComponent, LeagueCardComponent, ActionCardComponent, StatCardComponent, LoaderComponent, IconComponent, ButtonComponent],
  templateUrl: './league-list.component.html'
})
export class LeagueListComponent implements OnInit {

  leagues = signal<League[] | []>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedLeague = signal<League | null>(null);
  leagueStats = signal<LeagueStats | null>(null);
  statsLoading = signal(false);

  constructor(
    private leagueService: LeagueService,
    private navigationService: NavigationService,
    private uiRefreshService: UiRefreshService,
    private auctionService: AuctionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadLeagues();

    this.uiRefreshService.leagueRefresh$.subscribe(() => {
      this.loadLeagues();
    });
  }

  loadLeagues() {
    this.loading.set(false);
    this.error.set(null);
    this.leagueService.getAll().then(data => {
      this.leagues.set(data);
      this.loading.set(false);
      this.cdr.detectChanges();
    }, err => {
      this.error.set('Failed to load leagues');
      this.loading.set(false);
      this.cdr.detectChanges();
    });
  }

  createLeague() {
    this.router.navigate(['/leagues/create']);
  }

  getMaxPlayers(league: League): number {
    return league.maxTeams && league.maxPlayersPerTeam ? league.maxTeams * league.maxPlayersPerTeam : 0;
  }

  selectLeague(league: League) {
    this.selectedLeague.set(league);
    this.loadLeagueStats(league.id);
  }

  async loadLeagueStats(leagueId: string) {
    this.statsLoading.set(true);
    this.leagueStats.set(null);
    this.cdr.detectChanges();
    try {
      const stats = await this.auctionService.getLeagueStats(leagueId);
      this.leagueStats.set(stats);
    } catch {
      this.leagueStats.set(null);
    }
    this.statsLoading.set(false);
    this.cdr.detectChanges();
  }

  viewPlayers() {
    this.navigationService.navigateToPlayersView();
  }

  viewTeams() {
    this.navigationService.navigateToTeamsView();
  }

  formatMoney(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
  }
}
