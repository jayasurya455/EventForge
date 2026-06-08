import { Injectable } from '@angular/core';
import { NativeBridgeService } from '../../shared/services/native-bridge/native-bridge.service';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private readonly bridge: NativeBridgeService) {}

  create(player: Partial<Player>): Promise<any> {
    return this.bridge.createPlayer({ Player: player });
  }

  update(player: Partial<Player>): Promise<any> {
    return this.bridge.updatePlayer({ Player: player });
  }

  delete(id: string): Promise<boolean> {
    return this.bridge.deletePlayer({ PlayerId: id });
  }

  getAll(): Promise<Player[]> {
    return this.bridge.getAllPlayers();
  }

  getById(id?: string): Promise<Player | null> {
    return this.bridge.getPlayerById({ PlayerId: id });
  }
}
