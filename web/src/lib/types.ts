export type Owner = {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  id?: string;
};

export type Team = {
  team_id: number;
  team_name: string;
  team_abbrev?: string | null;
  owners: Owner[];
  wins: number;
  losses: number;
  ties?: number;
  points_for?: number | null;
  points_against?: number | null;
  standing?: number | null;
  final_standing?: number | null;
  logo_url?: string | null;
  division_name?: string | null;
  division_id?: number | string | null;
};

export type Matchup = {
  matchup_period?: number | null;
  scoring_period?: number | null;
  home_team_id?: number | null;
  home_team_name?: string | null;
  home_score?: number | null;
  away_team_id?: number | null;
  away_team_name?: string | null;
  away_score?: number | null;
  winner?: string | null;
  is_playoff?: boolean;
  is_consolation?: boolean;
};

export type SeasonData = {
  sport: "football" | "baseball";
  league_id: number;
  year: number;
  pulled_at: string;
  settings: {
    name?: string;
    scoring_type?: string;
    team_count?: number;
    playoff_team_count?: number;
    reg_season_count?: number;
  };
  teams: Team[];
  matchups: Matchup[];
  draft: any[];
};

export type OwnerCareer = {
  key: string;
  displayName: string;
  seasons: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  championships: number;
  footballSeasons: number;
  baseballSeasons: number;
  footballWins: number;
  baseballWins: number;
  footballChampionships: number;
  baseballChampionships: number;
};

export type HeadToHeadRecord = {
  ownerA: string;
  ownerB: string;
  winsA: number;
  winsB: number;
  ties: number;
  totalGames: number;
};
