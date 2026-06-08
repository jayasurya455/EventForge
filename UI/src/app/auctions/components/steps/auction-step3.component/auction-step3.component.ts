import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { PlayerCardComponent } from '../../../../players/components/player-card.component/player-card.component';
import { Player } from '../../../../players/models/player.model';
import { CommonService } from '../../../../shared/services/common/common.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { AuctionService } from '../../../services/auction.service';
import { PlayerService } from '../../../../players/service/player.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { FooterActionBar } from '../../../../shared/components/footer-action-bar/footer-action-bar';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { AuctionPlayer } from '../../../models/auction.models';

@Component({
  selector: 'app-auction-step3',
  imports: [CommonModule, PlayerCardComponent, ButtonComponent, FooterActionBar, IconComponent],
  templateUrl: './auction-step3.component.html',
  styleUrls: ['./auction-step3.component.scss']
})
export class AuctionStep3Component implements OnInit, OnDestroy {
  auctionStep = 2;
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  players = signal<Player[] | []>([]);
  selectedPlayers: Player[] = [];
  mode: string = 'Create';
  auctionId: string = '';

  constructor(
    private commonService: CommonService,
    private playerService: PlayerService,
    private auctionService: AuctionService,
    private navigation: NavigationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.commonService.getSelectedPlayers$.pipe(takeUntil(this.destroy$)).subscribe((players) => {
      this.selectedPlayers = players;
    });

    this.auctionService.getAuctionWizardProps().pipe(takeUntil(this.destroy$)).subscribe((props) => {
      this.mode = props?.mode ?? 'Create';
    });

    this.auctionService.getActiveAuctionId().pipe(takeUntil(this.destroy$)).subscribe((auctionId) => {
      this.auctionId = auctionId;
      this.loadPlayers();
    });
  }

  private loadPlayers() {
    Promise.all([
      this.playerService.getAll(),
      this.auctionId ? this.auctionService.getDetail(this.auctionId) : Promise.resolve(null)
    ]).then(([players, detail]) => {
      this.players.set(players);
      const selectedIds = new Set((detail?.players ?? []).map((p: AuctionPlayer) => p.PlayerId));
      this.selectedPlayers = players.filter(p => selectedIds.has(p.id));
      this.commonService.UpdateSelectedPlayers(this.selectedPlayers);
      this.cdr.detectChanges();
    });
  }

  get allSelected(): boolean {
    return this.players().length > 0 && this.selectedPlayers.length === this.players().length;
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedPlayers.forEach(async p => {
        await this.auctionService.removePlayer({ auctionId: this.auctionId!, playerId: p.id });
      });
      this.commonService.UpdateSelectedPlayers([]);
    } else {
      const playersToAdd = this.players().filter(p => !this.selectedPlayers.some(s => s.id === p.id));
      playersToAdd.forEach(async p => {
        await this.auctionService.addPlayer({ auctionId: this.auctionId!, playerId: p.id, playerName: p.name });
      });
      this.commonService.UpdateSelectedPlayers([...this.players()]);
    }
  }

  isSelected(player: Player) {
    return this.selectedPlayers.some(p => p.id === player.id);
  }

  prev() {
    this.auctionService.setAuctionStep(this.auctionStep - 1);
  }

  async next() {
    await this.auctionService.finalizePlayers(this.auctionId!);
    this.auctionService.setAuctionStep(this.auctionStep + 1);
  }

  cancel() {
    this.navigation.navigateToAuctionDetails(this.auctionId!);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
