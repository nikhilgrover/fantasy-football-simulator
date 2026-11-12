import type { Team, Player, Position, ScoringFormat } from '../types';
import { getPlayerProjectedWeeklyPoints } from '../data/scoringRules';

/**
 * Calculates positional counts currently on a team
 */
export const getPositionalCounts = (team: Team) => {
  const counts: Record<Position, number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
    K: 0,
    DEF: 0,
  };

  for (const p of team.roster.all) {
    counts[p.position] = (counts[p.position] || 0) + 1;
  }

  return counts;
};

/**
 * AI pick decision maker considering team strategy, draft round, and roster needs.
 */
export const selectBestPlayerForTeam = (
  team: Team,
  availablePlayers: Player[],
  round: number,
  format: ScoringFormat
): Player => {
  const counts = getPositionalCounts(team);
  const strategy = team.strategy;

  // Final rounds (14 & 15) are strictly for K & DEF
  if (round >= 14) {
    if (counts.K === 0 && counts.DEF === 0) {
      // Pick highest projected between available K and DEF
      const options = availablePlayers.filter(p => p.position === 'K' || p.position === 'DEF');
      if (options.length > 0) return options[0];
    } else if (counts.K === 0) {
      const k = availablePlayers.find(p => p.position === 'K');
      if (k) return k;
    } else if (counts.DEF === 0) {
      const def = availablePlayers.find(p => p.position === 'DEF');
      if (def) return def;
    }
  }

  // Filter out positions that are capped before round 14:
  // - Maximum 2 QBs
  // - Maximum 2 TEs
  // - 0 K before round 14
  // - 0 DEF before round 14
  // - Maximum 6 RBs, Maximum 7 WRs
  let eligible = availablePlayers.filter(p => {
    if (round < 14 && (p.position === 'K' || p.position === 'DEF')) return false;
    if (p.position === 'QB' && counts.QB >= 2) return false;
    if (p.position === 'TE' && counts.TE >= 2) return false;
    if (p.position === 'RB' && counts.RB >= 6) return false;
    if (p.position === 'WR' && counts.WR >= 7) return false;
    return true;
  });

  if (eligible.length === 0) eligible = availablePlayers;

  // Score candidate players using Value Over Replacement (VORP) adjusted by strategy
  const scored = eligible.slice(0, 40).map(player => {
    let score = 100 - player.adp * 0.4; // Base ADP priority
    const weeklyPts = getPlayerProjectedWeeklyPoints(player.projectedMean, player.position, format);
    score += weeklyPts * 2.5;

    // Apply Strategy Adjustments:
    if (strategy === 'zeroRb') {
      if (round <= 5) {
        if (player.position === 'RB') score -= 50; // De-prioritize RB early
        if (player.position === 'WR') score += 15;
        if (player.position === 'TE' && counts.TE === 0) score += 10;
        if (player.position === 'QB' && counts.QB === 0 && round >= 3) score += 8;
      } else if (round >= 6 && round <= 11) {
        if (player.position === 'RB') score += 30; // Heavy RB catch-up
      }
    } else if (strategy === 'heroRb') {
      if (counts.RB === 0 && round <= 2) {
        if (player.position === 'RB') score += 35; // Anchor RB in round 1 or 2
      } else if (counts.RB === 1 && round <= 6) {
        if (player.position === 'RB') score -= 35; // Delay 2nd RB
        if (player.position === 'WR') score += 12;
      } else if (round >= 7) {
        if (player.position === 'RB' && counts.RB < 4) score += 20;
      }
    } else if (strategy === 'robustRb') {
      if (round <= 4 && counts.RB < 3) {
        if (player.position === 'RB') score += 35; // Hammer RBs first 4 rounds
      }
    } else if (strategy === 'eliteQb') {
      if (counts.QB === 0 && (round === 2 || round === 3) && player.position === 'QB') {
        score += 35; // Grab elite QB early
      } else if (counts.QB >= 1 && player.position === 'QB') {
        score -= 60;
      }
    } else if (strategy === 'eliteTe') {
      if (counts.TE === 0 && (round === 2 || round === 3) && player.position === 'TE') {
        score += 35; // Grab elite TE early
      } else if (counts.TE >= 1 && player.position === 'TE') {
        score -= 60;
      }
    } else if (strategy === 'balanced') {
      // Prioritize filling starters first
      if (counts.QB === 0 && round >= 5 && player.position === 'QB') score += 15;
      if (counts.TE === 0 && round >= 5 && player.position === 'TE') score += 15;
      if (counts.RB < 2 && player.position === 'RB') score += 12;
      if (counts.WR < 2 && player.position === 'WR') score += 12;
    }

    // Never take a backup QB or TE before round 10
    if (round < 10) {
      if (player.position === 'QB' && counts.QB >= 1) score -= 80;
      if (player.position === 'TE' && counts.TE >= 1) score -= 80;
    }

    return { player, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.player || eligible[0] || availablePlayers[0];
};
