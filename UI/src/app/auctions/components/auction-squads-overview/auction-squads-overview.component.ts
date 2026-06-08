import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';
import { AuctionService } from '../../services/auction.service';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { AuctionTeam, AuctionPlayer } from '../../models/auction.models';

interface SquadPlayer {
  playerId: string;
  name: string;
  soldPrice: number;
}

interface SquadCard {
  teamId: string;
  name: string;
  rank: number;
  playersCount: number;
  spent: number;
  remaining: number;
  budget: number;
  utilization: number;
  color: string;
  accent: string;
  players: SquadPlayer[];
  collapsed: boolean;
}

const SQUAD_PALETTE = [
  { color: '#10b981', accent: 'linear-gradient(135deg,#0ea5e9,#22c55e)' },
  { color: '#6366f1', accent: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { color: '#ef4444', accent: 'linear-gradient(135deg,#ef4444,#f97316)' },
  { color: '#f59e0b', accent: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { color: '#ec4899', accent: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  { color: '#14b8a6', accent: 'linear-gradient(135deg,#14b8a6,#06b6d4)' },
  { color: '#a855f7', accent: 'linear-gradient(135deg,#a855f7,#7c3aed)' },
  { color: '#0ea5e9', accent: 'linear-gradient(135deg,#0ea5e9,#3b82f6)' },
];

@Component({
  selector: 'app-squads-overview',
  standalone: true,
  imports: [CommonModule, IconComponent, AppShellComponent, TopNavComponent],
  templateUrl: './auction-squads-overview.component.html',
  styleUrls: ['./auction-squads-overview.component.scss'],
})
export class AuctionSquadsOverviewComponent implements OnInit {
  auctionId = '';
  leagueId = '';
  auctionName = '';
  isLoading = true;
  isAllCollapsed = false;
  squads: SquadCard[] = [];

  get totalSold(): number {
    return this.squads.reduce((sum, s) => sum + s.playersCount, 0);
  }

  get totalSpent(): number {
    return this.squads.reduce((sum, s) => sum + s.spent, 0);
  }

  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.queryParamMap.get('auctionId') ?? '';
    this.leagueId = this.route.snapshot.queryParamMap.get('leagueId') ?? '';
    this.loadSquads();
  }

  async loadSquads(): Promise<void> {
    if (!this.auctionId) {
      this.isLoading = false;
      return;
    }

    const detail = await this.auctionService.getDetail(this.auctionId);
    if (!detail) {
      this.isLoading = false;
      return;
    }

    this.auctionName = detail.auction?.Name ?? 'Auction';
    this.squads = this.buildSquads(detail.teams, detail.players);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private buildSquads(teams: AuctionTeam[], players: AuctionPlayer[]): SquadCard[] {
    const soldPlayers = players.filter(p => p.Status === 'Sold' && p.WinningTeamId);

    const cards: SquadCard[] = teams.map((team, index) => {
      const teamPlayers = soldPlayers.filter(p => p.WinningTeamId === team.TeamId);
      const spent = team.Spent ?? teamPlayers.reduce((sum, p) => sum + (p.SalePrice ?? 0), 0);
      const budget = team.AuctionBudget ?? 0;
      const remaining = Math.max(0, budget - spent);
      const utilization = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      const palette = SQUAD_PALETTE[index % SQUAD_PALETTE.length];

      return {
        teamId: team.TeamId,
        name: team.TeamName,
        rank: index + 1,
        playersCount: teamPlayers.length,
        spent,
        remaining,
        budget,
        utilization,
        color: palette.color,
        accent: palette.accent,
        players: teamPlayers.map(p => ({
          playerId: p.PlayerId,
          name: p.PlayerName,
          soldPrice: p.SalePrice ?? 0,
        })),
        collapsed: false,
      };
    });

    // Sort by spent descending (most spent = rank 1)
    cards.sort((a, b) => b.spent - a.spent);
    cards.forEach((c, i) => (c.rank = i + 1));

    return cards;
  }

  toggleCollapse(squad: SquadCard): void {
    squad.collapsed = !squad.collapsed;
  }

  expandCollapseAll(): void {
    const next = !this.isAllCollapsed;
    this.squads.forEach(s => (s.collapsed = next));
    this.isAllCollapsed = next;
  }

  goBack(): void {
    this.navigationService.navigateToAuctionsList(this.leagueId);
  }

  formatMoney(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
  }
}
