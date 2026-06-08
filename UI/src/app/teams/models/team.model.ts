import { BaseEntity } from "../../shared/models/base-entity.model";

export interface Team extends BaseEntity {
  name: string;
  shortName?: string;
  logoPath?: string;
  logoImage?: string; //base64 image string
  teamColor?: string;
  teamProvidedbudget: number;
  teamInitial?: string; //will be populated based on name
  auctionBudget?: number; // per-auction override (UI use)
}
