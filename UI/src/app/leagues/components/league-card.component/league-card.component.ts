import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { League } from '../../models/league.model';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component/confirm-dialog.component';
import { LeagueService } from '../../services/league.service';
import { UiRefreshService } from '../../../shared/services/ui-refresh/ui-refresh.service';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { AuctionService } from '../../../auctions/services/auction.service';

@Component({
  selector: 'league-card',
  imports: [CommonModule, ButtonComponent, IconComponent, StatCardComponent, ConfirmDialogComponent],
  templateUrl: './league-card.component.html'
})
export class LeagueCardComponent {
  @Input() title: string = '';
  @Input() subtitle?: string = '';
  @Input() teams?: number = 0;
  @Input() players?: number = 0;
  @Input() leagueDetails?: League;
  @Input() isSelected: boolean = false;
  @Input() status: 'LIVE' | 'SCHEDULED' = 'LIVE';
  showDeleteConfirm: boolean = false;
  menuOpen: boolean = false;

  constructor(
    public router: Router,
    private leagueService: LeagueService,
    private uiRefreshService: UiRefreshService,
    private auctionService: AuctionService,
    private navigationService: NavigationService
  ) { }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  confirmDelete() {
    if (this.leagueDetails) {
      this.leagueService.delete(this.leagueDetails.id).then((success) => {
        if (success) {
          console.log('League deleted successfully.');
        }
      });
      this.showDeleteConfirm = false;
      this.uiRefreshService.notifyLeagueRefresh();
    }
  }

  startAuction() {
    this.auctionService.setActiveLeague(this.leagueDetails ?? {} as League);
    this.navigationService.navigateToAuctionCreate(this.leagueDetails?.id);
  }

  viewAuctions() {
    this.auctionService.setActiveLeague(this.leagueDetails ?? {} as League);
    this.navigationService.navigateToAuctionsList(this.leagueDetails?.id);
  }

}