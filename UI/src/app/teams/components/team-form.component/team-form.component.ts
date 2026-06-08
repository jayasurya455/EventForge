import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormLogo } from '../../../shared/components/form-logo/form-logo';
import { TeamService } from '../../services/team.service';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';

@Component({
  selector: 'app-team-form.component',
  imports: [AppShellComponent, ButtonComponent, IconComponent, CommonModule, FormsModule, FormLogo, TopNavComponent],
  templateUrl: './team-form.component.html',
  styleUrl: './team-form.component.scss',
})
export class TeamFormComponent implements OnInit {
  mode: 'create' | 'edit' = 'create';
  teamId?: string;
  selectedColor: string = '#3B82F6';
  leagues = [
    'Premier League 2026',
    'Champions Trophy',
    'Winter League'
  ];

  selectedLeague = this.leagues[0];
  teamColor = '#3B82F6';
  teamName = '';
  teamShortName = '';
  budget = '';
  imagePreview?: string;
  logoPath: any;
  logoImage: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private teamService: TeamService,
    private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id') ?? undefined;

    if (this.teamId) {
      this.mode = 'edit';
      this.preFillData();
    }
  }

  private preFillData() {
    this.teamService.getById(this.teamId).then(team => {
      if (team) {
        this.teamName = team.name;
        this.teamShortName = team.shortName ?? '';
        this.budget = team.teamProvidedbudget?.toString() || '';
        this.selectedColor = team.teamColor || '';
        this.logoPath = team.logoPath || '';
        this.logoImage = team.logoImage ?? null;
        this.cdr.detectChanges();
      }
    });
  }

  onHexInput(event: any) {
    const hex = (event.target as HTMLInputElement).value.trim();

    if (/^#([0-9A-Fa-f]{6})$/.test(hex)) {
      this.selectedColor = hex.toUpperCase();
    }
  }

  cancel() {
    this.router.navigate(['/teams/view']);
  }

  updateLogoPath(event: { source: string }) {
    this.logoPath = event.source;
  }

  async callTeam() {
    if (!this.teamName.trim()) {
      return;
    }

    if (this.mode === 'edit' && this.teamId) {
      await this.teamService.update({
        id: this.teamId,
        name: this.teamName,
        shortName: this.teamShortName,
        logoPath: this.logoPath,
        teamColor: this.selectedColor,
        teamProvidedbudget: Number(this.budget)
      });
    } else {
      await this.teamService.create({
        name: this.teamName,
        shortName: this.teamShortName,
        logoPath: this.logoPath,
        teamColor: this.selectedColor,
        teamProvidedbudget: Number(this.budget)
      });
    }

    this.router.navigate(['/teams/view']);
  }

}
