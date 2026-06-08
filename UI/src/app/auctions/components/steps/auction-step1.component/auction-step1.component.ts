import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker';
import { AuctionService } from '../../../services/auction.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { FooterActionBar } from '../../../../shared/components/footer-action-bar/footer-action-bar';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auction-step1',
  imports: [CommonModule, FormsModule, DatePickerComponent, IconComponent, ButtonComponent, FooterActionBar],
  templateUrl: './auction-step1.component.html',
  styleUrls: ['./auction-step1.component.scss']
})
export class AuctionStep1Component implements OnInit, OnDestroy {
  auctionStep: number = 0;
  auctionName: string = '';
  auctionDate: string = '';
  auctionBudget: number = 0;
  mode: string = 'create';
  leagueId: string = '';
  auctionId: string = '';
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    private auctionService: AuctionService,
    private navigation: NavigationService,
    private cdr: ChangeDetectorRef
  ) {
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.auctionService.setAuctionStep(this.auctionStep);
    this.auctionService.getActiveLeagueId().pipe(takeUntil(this.destroy$)).subscribe((leagueId) => {
      this.leagueId = leagueId;
    });

    this.auctionService.getActiveAuctionId().pipe(takeUntil(this.destroy$)).subscribe((auctionId) => {
      this.auctionId = auctionId;
    });

    this.auctionService.getAuctionWizardProps().pipe(takeUntil(this.destroy$)).subscribe((props) => {
      this.mode = props.mode;
      if (this.mode == 'Edit') {
        this.auctionName = props.activeAuction?.Name ?? '';
        this.auctionDate = props.activeAuction?.ScheduledAt ?? '';
        this.auctionBudget = props.activeAuction?.PerTeamBudget ?? 0;
        this.cdr.detectChanges();
      }
    })
  }

  async nextStep() {
    if (this.auctionId === '') {
      let result = await this.auctionService.createAuction({ auctionId: this.auctionId, leagueId: this.leagueId, name: this.auctionName, scheduledAt: this.auctionDate, perTeamBudget: this.auctionBudget });
      if (result.Success) {
        this.auctionService.setActiveAuctionId(result.Data.auctionId);
        this.auctionId = result.Data.auctionId;
      }
    }

    await this.auctionService.updateBasics({ auctionId: this.auctionId, name: this.auctionName, scheduledAt: this.auctionDate, perTeamBudget: this.auctionBudget });
    this.auctionService.setAuctionStep(this.auctionStep + 1);
  }

  cancel() {
    this.navigation.navigateToAuctionDetails(this.auctionId!);
  }
}
