import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '../models/player.model';

@Pipe({ name: 'playerFilter', standalone: true })
export class PlayerFilterPipe implements PipeTransform {
  transform(players: Player[], search: string): Player[] {
    if (!search?.trim()) return players;
    const term = search.toLowerCase();
    return players.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.area?.toLowerCase().includes(term) ||
      p.role?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term)
    );
  }
}
