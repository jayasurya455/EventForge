import { Injectable } from '@angular/core';
import { League } from '../models/league.model';
import { NativeBridgeService } from '../../shared/services/native-bridge/native-bridge.service';

@Injectable({ providedIn: 'root' })
export class LeagueService {

  constructor(private readonly bridge: NativeBridgeService) { }

  // --------------------
  // CREATE
  // --------------------
  create(league: Partial<League>): Promise<League> {
    return this.bridge.createLeague({League: league});
  }

  // --------------------
  // UPDATE
  // --------------------
  update(league: Partial<League>): Promise<League> {
    return this.bridge.updateLeague({League: league});
  }

  // --------------------
  // DELETE
  // --------------------
  delete(id: string): Promise<boolean> {
    return this.bridge.deleteLeague({LeagueId: id});
  }

  // --------------------
  // READ
  // --------------------
  getAll(): Promise<League[]> {
    return this.bridge.getAllLeagues();
  }

  getById(id: string): Promise<League | null> {
    return this.bridge.getLeagueById({LeagueId: id});
  }
}
