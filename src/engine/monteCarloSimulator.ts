import type { LeagueSize, ScoringFormat, StrategyType, MonteCarloStrategyResult, Team, Player } from '../types';
import { initializeTeams, getSnakePickOrder, addPlayerToTeam } from './draftEngine';
import { selectBestPlayerForTeam } from './draftAI';
import { simulateFullSeason } from './seasonSimulator';
import { PLAYERS_DATABASE } from '../data/playersData';

const STRATEGY_NAMES: Record<StrategyType, string> = {
  heroRb: 'Hero RB (Anchor RB)',
  zeroRb: 'Zero RB (WR/TE First)',
  bpa: 'Best Player Available (BPA)',
  robustRb: 'Robust RB (Heavy RB)',
  eliteQb: 'Elite QB Early',
  eliteTe: 'Elite TE Early',
  balanced: 'Balanced Need',
};

/**
 * Runs a fast draft for a set of teams using AI logic.
 */
export const runFastDraft = (
  teams: Team[],
  playersPool: Player[],
  format: ScoringFormat
): Team[] => {
  const draftTeams: Team[] = teams.map(t => ({
    ...t,
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
  }));

  const available = [...playersPool];
  const pickOrder = getSnakePickOrder(draftTeams);

  for (const pickInfo of pickOrder) {
    const team = draftTeams[pickInfo.teamIndex];
    const pickedPlayer = selectBestPlayerForTeam(team, available, pickInfo.round, format);

    // Remove from available
    const idx = available.findIndex(p => p.id === pickedPlayer.id);
    if (idx !== -1) available.splice(idx, 1);

    // Add to team
    draftTeams[pickInfo.teamIndex] = addPlayerToTeam(team, pickedPlayer);
  }

  return draftTeams;
};

/**
 * Runs Monte Carlo simulations comparing selected strategies.
 */
export const runMonteCarloBenchmark = (
  strategiesToTest: StrategyType[],
  numSimulations: number,
  leagueSize: LeagueSize,
  format: ScoringFormat,
  draftSlot: number = 1
): MonteCarloStrategyResult[] => {
  const results: MonteCarloStrategyResult[] = strategiesToTest.map(st => ({
    strategy: st,
    name: STRATEGY_NAMES[st] || st,
    simulationsRun: 0,
    championships: 0,
    championshipRate: 0,
    playoffAppearances: 0,
    playoffRate: 0,
    avgRegularSeasonWins: 0,
    avgPointsPerSeason: 0,
    avgFinalRank: 0,
    bestRank: 99,
    worstRank: 0,
  }));

  for (let sIdx = 0; sIdx < strategiesToTest.length; sIdx++) {
    const testStrategy = strategiesToTest[sIdx];
    const stat = results[sIdx];

    let totalWins = 0;
    let totalPoints = 0;
    let totalRank = 0;

    for (let sim = 0; sim < numSimulations; sim++) {
      // Initialize teams with the target strategy at `draftSlot`
      const teams = initializeTeams(leagueSize, draftSlot, testStrategy);

      // Draft
      const draftedTeams = runFastDraft(teams, PLAYERS_DATABASE, format);

      // Simulate full season
      const simResult = simulateFullSeason(draftedTeams, format);

      // Find user team standing
      const userStanding = simResult.standings.find(s => s.isUser)!;
      const rank = userStanding.finalRank || userStanding.playoffSeed || leagueSize;

      stat.simulationsRun++;
      totalWins += userStanding.wins;
      totalPoints += userStanding.pointsFor;
      totalRank += rank;

      if (rank === 1) stat.championships++;
      if (rank <= 4) stat.playoffAppearances++;

      if (rank < stat.bestRank) stat.bestRank = rank;
      if (rank > stat.worstRank) stat.worstRank = rank;
    }

    stat.championshipRate = Math.round((stat.championships / stat.simulationsRun) * 1000) / 10;
    stat.playoffRate = Math.round((stat.playoffAppearances / stat.simulationsRun) * 1000) / 10;
    stat.avgRegularSeasonWins = Math.round((totalWins / stat.simulationsRun) * 10) / 10;
    stat.avgPointsPerSeason = Math.round((totalPoints / stat.simulationsRun) * 10) / 10;
    stat.avgFinalRank = Math.round((totalRank / stat.simulationsRun) * 10) / 10;
  }

  // Sort by championship rate descending
  results.sort((a, b) => b.championshipRate - a.championshipRate);
  return results;
};
