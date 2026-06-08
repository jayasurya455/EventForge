import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { TeamCardComponent } from '../team-card.component/team-card.component';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { IconComponent } from '../../../shared/components/icon/icon';
import { SearchComponent } from '../../../shared/components/search.component/search.component';
import { Team } from '../../models/team.model';
import { TeamService } from '../../services/team.service';
import { LoaderComponent } from '../../../shared/components/loader.component/loader.component';
import { UiRefreshService } from '../../../shared/services/ui-refresh/ui-refresh.service';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';
import { ButtonComponent } from '../../../shared/components/button/button';
import { League } from '../../../leagues/models/league.model';
import { LeagueService } from '../../../leagues/services/league.service';
import { TeamFilterPipe } from '../../pipes/team-filter.pipe';

@Component({
  selector: 'app-teams-view.component',
  imports: [AppShellComponent, TeamCardComponent, CommonModule, RouterModule, IconComponent, SearchComponent, LoaderComponent, TopNavComponent, ButtonComponent, TeamFilterPipe],
  templateUrl: './teams-view.component.html',
  styleUrl: './teams-view.component.scss',
})
export class TeamsViewComponent {
  teams = signal<Team[]>([]);
  leagues = signal<League[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedLeagueId = signal<string>('');
  searchTerm = signal<string>('');

  constructor(
    private navigationService: NavigationService,
    private teamService: TeamService,
    private leagueService: LeagueService,
    private uiRefreshService: UiRefreshService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadLeagues();
    this.loadTeams();

    this.uiRefreshService.teamRefresh$.subscribe(() => {
      this.loadTeams(this.selectedLeagueId());
    });
  }

  private loadLeagues() {
    this.leagueService.getAll().then(data => {
      this.leagues.set(data ?? []);
      this.cdr.detectChanges();
    });
  }

  private loadTeams(leagueId: string = '') {
    this.loading.set(true);
    this.error.set(null);
    const request = leagueId
      ? this.teamService.getTeamByLeague(leagueId)
      : this.teamService.getAll();

    request!.then(data => {
      this.teams.set(data ?? []);
      this.loading.set(false);
      this.cdr.detectChanges();
    }, () => {
      this.error.set('Failed to load teams');
      this.loading.set(false);
      this.cdr.detectChanges();
    });
  }

  onLeagueChange(event: Event) {
    const leagueId = (event.target as HTMLSelectElement).value;
    this.selectedLeagueId.set(leagueId);
    this.loadTeams(leagueId);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  navigateToCreateTeam() {
    this.navigationService.navigateToTeamCreate();
  }
}
