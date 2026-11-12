import type { ScoringFormat, PlayerStats, Position } from '../types';

export const calculatePoints = (
  stats: Partial<PlayerStats>,
  format: ScoringFormat
): number => {
  let p = 0;
  // Passing: 1 pt per 25 yds (0.04), 4 pt per TD, -2 per INT
  p += (stats.passYds || 0) * 0.04;
  p += (stats.passTds || 0) * 4;
  p -= (stats.int || 0) * 2;

  // Rushing: 1 pt per 10 yds (0.1), 6 pt per TD
  p += (stats.rushYds || 0) * 0.1;
  p += (stats.rushTds || 0) * 6;

  // Receiving: 1 pt per 10 yds (0.1), 6 pt per TD
  p += (stats.recYds || 0) * 0.1;
  p += (stats.recTds || 0) * 6;

  // Receptions based on format:
  if (format === 'fullPpr') {
    p += (stats.receptions || 0) * 1.0;
  } else if (format === 'halfPpr') {
    p += (stats.receptions || 0) * 0.5;
  }

  // Fumbles lost: -2
  p -= (stats.fumblesLost || 0) * 2;

  return Math.round(p * 100) / 100;
};

export const getPlayerProjectedWeeklyPoints = (
  mean: number,
  position: Position,
  format: ScoringFormat
): number => {
  let multiplier = 1.0;
  if (format === 'fullPpr') {
    if (position === 'WR') multiplier = 1.15;
    else if (position === 'RB') multiplier = 1.08;
    else if (position === 'TE') multiplier = 1.12;
    else multiplier = 1.0;
  } else if (format === 'standard') {
    if (position === 'WR') multiplier = 0.85;
    else if (position === 'RB') multiplier = 0.92;
    else if (position === 'TE') multiplier = 0.88;
    else multiplier = 1.0;
  }
  return Math.round(mean * multiplier * 10) / 10;
};
