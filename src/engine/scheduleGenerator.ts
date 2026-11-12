import type { Team } from '../types';

export interface ScheduledMatchup {
  week: number;
  homeTeamId: string;
  awayTeamId: string;
}

/**
 * Generates a round-robin schedule for any even number of teams for 14 regular season weeks.
 */
export const generateRegularSeasonSchedule = (teams: Team[]): ScheduledMatchup[][] => {
  const n = teams.length;
  const numWeeks = 14;
  const teamIds = teams.map(t => t.id);

  // Round-robin scheduling using polygon rotation
  const rounds: [string, string][][] = [];
  const rotatingIds = [...teamIds];

  const totalUniqueRounds = n - 1;

  for (let r = 0; r < totalUniqueRounds; r++) {
    const roundMatchups: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = rotatingIds[i];
      const away = rotatingIds[n - 1 - i];
      roundMatchups.push([home, away]);
    }
    rounds.push(roundMatchups);

    // Rotate array, keeping index 0 fixed
    const fixed = rotatingIds[0];
    const rest = rotatingIds.slice(1);
    const last = rest.pop()!;
    rest.unshift(last);
    rotatingIds.splice(0, n, fixed, ...rest);
  }

  // Repeat/cycle through 14 weeks
  const schedule: ScheduledMatchup[][] = [];
  for (let w = 1; w <= numWeeks; w++) {
    const roundIndex = (w - 1) % totalUniqueRounds;
    const matchupsThisWeek = rounds[roundIndex].map(([home, away]) => ({
      week: w,
      // Alternate home/away if cycled in second half of season
      homeTeamId: w > totalUniqueRounds ? away : home,
      awayTeamId: w > totalUniqueRounds ? home : away,
    }));
    schedule.push(matchupsThisWeek);
  }

  return schedule;
};
