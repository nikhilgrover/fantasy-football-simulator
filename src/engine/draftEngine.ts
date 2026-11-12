import type { Team, Player, LeagueSize, StrategyType } from '../types';

export const TOTAL_ROUNDS = 15;

export interface DraftSlotInfo {
  overallPick: number;
  round: number;
  pickInRound: number;
  teamIndex: number;
  teamId: string;
}

/**
 * Returns the exact draft pick order for a snake draft.
 * E.g., for 10 teams:
 * Round 1: 0, 1, 2, ..., 9
 * Round 2: 9, 8, 7, ..., 0
 * Round 3: 0, 1, 2, ..., 9
 */
export const getSnakePickOrder = (teams: Team[]): DraftSlotInfo[] => {
  const numTeams = teams.length;
  const totalPicks = numTeams * TOTAL_ROUNDS;
  const picks: DraftSlotInfo[] = [];

  for (let p = 1; p <= totalPicks; p++) {
    const round = Math.ceil(p / numTeams);
    const pickInRound = ((p - 1) % numTeams) + 1;
    const isEvenRound = round % 2 === 0;

    const teamIndex = isEvenRound ? numTeams - pickInRound : pickInRound - 1;
    const team = teams[teamIndex];

    picks.push({
      overallPick: p,
      round,
      pickInRound,
      teamIndex,
      teamId: team.id,
    });
  }

  return picks;
};

/**
 * Adds a drafted player to a team's roster structure.
 */
export const addPlayerToTeam = (team: Team, player: Player): Team => {
  const newRoster = {
    qb: [...team.roster.qb],
    rb: [...team.roster.rb],
    wr: [...team.roster.wr],
    te: [...team.roster.te],
    k: [...team.roster.k],
    def: [...team.roster.def],
    bench: [...team.roster.bench],
    all: [...team.roster.all, player],
  };

  const pos = player.position.toLowerCase() as 'qb' | 'rb' | 'wr' | 'te' | 'k' | 'def';

  // Check starter requirements: QB 1, RB 2, WR 2, TE 1, K 1, DEF 1
  const starterMax: Record<string, number> = {
    qb: 1,
    rb: 2,
    wr: 2,
    te: 1,
    k: 1,
    def: 1,
  };

  if (newRoster[pos].length < starterMax[pos]) {
    newRoster[pos].push(player);
  } else {
    newRoster.bench.push(player);
  }

  return {
    ...team,
    roster: newRoster,
  };
};

/**
 * Creates initial teams with assigned names, avatars, and strategies.
 */
export const initializeTeams = (
  leagueSize: LeagueSize,
  userSlot: number,
  userStrategy: StrategyType
): Team[] => {
  const teamNames = [
    'Thunderbolts',
    'Gridiron Titans',
    'Apex Predators',
    'Touchdown Blitz',
    'Endzone Rogues',
    'RedZone Renegades',
    'Hail Mary Heroes',
    'Pigskin Mavericks',
    'Blitzkriegers',
    'Golden Vipers',
    'Iron Lions',
    'Sonic Boom'
  ];

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', 
    '#84cc16', '#eab308', '#6366f1', '#d946ef'
  ];

  const defaultStrategies: StrategyType[] = [
    'heroRb', 'bpa', 'zeroRb', 'robustRb', 
    'eliteQb', 'balanced', 'eliteTe', 'bpa', 
    'heroRb', 'zeroRb', 'robustRb', 'balanced'
  ];

  const teams: Team[] = [];

  for (let i = 0; i < leagueSize; i++) {
    const isUser = i + 1 === userSlot;
    teams.push({
      id: `team-${i + 1}`,
      name: isUser ? 'My Fantasy Team' : teamNames[i],
      isUser,
      draftSlot: i + 1,
      strategy: isUser ? userStrategy : defaultStrategies[i],
      avatarColor: colors[i % colors.length],
      roster: {
        qb: [],
        rb: [],
        wr: [],
        te: [],
        k: [],
        def: [],
        bench: [],
        all: [],
      },
    });
  }

  return teams;
};
