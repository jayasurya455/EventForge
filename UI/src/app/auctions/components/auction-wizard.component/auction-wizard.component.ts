import { Component, AfterViewInit, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuctionStep1Component } from '../steps/auction-step1.component/auction-step1.component';
import { AuctionStep2Component } from '../steps/auction-step2.component/auction-step2.component';
import { AuctionStep3Component } from '../steps/auction-step3.component/auction-step3.component';
import { AuctionStep4Component } from '../steps/auction-step4.component/auction-step4.component';
import { AuctionStepperComponent } from '../auction-stepper.component/auction-stepper.component';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';
import { AuctionService } from '../../services/auction.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { Auction, AuctionPlayer, AuctionTeam } from '../../models/auction.models';

@Component({
  selector: 'app-auction-wizard',
  imports: [
    AuctionStepperComponent,
    AuctionStep1Component,
    AuctionStep2Component,
    AuctionStep3Component,
    AuctionStep4Component,
    CommonModule,
    AppShellComponent,
    TopNavComponent
  ],
  templateUrl: './auction-wizard.component.html',
  styleUrls: ['./auction-wizard.component.scss']
})
export class AuctionWizardComponent implements OnInit, OnDestroy {

  currentStep = signal(0);
  private leagueId?: string;
  private auctionId?: string;

  steps = [
    { label: 'Details', icon: 'calendar-today' },
    { label: 'Teams', icon: 'groups' },
    { label: 'Players', icon: 'person' },
    { label: 'Review', icon: 'gavel' }
  ];

  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  activeAuction: Auction = {} as Auction;
  auctionTeams: AuctionTeam[] = [];
  auctionPlayers: AuctionPlayer[] = [];
  mode: 'Create' | 'Edit' = 'Create';

  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionService,
  ) { }

  ngOnInit(): void {
    this.auctionId = this.route.snapshot.queryParamMap.get('auctionId') ?? '';
    this.auctionService.setActiveAuctionId(this.auctionId);
    this.getAuctionDetails();
    this.leagueId = this.route.snapshot.queryParamMap.get('leagueId') ?? '';
    this.auctionService.setActiveLeagueId(this.leagueId);

    this.auctionService.getAuctionStep().pipe(takeUntil(this.destroy$)).subscribe((step) => {
      this.currentStep.set(step);
    });
  }

  private getAuctionDetails() {
    if (this.auctionId) {
      this.auctionService.getDetail(this.auctionId!).then((auction) => {
        this.mode = 'Edit';
        this.activeAuction = auction?.auction;
        this.auctionTeams = auction?.teams ?? [];
        this.auctionPlayers = auction?.players ?? [];
        this.auctionService.setAuctionWizardProps({ mode: this.mode, activeAuction: this.activeAuction, activeAuctionPlayers: this.auctionPlayers, activeAuctionTeams: this.auctionTeams });
      });
    } else {
      this.mode = 'Create';
      this.auctionService.setAuctionWizardProps({ mode: this.mode, activeAuction: null, activeAuctionPlayers: [], activeAuctionTeams: [] });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
