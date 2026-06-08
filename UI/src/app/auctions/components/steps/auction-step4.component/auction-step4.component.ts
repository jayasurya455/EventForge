import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { AuctionService } from '../../../services/auction.service';
import { Auction, AuctionPlayer, AuctionTeam } from '../../../models/auction.models';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { FooterActionBar } from '../../../../shared/components/footer-action-bar/footer-action-bar';
import { ReplaySubject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-auction-step4',
  imports: [IconComponent, ButtonComponent, FooterActionBar, DatePipe],
  templateUrl: './auction-step4.component.html',
  styleUrls: ['./auction-step4.component.scss']
})
export class AuctionStep4Component implements OnInit, OnDestroy {
  auctionStep: number = 3;
  auctionId?: string;
  activeAuction?: Auction;
  activeAuctionScheduledAt?: string;
  auctionTeams?: AuctionTeam[] = [];
  auctionPlayers?: AuctionPlayer[] = [];
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  leagueId: string = '';
  perTeamBudget: number = 0;
  auctionName: string = '';

  constructor(
    private auctionService: AuctionService,
    private navigation: NavigationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.auctionService.getActiveAuctionId().pipe(takeUntil(this.destroy$)).subscribe((auctionId) => {
      this.auctionId = auctionId;
      this.getDetails();
    });

    this.auctionService.getActiveLeague().pipe(takeUntil(this.destroy$)).subscribe((league) => {
      this.leagueId = league.id;
    });
  }

  getDetails() {
    if (this.auctionId) {
      this.auctionService.getDetail(this.auctionId).then((auction) => {
        this.activeAuctionScheduledAt = auction?.auction.ScheduledAt;
        this.auctionName = auction?.auction?.Name;
        this.perTeamBudget = auction?.auction?.PerTeamBudget;
        this.auctionTeams = auction?.teams;
        this.auctionPlayers = auction?.players;
        this.cdr.detectChanges();
      });
    }
  }

  save() {
    this.auctionService.schedule({ auctionId: this.auctionId!, scheduledAt: this.activeAuctionScheduledAt }).then(() => {
      this.auctionService.setAuctionStep(0);
      this.navigation.navigateToAuctionDetails(this.auctionId!, this.leagueId);
      this.cdr.detectChanges();
    });
  }

  cancel() {
    this.auctionService.setAuctionStep(0);
    this.navigation.navigateToAuctionDetails(this.auctionId!, this.leagueId);
  }

  prev() {
    this.auctionService.setAuctionStep(this.auctionStep - 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
