import { useState, type FC } from 'react';
import type { StrategyType, LeagueSize, ScoringFormat, MonteCarloStrategyResult } from '../types';
import { runMonteCarloBenchmark } from '../engine/monteCarloSimulator';
import { FlaskConical, Play, BarChart3, Sparkles, CheckSquare, Square } from 'lucide-react';

interface StrategyLabProps {
  leagueSize: LeagueSize;
  scoringFormat: ScoringFormat;
  draftSlot: number;
}

const ALL_STRATEGIES: { id: StrategyType; label: string; desc: string }[] = [
  { id: 'heroRb', label: 'Hero RB', desc: '1 elite RB early (Rd 1-2), then hammer WR/TE/QB' },
  { id: 'zeroRb', label: 'Zero RB', desc: 'Stack WR/TE/QB first 5 rounds, fill high-upside RBs late' },
  { id: 'bpa', label: 'BPA (Best Available)', desc: 'Pure Value-Over-Replacement regardless of position' },
  { id: 'robustRb', label: 'Robust RB', desc: 'Heavy RB start (3+ RBs in rounds 1-4)' },
  { id: 'eliteQb', label: 'Elite QB Early', desc: 'Target Allen, Hurts, or Lamar in rounds 2-3' },
  { id: 'eliteTe', label: 'Elite TE Early', desc: 'Target LaPorta, Kelce, McBride, or Bowers in rounds 2-3' },
  { id: 'balanced', label: 'Balanced Need', desc: 'Even distribution across starting positions' },
];

export const StrategyLab: FC<StrategyLabProps> = ({
  leagueSize,
  scoringFormat,
  draftSlot,
}) => {
  const [selectedStrategies, setSelectedStrategies] = useState<StrategyType[]>([
    'heroRb',
    'zeroRb',
    'bpa',
    'robustRb',
    'eliteQb',
  ]);
  const [numSimulations, setNumSimulations] = useState<number>(50);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MonteCarloStrategyResult[] | null>(null);

  const toggleStrategy = (st: StrategyType) => {
    if (selectedStrategies.includes(st)) {
      if (selectedStrategies.length > 2) {
        setSelectedStrategies(selectedStrategies.filter(s => s !== st));
      }
    } else {
      setSelectedStrategies([...selectedStrategies, st]);
    }
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    // Allow UI to update before blocking simulation
    setTimeout(() => {
      const benchmarkResults = runMonteCarloBenchmark(
        selectedStrategies,
        numSimulations,
        leagueSize,
        scoringFormat,
        draftSlot
      );
      setResults(benchmarkResults);
      setIsRunning(false);
    }, 50);
  };

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
              Monte Carlo Strategy Benchmark
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Which Draft Strategy Actually Wins?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Test draft philosophies against each other by simulating up to 500 complete NFL fantasy seasons. 
              Each iteration simulates 15-round drafts, 14 regular season weeks with player variance, and single-elimination playoffs.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 text-xs text-slate-400">
            <div>Current League: <strong className="text-white">{leagueSize} Teams</strong></div>
            <div>Scoring: <strong className="text-white">{scoringFormat === 'fullPpr' ? 'Full PPR' : scoringFormat === 'halfPpr' ? 'Half PPR' : 'Standard'}</strong></div>
            <div>Testing Slot: <strong className="text-emerald-400">Pick #{draftSlot}</strong></div>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Select Strategies to Compare (Min 2)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_STRATEGIES.map(st => {
              const isChecked = selectedStrategies.includes(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => toggleStrategy(st.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-purple-950/30 border-purple-500/60 text-white shadow'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="font-bold text-sm text-white">{st.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-tight">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Number of seasons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase">Simulated Seasons:</span>
            <div className="flex items-center gap-1.5">
              {[25, 50, 100, 250].map(n => (
                <button
                  key={n}
                  onClick={() => setNumSimulations(n)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    numSimulations === n
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning || selectedStrategies.length < 2}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950 flex items-center justify-center gap-2 transition-all"
          >
            {isRunning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Simulating {numSimulations} Seasons...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run Monte Carlo Benchmark
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Key Takeaway Banner */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 flex items-start gap-3.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300 mb-1">
                Top Performing Strategy: {results[0].name}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                In a {leagueSize}-team league with {scoringFormat === 'fullPpr' ? 'Full PPR' : scoringFormat === 'halfPpr' ? 'Half PPR' : 'Standard'} scoring starting from Draft Slot #{draftSlot}, <strong>{results[0].name}</strong> achieved the highest title rate (<strong>{results[0].championshipRate}%</strong> championships) and reached the playoffs in <strong>{results[0].playoffRate}%</strong> of simulated years.
              </p>
            </div>
          </div>

          {/* Graphical Comparison Bars */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Championship Win Rate %
                </h3>
                <p className="text-xs text-slate-400">Percentage of seasons where this strategy won 1st Place</p>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((r, idx) => {
                const maxRate = Math.max(...results.map(x => x.championshipRate), 1);
                const widthPercent = Math.max(8, (r.championshipRate / maxRate) * 100);

                return (
                  <div key={r.strategy} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-bold text-slate-500">#{idx + 1}</span>
                        <strong className="text-white text-sm">{r.name}</strong>
                      </div>
                      <span className="font-mono font-bold text-purple-300 text-sm">
                        {r.championshipRate}% ({r.championships} titles)
                      </span>
                    </div>

                    <div className="w-full bg-slate-800/80 rounded-full h-3.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-gradient-to-r from-purple-500 to-emerald-400'
                            : 'bg-purple-600/80'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Metrics Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Detailed Strategy Breakdown</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-xs">
                  <tr>
                    <th className="p-3">Strategy</th>
                    <th className="p-3 text-center">Champ %</th>
                    <th className="p-3 text-center">Playoff %</th>
                    <th className="p-3 text-center">Avg Regular Wins</th>
                    <th className="p-3 text-right">Avg Pts / Season</th>
                    <th className="p-3 text-center">Avg Finish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {results.map((r, idx) => (
                    <tr
                      key={r.strategy}
                      className={idx === 0 ? 'bg-purple-950/20 font-semibold' : 'hover:bg-slate-800/30'}
                    >
                      <td className="p-3 text-white font-bold flex items-center gap-2">
                        {idx === 0 && <span className="text-amber-400">👑</span>}
                        {r.name}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-purple-300">
                        {r.championshipRate}%
                      </td>
                      <td className="p-3 text-center font-mono text-emerald-400">
                        {r.playoffRate}%
                      </td>
                      <td className="p-3 text-center font-mono">
                        {r.avgRegularSeasonWins} - {(14 - r.avgRegularSeasonWins).toFixed(1)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-100">
                        {r.avgPointsPerSeason.toFixed(1)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">
                        {r.avgFinalRank.toFixed(1)} / {leagueSize}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
