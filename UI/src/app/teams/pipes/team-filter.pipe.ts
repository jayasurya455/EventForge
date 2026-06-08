import { Pipe, PipeTransform } from '@angular/core';
import { Team } from '../models/team.model';

@Pipe({ name: 'teamFilter', standalone: true })
export class TeamFilterPipe implements PipeTransform {
  transform(teams: Team[], search: string): Team[] {
    if (!search?.trim()) return teams;
    const term = search.toLowerCase();
    return teams.filter(t =>
      t.name?.toLowerCase().includes(term) ||
      t.shortName?.toLowerCase().includes(term)
    );
  }
}
