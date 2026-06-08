import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiRefreshService {
  private leagueRefreshSubject = new Subject<void>();
  leagueRefresh$ = this.leagueRefreshSubject.asObservable();

  notifyLeagueRefresh() {
    this.leagueRefreshSubject.next();
  }

  private teamRefreshSubject = new Subject<void>();
  teamRefresh$ = this.teamRefreshSubject.asObservable();

  notifyTeamRefresh() {
    this.teamRefreshSubject.next();
  }

  private playerRefreshSubject = new Subject<void>();
  playerRefresh$ = this.playerRefreshSubject.asObservable();

  notifyPlayerRefresh() {
    this.playerRefreshSubject.next();
  }
}
