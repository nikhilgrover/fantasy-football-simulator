import type { Team, Player, Matchup, TeamStanding, PlayoffMatchup, SeasonSimulationResult, ScoringFormat } from '../types';
import { generateRegularSeasonSchedule } from './scheduleGenerator';
import { getPlayerProjectedWeeklyPoints } from '../data/scoringRules';

/**
 * Standard Normal Random Generator (Box-Muller transform)
 */
const randomGaussian = (mean: number, stdDev: number): number => {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const score = mean + z * stdDev;
  // Floor at 0 points (or -2 in rare defensive blowouts)
  return Math.max(0, Math.round(score * 10) / 10);
};

/**
 * Simulates a single player's performance in a given week.
 */
export const simulatePlayerWeek = (
  player: Player,
  week: number,
  format: ScoringFormat
): number => {
  // If player is on bye this week, 0 points
  if (player.byeWeek === week) {
    return 0;
  }

  const baseMean = getPlayerProjectedWeeklyPoints(player.projectedMean, player.position, format);
  // High variance for WRs and QBs, moderate for RBs, lower for Ks
  const score = randomGaussian(baseMean, player.projectedStdDev);
  return score;
};

/**
 * Selects the optimal starting lineup for a team in a given week.
 * Standard Lineup: 1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX (RB/WR/TE), 1 K, 1 DEF
 */
export const optimizeWeeklyLineup = (
  team: Team,
  week: number,
  format: ScoringFormat
) => {
  const allPlayers = team.roster.all;

  // Simulate scores for all rostered players
  const playerWeeklyScores = allPlayers.map(player => ({
    player,
    isOnBye: player.byeWeek === week,
    score: simulatePlayerWeek(player, week, format),
  }));

  // Separate by position (sort highest scored first)
  const byPosition = (pos: string) =>
    playerWeeklyScores
      .filter(p => p.player.position === pos && !p.isOnBye)
      .sort((a, b) => b.score - a.score);

  const qbs = byPosition('QB');
  const rbs = byPosition('RB');
  const wrs = byPosition('WR');
  const tes = byPosition('TE');
  const ks = byPosition('K');
  const defs = byPosition('DEF');

  const starters: { slot: string; player: Player; points: number }[] = [];
  const usedPlayerIds = new Set<string>();

  // 1 QB
  if (qbs.length > 0) {
    starters.push({ slot: 'QB', player: qbs[0].player, points: qbs[0].score });
    usedPlayerIds.add(qbs[0].player.id);
  }

  // 2 RBs
  rbs.slice(0, 2).forEach((p, idx) => {
    starters.push({ slot: `RB${idx + 1}`, player: p.player, points: p.score });
    usedPlayerIds.add(p.player.id);
  });

  // 2 WRs
  wrs.slice(0, 2).forEach((p, idx) => {
    starters.push({ slot: `WR${idx + 1}`, player: p.player, points: p.score });
    usedPlayerIds.add(p.player.id);
  });

  // 1 TE
  if (tes.length > 0) {
    starters.push({ slot: 'TE', player: tes[0].player, points: tes[0].score });
    usedPlayerIds.add(tes[0].player.id);
  }

  // 1 FLEX (best remaining RB, WR, or TE)
  const remainingFlexOptions = playerWeeklyScores
    .filter(
      p =>
        !usedPlayerIds.has(p.player.id) &&
        !p.isOnBye &&
        ['RB', 'WR', 'TE'].includes(p.player.position)
    )
    .sort((a, b) => b.score - a.score);

  if (remainingFlexOptions.length > 0) {
    starters.push({
      slot: 'FLEX',
      player: remainingFlexOptions[0].player,
      points: remainingFlexOptions[0].score,
    });
    usedPlayerIds.add(remainingFlexOptions[0].player.id);
  }

  // 1 K
  if (ks.length > 0) {
    starters.push({ slot: 'K', player: ks[0].player, points: ks[0].score });
    usedPlayerIds.add(ks[0].player.id);
  }

  // 1 DEF
  if (defs.length > 0) {
    starters.push({ slot: 'DEF', player: defs[0].player, points: defs[0].score });
    usedPlayerIds.add(defs[0].player.id);
  }

  // Remaining players go to bench
  const bench = playerWeeklyScores
    .filter(p => !usedPlayerIds.has(p.player.id))
    .map(p => ({ player: p.player, points: p.score }));

  const totalStarterScore = Math.round(starters.reduce((sum, s) => sum + s.points, 0) * 10) / 10;

  return {
    starters,
    bench,
    totalScore: totalStarterScore,
  };
};

