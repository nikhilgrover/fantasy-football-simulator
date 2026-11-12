import { useState, type FC } from 'react';
import type { SeasonSimulationResult, Team, Matchup } from '../types';
import { ChevronDown, ChevronUp, Trophy, Zap, Play, Calendar, AlertCircle } from 'lucide-react';

interface SeasonViewProps {
  simulationResult: SeasonSimulationResult | null;
  teams: Team[];
  onRunSimulation: () => void;
  isDraftComplete: boolean;
}

export const SeasonView: FC<SeasonViewProps> = ({
  simulationResult,
  teams,
  onRunSimulation,
  isDraftComplete,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [expandedMatchupIdx, setExpandedMatchupIdx] = useState<number | null>(null);

  if (!isDraftComplete) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Draft Not Finished</h3>
        <p className="text-sm text-slate-400">
          Complete the 15-round draft in the Draft Room first, or click "Fast-Forward Draft" to immediately simulate the season.
        </p>
      </div>
    );
  }

  if (!simulationResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
          <Play className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Ready for Season Simulation</h3>
        <p className="text-sm text-slate-400">
          All teams are drafted! Run the 14-week head-to-head regular season simulation with start/sit optimization.
        </p>
        <button
          onClick={onRunSimulation}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          Simulate 14-Week Season
        </button>
      </div>
    );
  }

  const teamMap = new Map<string, Team>(teams.map(t => [t.id, t]));
  const weekMatchups: Matchup[] = simulationResult.weeks[selectedWeek - 1] || [];

  // Top scorer of the week
  let topScorerTeam = '';
  let topScore = 0;
  weekMatchups.forEach(m => {
    if (m.homeScore > topScore) {
      topScore = m.homeScore;
      topScorerTeam = teamMap.get(m.homeTeamId)?.name || '';
    }
    if (m.awayScore > topScore) {
      topScore = m.awayScore;
      topScorerTeam = teamMap.get(m.awayTeamId)?.name || '';
    }
  });

  return (
    <div className="space-y-6">
      {/* Week Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold text-white">Regular Season Schedule:</span>
        </div>

        {/* 14 Weeks tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {Array.from({ length: 14 }, (_, i) => i + 1).map(w => (
            <button
              key={w}
              onClick={() => {
                setSelectedWeek(w);
                setExpandedMatchupIdx(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWeek === w
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950 scale-105'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              Wk {w}
            </button>
          ))}
        </div>

        <button
          onClick={onRunSimulation}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          Re-simulate Season
        </button>
      </div>

      {/* Week Highlight Pill */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase">Week {selectedWeek} Highest Scorer</div>
            <div className="text-sm font-bold text-white">
              {topScorerTeam} <span className="text-emerald-400">({topScore} pts)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase">Matchups this week</div>
            <div className="text-sm font-bold text-white">{weekMatchups.length} Head-to-Head Games</div>
          </div>
        </div>
      </div>

      {/* Matchups Grid */}
      <div className="space-y-4">
        {weekMatchups.map((matchup, idx) => {
          const home = teamMap.get(matchup.homeTeamId)!;
          const away = teamMap.get(matchup.awayTeamId)!;
          const homeWon = matchup.homeScore > matchup.awayScore;
          const awayWon = matchup.awayScore > matchup.homeScore;
          const isExpanded = expandedMatchupIdx === idx;

          const isUserMatch = home.isUser || away.isUser;

          return (
            <div
              key={idx}
              className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-lg transition-all ${
                isUserMatch ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-slate-800'
              }`}
            >
              {/* Score summary bar */}
              <div 
                className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/50 transition-colors"
                onClick={() => setExpandedMatchupIdx(isExpanded ? null : idx)}
              >
                {/* Away Team */}
                <div className="flex items-center gap-3 flex-1 justify-start">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow"
                    style={{ backgroundColor: away.avatarColor }}
                  >
                    {away.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm sm:text-base">{away.name}</span>
                      {away.isUser && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Away</span>
                  </div>
                </div>

                {/* Score Center Box */}
                <div className="flex items-center gap-4 px-5 py-2 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <span className={`text-xl sm:text-2xl font-mono font-extrabold ${awayWon ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {matchup.awayScore.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">VS</span>
                  <span className={`text-xl sm:text-2xl font-mono font-extrabold ${homeWon ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {matchup.homeScore.toFixed(1)}
                  </span>
                </div>

                {/* Home Team */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      {home.isUser && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                      <span className="font-bold text-white text-sm sm:text-base">{home.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">Home</span>
                  </div>
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow"
                    style={{ backgroundColor: home.avatarColor }}
                  >
                    {home.name[0]}
                  </div>
                </div>

                {/* Toggle details chevron */}
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-white"
                  title="Toggle Box Score"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Detailed Lineup Breakdown Box Score */}
              {isExpanded && (
                <div className="border-t border-slate-800 p-5 bg-slate-950/60 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                    Starters Box Score Duel
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Away Starters */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span>{away.name} (Away)</span>
                        <span className="text-emerald-400">{matchup.awayScore.toFixed(1)} pts</span>
                      </div>
                      {matchup.awayStarters.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-8 font-bold text-slate-400">{s.slot}</span>
                            <span className="font-medium text-slate-100">{s.player.name}</span>
                            <span className="text-[10px] text-slate-400">({s.player.team})</span>
                          </div>
                          <span className="font-mono font-bold text-slate-200">{s.points.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Home Starters */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span>{home.name} (Home)</span>
                        <span className="text-emerald-400">{matchup.homeScore.toFixed(1)} pts</span>
                      </div>
                      {matchup.homeStarters.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-8 font-bold text-slate-400">{s.slot}</span>
                            <span className="font-medium text-slate-100">{s.player.name}</span>
                            <span className="text-[10px] text-slate-400">({s.player.team})</span>
                          </div>
                          <span className="font-mono font-bold text-slate-200">{s.points.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
