import { Component, OnDestroy, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { TeamCardComponent } from '../../../../teams/components/team-card.component/team-card.component';
import { Team } from '../../../../teams/models/team.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../../shared/services/common/common.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { AuctionService } from '../../../services/auction.service';
import { TeamService } from '../../../../teams/services/team.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { FooterActionBar } from '../../../../shared/components/footer-action-bar/footer-action-bar';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { AuctionTeam } from '../../../models/auction.models';

@Component({
  selector: 'app-auction-step2',
  imports: [TeamCardComponent, CommonModule, FormsModule, ButtonComponent, FooterActionBar, IconComponent],
  templateUrl: './auction-step2.component.html',
  styleUrls: ['./auction-step2.component.scss']
})
export class AuctionStep2Component implements OnInit, OnDestroy {
  auctionStep = 1;
  mode: string = ''
  teams = signal<Team[] | []>([]);
  selectedTeams: Team[] = [];
  auctionId: string = '';
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    private commonService: CommonService,
    private teamService: TeamService,
    private auctionService: AuctionService,
    private navigation: NavigationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.commonService.getSelectedTeams$.pipe(takeUntil(this.destroy$)).subscribe((teams) => {
      this.selectedTeams = teams;
    });

    this.auctionService.getAuctionWizardProps().pipe(takeUntil(this.destroy$)).subscribe((props) => {
      this.mode = props.mode;
    });

    this.auctionService.getActiveAuctionId().pipe(takeUntil(this.destroy$)).subscribe((auctionId) => {
      this.auctionId = auctionId;
      this.loadTeams();
    });
  }

  public loadTeams() {
    Promise.all([
      this.teamService.getAll(),
      this.auctionId ? this.auctionService.getDetail(this.auctionId) : Promise.resolve(null)
    ]).then(([teams, detail]) => {
      this.teams.set(teams);
      const selectedIds = new Set((detail?.teams ?? []).map((t: AuctionTeam) => t.TeamId));
      this.selectedTeams = teams.filter(t => selectedIds.has(t.id));
      this.commonService.UpdateSelectedTeams(this.selectedTeams);
      this.cdr.detectChanges();
    });
  }

  get allSelected(): boolean {
    return this.teams().length > 0 && this.selectedTeams.length === this.teams().length;
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedTeams.forEach(async t => {
        await this.auctionService.removeTeam({ auctionId: this.auctionId!, teamId: t.id });
      });
      this.commonService.UpdateSelectedTeams([]);
    } else {
      const teamsToAdd = this.teams().filter(t => !this.selectedTeams.some(s => s.id === t.id));
      teamsToAdd.forEach(async t => {
        await this.auctionService.addTeam({ auctionId: this.auctionId!, teamId: t.id, teamName: t.name, auctionBudget: t.teamProvidedbudget });
      });
      this.commonService.UpdateSelectedTeams([...this.teams()]);
    }
  }

  prev() {
    this.auctionService.setAuctionStep(this.auctionStep - 1);
  }

  async next() {
    await this.auctionService.finalizeTeams(this.auctionId!);
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
