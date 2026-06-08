import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LicenseService, LicenseSnapshot } from '../../shared/services/license/license.service';

/**
 * Minimal activation screen: paste a license key, activate, see status.
 * Demo-mode gating UI is layered on top of this in a later step.
 */
@Component({
  selector: 'license-activation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="license-activation">
      <h2>Activate EventForge</h2>

      <p *ngIf="snapshot.licensed" class="status status--ok">
        ✓ Full version active<span *ngIf="snapshot.customerName"> — licensed to {{ snapshot.customerName }}</span>
      </p>
      <p *ngIf="!snapshot.licensed" class="status status--demo">
        Running in Demo mode. Enter a license key to unlock the full version.
      </p>

      <ng-container *ngIf="!snapshot.licensed">
        <textarea #keyInput rows="3" placeholder="Paste your license key (EVF1...)"></textarea>
        <button type="button" [disabled]="busy" (click)="activate(keyInput.value)">
          {{ busy ? 'Activating…' : 'Activate' }}
        </button>
      </ng-container>

      <button *ngIf="snapshot.licensed" type="button" (click)="deactivate()">
        Remove license
      </button>

      <p *ngIf="error" class="status status--error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .license-activation { max-width: 520px; margin: 2rem auto; display: flex; flex-direction: column; gap: 1rem; }
    textarea { width: 100%; font-family: monospace; }
    .status--ok { color: #2e7d32; }
    .status--demo { color: #b26a00; }
    .status--error { color: #c62828; }
  `]
})
export class LicenseActivationComponent implements OnInit {
  snapshot: LicenseSnapshot = { status: 'NotActivated', edition: 'demo', licensed: false };
  busy = false;
  error: string | null = null;

  @ViewChild('keyInput') keyInput?: ElementRef<HTMLTextAreaElement>;

  constructor(private license: LicenseService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.snapshot = await this.license.refresh();
  }

  async activate(key: string): Promise<void> {
    this.error = null;
    const trimmed = (key ?? '').trim();
    if (!trimmed) {
      this.error = 'Please paste a license key.';
      return;
    }

    this.busy = true;
    try {
      this.snapshot = await this.license.activate(trimmed);
      this.error = this.snapshot.licensed ? null : (this.snapshot.error ?? 'Activation failed.');
    } catch (e: any) {
      this.error = e?.message ?? 'Activation failed.';
    } finally {
      this.busy = false;
    }
  }

  async deactivate(): Promise<void> {
    this.error = null;
    this.snapshot = await this.license.deactivate();
  }
}
