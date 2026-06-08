import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { RouterModule } from '@angular/router';
import { Player } from '../../models/player.model';
import { UiRefreshService } from '../../../shared/services/ui-refresh/ui-refresh.service';
import { PlayerService } from '../../service/player.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../shared/services/common/common.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { AuctionService } from '../../../auctions/services/auction.service';
import { Auction } from '../../../auctions/models/auction.models';

@Component({
  selector: 'app-player-card',
  imports: [IconComponent, ButtonComponent, RouterModule, ConfirmDialogComponent, CommonModule],
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
})
export class PlayerCardComponent implements OnInit, OnDestroy {
  @Input() player!: Player;
  @Input() readOnly: boolean = false;
  @Input() selectable: boolean = false;
  @Input() auctionId: string = '';
  public isSelectedPlayer: boolean = false;
  showDeleteConfirm: boolean = false;
  selectedPlayers: Player[] = [];

  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    private playerService: PlayerService,
    private uiRefreshService: UiRefreshService,
    private auctionService: AuctionService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.commonService.getSelectedPlayers$.pipe(takeUntil(this.destroy$)).subscribe((selectedPlayers) => {
      this.selectedPlayers = selectedPlayers;
      this.isSelectedPlayer = selectedPlayers.some(p => p.id === this.player.id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  confirmDelete() {
    if (this.player) {
      this.playerService.delete(this.player.id).then((success) => {
        this.uiRefreshService.notifyPlayerRefresh();
        console.log('Player deleted successfully.', success);
      });
      this.showDeleteConfirm = false;
      this.uiRefreshService.notifyPlayerRefresh();
    }
  }

  onSelectionChange() {
    this.isSelectedPlayer = !this.isSelectedPlayer;

    if (this.isSelectedPlayer) {
      this.selectedPlayers.push(this.player);
      if (this.auctionId) {
        this.auctionService.addPlayer({ auctionId: this.auctionId, playerId: this.player.id!, playerName: this.player.name });
      }
    } else {
      this.selectedPlayers = this.selectedPlayers.filter(p => p.id !== this.player.id);
      if (this.auctionId) {
        this.auctionService.removePlayer({ auctionId: this.auctionId, playerId: this.player.id! });
      }
    }

    this.commonService.UpdateSelectedPlayers(this.selectedPlayers);
  }
}

