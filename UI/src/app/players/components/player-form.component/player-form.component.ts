import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';
import { FormsModule } from '@angular/forms';
import { AppShellComponent } from '../../../shell/app-shell/app-shell';
import { FormLogo } from '../../../shared/components/form-logo/form-logo';
import { PlayerService } from '../../service/player.service';
import { TopNavComponent } from '../../../shared/components/top-nav.component/top-nav.component';

@Component({
  selector: 'app-player-form',
  imports: [AppShellComponent, CommonModule, ButtonComponent, IconComponent, FormsModule, RouterModule, FormLogo, TopNavComponent],
  templateUrl: './player-form.component.html',
  styleUrls: ['./player-form.component.scss']
})
export class PlayerFormComponent implements OnInit {
  playerId?: string;
  mode: 'create' | 'edit' = 'create';
  roles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
  selectedRole = this.roles[0];
  playerName = '';
  playerArea = '';
  playerPrice = '';
  playerEmail = '';
  logoPath = '';
  playerImage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playerService: PlayerService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id') ?? undefined;

    if (this.playerId) {
      this.mode = 'edit';
      this.prefillData();
    }
  }

  private prefillData() {
    this.playerService.getById(this.playerId).then(player => {
      if (player) {
        this.playerName = player?.name;
        this.playerEmail = player?.email ?? "";
        this.selectedRole = player?.role ?? this.roles[0];
        this.playerArea = player?.area ?? ""
        this.logoPath = player?.imagePath ?? "";
        this.playerImage = player?.imageBase ?? "";
        this.playerPrice = player?.basePrice.toString() ?? "0";
        this.cdr.detectChanges();
      }
    });
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  cancel() {
    this.router.navigate(['/players/view']);
  }

  updateLogoPath(event: { source: string }) {
    this.logoPath = event.source;
  }

  async callPlayer() {
    if (!this.playerName.trim()) {
      return;
    }

    if (this.mode === 'edit' && this.playerId) {
      await this.playerService.update({
        id: this.playerId,
        name: this.playerName,
        email: this.playerEmail,
        role: this.selectedRole,
        area: this.playerArea,
        imagePath: this.logoPath,
        basePrice: Number(this.playerPrice)
      });
    } else {
      await this.playerService.create({
        name: this.playerName,
        email: this.playerEmail,
        area: this.playerArea,
        role: this.selectedRole,
        imagePath: this.logoPath,
        basePrice: Number(this.playerPrice)
      });
    }

    this.router.navigate(['/players/view']);
  }
}
