export interface Auction {
  AuctionId: string;
  LeagueId: string;
  Name: string;
  ScheduledAt?: string;
  Status: string;
  CurrentPlayerId?: string | null;
  Version?: number;
  PerTeamBudget?: number;
}

export interface AuctionTeam {
  AuctionId: string;
  TeamId: string;
  TeamName: string;
  AuctionBudget: number;
  Spent: number;
  ImageBase?: string | null;
}

export interface AuctionPlayer {
  AuctionId: string;
  PlayerId: string;
  PlayerName: string;
  Status: string;
  WinningTeamId?: string | null;
  SalePrice?: number | null;
  ImageBase?: string | null;
}

export interface LeagueStats {
  TotalAuctions: number | 0;
  TotalSpent: number | 0;
  TotalTeams: number | 0;
  TotalPlayers: number | 0;
}

export interface AuctionListPage {
  auctions: Auction[];
  league: any;
  stats: LeagueStats;
}

export interface AuctionWizardProps {
  mode: string; 
  activeAuction: Auction | null;
  activeAuctionTeams: AuctionTeam[] | [];
  activeAuctionPlayers: AuctionPlayer[] | [];
}
