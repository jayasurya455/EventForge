import { Injectable, signal } from '@angular/core';
import { NativeBridgeService } from '../native-bridge/native-bridge.service';

export interface LicenseSnapshot {
  status: 'NotActivated' | 'Active' | 'Invalid';
  edition: 'demo' | 'full';
  licensed: boolean;
  customerName?: string | null;
  customerEmail?: string | null;
  issuedUtc?: string | null;
  error?: string | null;
}

const DEMO_SNAPSHOT: LicenseSnapshot = {
  status: 'NotActivated',
  edition: 'demo',
  licensed: false
};

/**
 * Angular-side gate around the native LicenseService.
 *
 * Holds the current license snapshot as a signal so any component can react to
 * Demo vs Full without re-querying the bridge. The native layer remains the
 * single source of truth — this only caches the last snapshot it returned.
 */
@Injectable({ providedIn: 'root' })
export class LicenseService {
  private readonly _snapshot = signal<LicenseSnapshot>(DEMO_SNAPSHOT);

  /** Reactive license snapshot. */
  readonly snapshot = this._snapshot.asReadonly();

  constructor(private bridge: NativeBridgeService) {}

  get isLicensed(): boolean {
    return this._snapshot().licensed;
  }

  /** Refresh from the native layer. Safe to call repeatedly. */
  async refresh(): Promise<LicenseSnapshot> {
    try {
      const snap = await this.bridge.getLicenseStatus();
      this._snapshot.set(this.normalize(snap));
    } catch {
      // Bridge unavailable (e.g. running UI in a plain browser) → treat as demo.
      this._snapshot.set(DEMO_SNAPSHOT);
    }
    return this._snapshot();
  }

  /** Attempt activation with a pasted key; updates the snapshot on success. */
  async activate(key: string): Promise<LicenseSnapshot> {
    const snap = this.normalize(await this.bridge.activateLicense(key));
    this._snapshot.set(snap);
    return snap;
  }

  async deactivate(): Promise<LicenseSnapshot> {
    const snap = this.normalize(await this.bridge.deactivateLicense());
    this._snapshot.set(snap);
    return snap;
  }

  private normalize(snap: any): LicenseSnapshot {
    if (!snap) return DEMO_SNAPSHOT;
    return {
      status: snap.status ?? 'NotActivated',
      edition: snap.edition ?? 'demo',
      licensed: !!snap.licensed,
      customerName: snap.customerName,
      customerEmail: snap.customerEmail,
      issuedUtc: snap.issuedUtc,
      error: snap.error
    };
  }
}
