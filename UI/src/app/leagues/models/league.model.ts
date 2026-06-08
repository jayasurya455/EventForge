import { BaseEntity } from "../../shared/models/base-entity.model";

export interface League extends BaseEntity {
  name: string;
  description?: string;
  logoSourcePath?: string;
  maxTeams?: number;
  maxPlayersPerTeam?: number;
  logoImage?: any;
}
