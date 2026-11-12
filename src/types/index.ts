export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
export type FlexPosition = 'RB' | 'WR' | 'TE';
export type ScoringFormat = 'standard' | 'halfPpr' | 'fullPpr';
export type LeagueSize = 8 | 10 | 12;
export type DatasetYear = '2025' | '2024' | '2023' | '2022';

export interface PlayerStats {
  passYds: number;
  passTds: number;
  int: number;
  rushYds: number;
  rushTds: number;
  receptions: number;
  recYds: number;
  recTds: number;
  fumblesLost: number;
  pointsStandard: number;
  pointsHalfPpr: number;
  pointsFullPpr: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  byeWeek: number;
  adp: number; // Average Draft Position
  tier: number;
  projectedMean: number; // Baseline projected points per game (Half-PPR)
  projectedStdDev: number; // Volatility / standard deviation
  isRookie?: boolean;
  notes?: string;
  historical?: {
    [key in '2022' | '2023' | '2024']?: PlayerStats;
  };
  projections2025: PlayerStats;
}

export type StrategyType = 
  | 'bpa'        // Best Player Available
  | 'heroRb'     // Hero RB / Anchor RB
  | 'zeroRb'     // Zero RB (WR/TE/QB early, RB late)
  | 'robustRb'   // Robust RB (heavy RB first 3-4 rounds)
  | 'eliteQb'    // Early elite QB
  | 'eliteTe'    // Early elite TE
  | 'balanced';  // Balanced positional need

export interface RosterConfig {
  qb: number;
  rb: number;
  wr: number;
  te: number;
  flex: number;
  k: number;
  def: number;
  bench: number;
}

export const DEFAULT_ROSTER_CONFIG: RosterConfig = {
  qb: 1,
  rb: 2,
  wr: 2,
  te: 1,
  flex: 1,
  k: 1,
  def: 1,
  bench: 6,
};

export interface TeamRoster {
  qb: Player[];
  rb: Player[];
  wr: Player[];
  te: Player[];
  k: Player[];
  def: Player[];
  bench: Player[];
  all: Player[];
}

export interface Team {
  id: string;
  name: string;
  isUser: boolean;
  draftSlot: number;
  strategy: StrategyType;
  roster: TeamRoster;
  avatarColor: string;
}

export interface DraftPick {
  overallPick: number;
  round: number;
  pickInRound: number;
  teamId: string;
  player: Player;
  timestamp?: number;
}

export interface DraftState {
  currentPick: number;
  isDraftComplete: boolean;
  history: DraftPick[];
  teams: Team[];
}

export interface Matchup {
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homeStarters: { slot: string; player: Player; points: number }[];
  awayStarters: { slot: string; player: Player; points: number }[];
  homeBench: { player: Player; points: number }[];
  awayBench: { player: Player; points: number }[];
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  isUser: boolean;
  strategy: StrategyType;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
  playoffSeed?: number;
  finalRank?: number;
}

export interface PlayoffMatchup {
  id: string;
  round: 'semifinal' | 'final' | 'thirdPlace';
  week: number;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  winnerId?: string;
  loserId?: string;
}

export interface SeasonSimulationResult {
  weeks: Matchup[][]; // 14 weeks of matchups
  standings: TeamStanding[];
  playoffMatchups: PlayoffMatchup[];
  championId: string;
  runnerUpId: string;
  thirdPlaceId: string;
}

export interface MonteCarloStrategyResult {
  strategy: StrategyType;
  name: string;
  simulationsRun: number;
  championships: number;
  championshipRate: number;
  playoffAppearances: number;
  playoffRate: number;
  avgRegularSeasonWins: number;
  avgPointsPerSeason: number;
  avgFinalRank: number;
  bestRank: number;
  worstRank: number;
}
