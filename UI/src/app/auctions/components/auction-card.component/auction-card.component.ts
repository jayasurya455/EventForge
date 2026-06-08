import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AuctionService } from '../../services/auction.service';
import { Auction } from '../../models/auction.models';
import { ReplaySubject, takeUntil } from 'rxjs';

export type AuctionStatus =
  | 'DRAFT'
  | 'LIVE'
  | 'PAUSED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | string;

@Component({
  standalone: true,
  selector: 'app-auction-card',
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent
  ],
  templateUrl: './auction-card.component.html'
})
export class AuctionCardComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private leagueId: string = '';

  @Input() auction: Auction = {} as Auction;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() status: AuctionStatus = 'SCHEDULED';
  @Input() auctionId = '';

  menuOpen: boolean = false;

  constructor(
    private navigationService: NavigationService,
    private auctionService: AuctionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.auctionService.getActiveLeagueId().pipe(takeUntil(this.destroy$)).subscribe(leagueId => {
      this.leagueId = leagueId;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  startAuction() {
    this.auctionService.launch(this.auctionId).then((result) => {
      if (result.Success) {
        this.auctionService.setActiveAuctionId(this.auctionId);
        this.navigationService.navigateToAuctionLive(this.auctionId);
        this.cdr.detectChanges();
      }
    });
  }

  resumeAuction() {
    this.auctionService.resume(this.auctionId).then((result) => {
      if (result.Success) {
        this.auctionService.setActiveAuctionId(this.auctionId);
        this.navigationService.navigateToAuctionLive(this.auctionId);
        this.cdr.detectChanges();
      }
    });
  }

  navigateToAuctionDetails() {
    this.navigationService.navigateToAuctionDetails();
  }

  viewResults() {
    this.navigationService.navigateToAuctionSquads(this.auctionId, this.leagueId);
  }

  completeSteps() {
    this.navigationService.navigateToAuctionEdit(this.auctionId, this.leagueId);
    this.auctionService.setAuctionStep(0);
  }

  editAuction() {
    this.navigationService.navigateToAuctionEdit(this.auctionId, this.leagueId);
    this.auctionService.setAuctionStep(0);
  }

  cancelAuction() {
    this.auctionService.cancelDraft(this.auctionId).then((result) => {
      if (result.Success) {
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
