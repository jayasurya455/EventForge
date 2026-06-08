import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { LeagueService } from '../../services/league.service';
import { FormLogo } from '../../../shared/components/form-logo/form-logo';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';

@Component({
  selector: 'league-form',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent,
    AppShellComponent,
    FormLogo,
    TopNavComponent
  ],
  templateUrl: './league-form.component.html',
  styleUrl: './league-form.component.scss',
})
export class LeagueFormComponent implements OnInit {

  mode: 'create' | 'edit' = 'create';

  auctionTypes = ['Open', 'Closed', 'Draft'];
  selectedAuctionType = 'Open';
  imagePreview?: string;
  leagueId: string = '';
  createdAt: string = '';
  logoImage: any = '';

  @ViewChild('leagueName') leagueNameRef!: ElementRef<HTMLInputElement>;
  @ViewChild('description') descriptionRef!: ElementRef<HTMLInputElement>;
  @ViewChild('totalTeams') totalTeamsRef!: ElementRef<HTMLInputElement>;
  @ViewChild('playersPerTeam') playersPerTeamRef!: ElementRef<HTMLInputElement>;
  logoPath: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private leagueService: LeagueService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.leagueId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

    if (this.leagueId) {
      this.mode = 'edit';
      this.preFillData();
    }
  }

  private preFillData() {
    this.leagueService.getById(this.leagueId).then(league => {
      if (league) {
        this.leagueNameRef.nativeElement.value = league.name;
        this.descriptionRef.nativeElement.value = league.description || '';
        this.totalTeamsRef.nativeElement.value = league.maxTeams?.toString() || '0';
        this.playersPerTeamRef.nativeElement.value = league.maxPlayersPerTeam?.toString() || '0';
        this.logoImage = league.logoImage ?? null;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.router.navigate(['/leagues']);
  }

  selectAuction(type: string) {
    this.selectedAuctionType = type;
  }

  async callLeague() {
    const name = this.leagueNameRef.nativeElement.value.trim();
    const description = this.descriptionRef.nativeElement.value.trim();
    const maxPlayersPerTeam = Number(this.playersPerTeamRef.nativeElement.value.trim());
    const maxTeams = Number(this.totalTeamsRef.nativeElement.value.trim());
    const logoSourcePath = this.logoPath;

    if (!name) {
      return;
    }

    if (this.mode === 'edit' && this.leagueId) {
      await this.leagueService.update({
        id: this.leagueId,
        name,
        description,
        logoSourcePath,
        maxTeams,
        maxPlayersPerTeam
      });
    } else {
      await this.leagueService.create({
        name,
        description,
        logoSourcePath,
        maxTeams,
        maxPlayersPerTeam
      });
    }

    this.router.navigate(['/leagues']);
  }

  updateLogoPath(event: { source: string }) {
    this.logoPath = event.source;
  }
}