/**
 * Runs a complete 14-week regular season simulation + Playoffs
 */
export const simulateFullSeason = (
  teams: Team[],
  format: ScoringFormat
): SeasonSimulationResult => {
  const schedule = generateRegularSeasonSchedule(teams);
  const teamMap = new Map<string, Team>(teams.map(t => [t.id, t]));

  // Track regular season standings stats
  const standingsMap = new Map<string, {
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    streaks: ('W' | 'L' | 'T')[];
  }>();

  teams.forEach(t => {
    standingsMap.set(t.id, {
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      streaks: [],
    });
  });

  const weeks: Matchup[][] = [];

  // Simulate Weeks 1 through 14
  for (let w = 1; w <= 14; w++) {
    const weeklyMatchups: Matchup[] = [];
    const scheduled = schedule[w - 1] || [];

    for (const match of scheduled) {
      const homeTeam = teamMap.get(match.homeTeamId)!;
      const awayTeam = teamMap.get(match.awayTeamId)!;

      const homeResult = optimizeWeeklyLineup(homeTeam, w, format);
      const awayResult = optimizeWeeklyLineup(awayTeam, w, format);

      const homeScore = homeResult.totalScore;
      const awayScore = awayResult.totalScore;

      const homeStats = standingsMap.get(homeTeam.id)!;
      const awayStats = standingsMap.get(awayTeam.id)!;

      homeStats.pointsFor += homeScore;
      homeStats.pointsAgainst += awayScore;
      awayStats.pointsFor += awayScore;
      awayStats.pointsAgainst += homeScore;

      if (homeScore > awayScore) {
        homeStats.wins++;
        homeStats.streaks.push('W');
        awayStats.losses++;
        awayStats.streaks.push('L');
      } else if (awayScore > homeScore) {
        awayStats.wins++;
        awayStats.streaks.push('W');
        homeStats.losses++;
        homeStats.streaks.push('L');
      } else {
        homeStats.ties++;
        homeStats.streaks.push('T');
        awayStats.ties++;
        awayStats.streaks.push('T');
      }

      weeklyMatchups.push({
        week: w,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeScore,
        awayScore,
        homeStarters: homeResult.starters,
        awayStarters: awayResult.starters,
        homeBench: homeResult.bench,
        awayBench: awayResult.bench,
      });
    }

    weeks.push(weeklyMatchups);
  }

  // Calculate final regular season standings
  const standings: TeamStanding[] = teams.map(t => {
    const s = standingsMap.get(t.id)!;
    const totalGames = s.wins + s.losses + s.ties;
    const winPercentage = totalGames > 0 ? (s.wins + s.ties * 0.5) / totalGames : 0;

    // Calculate streak
    let streakCount = 0;
    let streakType = '';
    for (let i = s.streaks.length - 1; i >= 0; i--) {
      if (streakType === '') {
        streakType = s.streaks[i];
        streakCount = 1;
      } else if (s.streaks[i] === streakType) {
        streakCount++;
      } else {
        break;
      }
    }

    return {
      teamId: t.id,
      teamName: t.name,
      isUser: t.isUser,
      strategy: t.strategy,
      wins: s.wins,
      losses: s.losses,
      ties: s.ties,
      winPercentage: Math.round(winPercentage * 1000) / 1000,
      pointsFor: Math.round(s.pointsFor * 10) / 10,
      pointsAgainst: Math.round(s.pointsAgainst * 10) / 10,
      streak: `${streakType}${streakCount}`,
    };
  });

  // Sort standings: Primary: Win %, Secondary: Points For, Tertiary: Points Against
  standings.sort((a, b) => {
    if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
    return b.pointsAgainst - a.pointsAgainst;
  });

  // Assign playoff seeds
  standings.forEach((st, idx) => {
    st.playoffSeed = idx + 1;
  });

  // Simulate Playoffs: Top 4 teams
  const seed1 = teamMap.get(standings[0].teamId)!;
  const seed2 = teamMap.get(standings[1].teamId)!;
  const seed3 = teamMap.get(standings[2].teamId)!;
  const seed4 = teamMap.get(standings[3].teamId)!;

  // Semifinals (Week 15): Seed 1 vs 4, Seed 2 vs 3
  const semi1ResultHome = optimizeWeeklyLineup(seed1, 15, format);
  const semi1ResultAway = optimizeWeeklyLineup(seed4, 15, format);
  const semi1Winner = semi1ResultHome.totalScore >= semi1ResultAway.totalScore ? seed1 : seed4;
  const semi1Loser = semi1Winner.id === seed1.id ? seed4 : seed1;

  const semi2ResultHome = optimizeWeeklyLineup(seed2, 15, format);
  const semi2ResultAway = optimizeWeeklyLineup(seed3, 15, format);
  const semi2Winner = semi2ResultHome.totalScore >= semi2ResultAway.totalScore ? seed2 : seed3;
  const semi2Loser = semi2Winner.id === seed2.id ? seed3 : seed2;

  // Championship Game (Week 16)
  const champHome = optimizeWeeklyLineup(semi1Winner, 16, format);
  const champAway = optimizeWeeklyLineup(semi2Winner, 16, format);
  const champion = champHome.totalScore >= champAway.totalScore ? semi1Winner : semi2Winner;
  const runnerUp = champion.id === semi1Winner.id ? semi2Winner : semi1Winner;

  // 3rd Place Consolation Game (Week 16)
  const thirdHome = optimizeWeeklyLineup(semi1Loser, 16, format);
  const thirdAway = optimizeWeeklyLineup(semi2Loser, 16, format);
  const thirdPlace = thirdHome.totalScore >= thirdAway.totalScore ? semi1Loser : semi2Loser;

  // Update final ranks in standings
  standings.forEach(st => {
    if (st.teamId === champion.id) st.finalRank = 1;
    else if (st.teamId === runnerUp.id) st.finalRank = 2;
    else if (st.teamId === thirdPlace.id) st.finalRank = 3;
    else if (st.teamId === (thirdPlace.id === semi1Loser.id ? semi2Loser.id : semi1Loser.id)) st.finalRank = 4;
    else st.finalRank = st.playoffSeed;
  });

  const playoffMatchups: PlayoffMatchup[] = [
    {
      id: 'semi-1',
      round: 'semifinal',
      week: 15,
      team1Id: seed1.id,
      team2Id: seed4.id,
      team1Score: semi1ResultHome.totalScore,
      team2Score: semi1ResultAway.totalScore,
      winnerId: semi1Winner.id,
      loserId: semi1Loser.id,
    },
    {
      id: 'semi-2',
      round: 'semifinal',
      week: 15,
      team1Id: seed2.id,
      team2Id: seed3.id,
      team1Score: semi2ResultHome.totalScore,
      team2Score: semi2ResultAway.totalScore,
      winnerId: semi2Winner.id,
      loserId: semi2Loser.id,
    },
    {
      id: 'champ',
      round: 'final',
      week: 16,
      team1Id: semi1Winner.id,
      team2Id: semi2Winner.id,
      team1Score: champHome.totalScore,
      team2Score: champAway.totalScore,
      winnerId: champion.id,
      loserId: runnerUp.id,
    },
    {
      id: 'third',
      round: 'thirdPlace',
      week: 16,
      team1Id: semi1Loser.id,
      team2Id: semi2Loser.id,
      team1Score: thirdHome.totalScore,
      team2Score: thirdAway.totalScore,
      winnerId: thirdPlace.id,
      loserId: thirdPlace.id === semi1Loser.id ? semi2Loser.id : semi1Loser.id,
    },
  ];

  return {
    weeks,
    standings,
    playoffMatchups,
    championId: champion.id,
    runnerUpId: runnerUp.id,
    thirdPlaceId: thirdPlace.id,
  };
};
