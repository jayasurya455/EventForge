import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Team } from '../../../teams/models/team.model';
import { Player } from '../../../players/models/player.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private selectedTeamsSubject = new BehaviorSubject<Team[]>([]);
  public getSelectedTeams$ = this.selectedTeamsSubject.asObservable();

  UpdateSelectedTeams(teams: Team[]) {
    this.selectedTeamsSubject.next(teams);
  }

  private selectedPlayersSubject = new BehaviorSubject<Player[]>([]);
  public getSelectedPlayers$ = this.selectedPlayersSubject.asObservable();

  UpdateSelectedPlayers(players: Player[]) {
    this.selectedPlayersSubject.next(players);
  }

  getSelectedTeamsValue(): Team[] {
    return this.selectedTeamsSubject.getValue();
  }

  getSelectedPlayersValue(): Player[] {
    return this.selectedPlayersSubject.getValue();
  }
}
