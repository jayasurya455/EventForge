import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';
import { RouterModule } from '@angular/router';
import { Team } from '../../models/team.model';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { UiRefreshService } from '../../../shared/services/ui-refresh/ui-refresh.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component/confirm-dialog.component';
import { CommonService } from '../../../shared/services/common/common.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { AuctionService } from '../../../auctions/services/auction.service';

@Component({
  selector: 'app-team-card',
  imports: [ButtonComponent, IconComponent, RouterModule, CommonModule, ConfirmDialogComponent],
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.scss',
})
export class TeamCardComponent implements OnInit, OnDestroy {
  @Input() team: Team = {} as Team;
  @Input() readOnly: boolean = false;
  @Input() selectable: boolean = false;
  @Input() isSelectedTeam: boolean = false;
  @Input() auctionId: string = '';
  showDeleteConfirm: boolean = false;
  selectedTeams: Team[] = [];
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    private teamService: TeamService,
    private uiRefreshService: UiRefreshService,
    private auctionService: AuctionService,
    private commonService: CommonService
  ) {}
  ngOnInit(): void {
    this.commonService.getSelectedTeams$.pipe(takeUntil(this.destroy$)).subscribe((selectedTeams) => {
      this.selectedTeams = selectedTeams;
      this.isSelectedTeam = selectedTeams.some(t => t.id === this.team?.id) ?? false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  confirmDelete() {
    if (this.team) {
      this.teamService.delete(this.team.id).then((success) => {
        this.uiRefreshService.notifyTeamRefresh();
        console.log('League deleted successfully.', success);
      });
      this.showDeleteConfirm = false;
    }
  }

  onSelectionChange() {
    this.isSelectedTeam = !this.isSelectedTeam;
    
    if(this.isSelectedTeam) {
      this.selectedTeams.push(this.team!);
      if (this.auctionId) {
        this.auctionService.addTeam({ auctionId: this.auctionId, teamId: this.team.id!, teamName: this.team.name, auctionBudget: this.team.teamProvidedbudget });
      }
    } else {
      this.selectedTeams = this.selectedTeams.filter(t => t.id !== this.team?.id);
      if (this.auctionId) {
        this.auctionService.removeTeam({ auctionId: this.auctionId, teamId: this.team.id!});
      }
    }

    this.commonService.UpdateSelectedTeams(this.selectedTeams);

  }
}
