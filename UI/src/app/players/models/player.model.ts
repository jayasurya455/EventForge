import { BaseEntity } from "../../shared/models/base-entity.model";

export interface Player extends BaseEntity {
  name: string;
  role?: string;
  email?: string;
  basePrice: number;
  imagePath?: string;
  imageBase?: string;
  initial?: string;
  area?: string;
}
