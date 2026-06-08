import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { PlayerCardComponent } from '../player-card.component/player-card.component';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../shared/components/search.component/search.component';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { FooterActionBar } from '../../../shared/components/footer-action-bar/footer-action-bar';
import { PlayerService } from '../../service/player.service';
import { UiRefreshService } from '../../../shared/services/ui-refresh/ui-refresh.service';
import { Player } from '../../models/player.model';
import { LoaderComponent } from '../../../shared/components/loader.component/loader.component';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';
import { PlayerFilterPipe } from '../../pipes/player-filter.pipe';

@Component({
  selector: 'app-players-view.component',
  imports: [CommonModule, AppShellComponent, PlayerCardComponent, SearchComponent, LoaderComponent, TopNavComponent, ButtonComponent, IconComponent, PlayerFilterPipe],
  templateUrl: './players-view.component.html',
  styleUrl: './players-view.component.scss',
})
export class PlayersViewComponent implements OnInit {
  playersMock = [
    {
      id: 1,
      name: 'Marcus Stoinis',
      initial: 'M',
      role: 'All-Rounder',
      country: 'Australia',
      base: 120000,
      sold: 450000,
      increase: 78
    },
    {
      id: 2,
      name: 'Rashid Khan',
      initial: 'R',
      role: 'Bowler',
      country: 'Afghanistan',
      base: 200000,
      sold: null,
      increase: 0
    },
    {
      id: 3,
      name: 'Virat Kohli',
      initial: 'V',
      role: 'Batsman',
      country: 'India',
      base: 250000,
      sold: 600000,
      increase: 92
    },
    {
      id: 4,
      name: 'Jos Buttler',
      initial: 'J',
      role: 'Wicket-Keeper',
      country: 'England',
      base: 180000,
      sold: 420000,
      increase: 66
    },
    {
      id: 5,
      name: 'Kane Williamson',
      initial: 'K',
      role: 'Batsman',
      country: 'New Zealand',
      base: 220000,
      sold: 510000,
      increase: 72
    },
    {
      id: 6,
      name: 'Jasprit Bumrah',
      initial: 'J',
      role: 'Bowler',
      country: 'India',
      base: 210000,
      sold: 480000,
      increase: 85
    }
  ];
  players = signal<Player[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');


  constructor(
    private navigationService: NavigationService,
    private playerService: PlayerService,
    private uiRefreshService: UiRefreshService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPlayers();

    this.uiRefreshService.teamRefresh$.subscribe(() => {
      this.loadPlayers();
    });
  }

  private loadPlayers() {
    this.loading.set(false);
    this.error.set(null);
    this.playerService.getAll().then(data => {
      this.players.set(data);
      this.loading.set(false);
      this.cdr.detectChanges();
    }, err => {
      this.error.set('Failed to load players');
      this.loading.set(false);
      this.cdr.detectChanges();
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  navigateToCreatePlayer() {
    this.navigationService.navigateToPlayerCreate();
  }

}
