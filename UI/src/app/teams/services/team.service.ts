import { Injectable } from '@angular/core';
import { NativeBridgeService } from '../../shared/services/native-bridge/native-bridge.service';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
   constructor(private readonly bridge: NativeBridgeService) {}

  create(team: Partial<Team>): Promise<any> {
    return this.bridge.createTeam({ Team: team });
  }

  update(team: Partial<Team>): Promise<any> {
    return this.bridge.updateTeam({ Team: team });
  }

  delete(id?: string): Promise<boolean> {
    return this.bridge.deleteteam({ TeamId: id });
  }

  getAll(): Promise<Team[]> {
    return this.bridge.getAllTeams();
  }

  getById(id?: string): Promise<Team | null> {
    return this.bridge.getTeamById({ TeamId: id });
  }

  getTeamByLeague(id: string): Promise<Team[] | null> {
    return this.bridge.getTeamByLeague({ LeagueId: id });
  }

}
