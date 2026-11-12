import type { FC } from 'react';
import type { Player, ScoringFormat } from '../types';
import { getPlayerProjectedWeeklyPoints } from '../data/scoringRules';
import { X, Award, Zap, TrendingUp } from 'lucide-react';

interface PlayerCardModalProps {
  player: Player | null;
  format: ScoringFormat;
  onClose: () => void;
  onDraft?: (player: Player) => void;
  canDraft?: boolean;
}

export const PlayerCardModal: FC<PlayerCardModalProps> = ({
  player,
  format,
  onClose,
  onDraft,
  canDraft,
}) => {
  if (!player) return null;

  const weeklyPts = getPlayerProjectedWeeklyPoints(player.projectedMean, player.position, format);
  const floorPts = Math.max(0, Math.round((player.projectedMean - player.projectedStdDev * 1.2) * 10) / 10);
  const ceilingPts = Math.round((player.projectedMean + player.projectedStdDev * 1.5) * 10) / 10;

  const posColorMap: Record<string, string> = {
    QB: 'bg-red-500/20 text-red-400 border-red-500/30',
    RB: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    WR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    TE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    K: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    DEF: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-750 border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${posColorMap[player.position]}`}>
              {player.position}
            </span>
            <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              {player.team} • Bye Wk {player.byeWeek}
            </span>
            {player.isRookie && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Zap className="w-3 h-3 text-emerald-400" />
                Rookie
              </span>
            )}
            <span className="text-xs text-slate-400">
              ADP: <strong className="text-slate-200">#{player.adp.toFixed(1)}</strong>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">{player.name}</h2>
          {player.notes && (
            <p className="mt-2 text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-750">
              {player.notes}
            </p>
          )}
        </div>

        {/* Projections & Boom/Bust Metrics */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Proj Weekly</span>
              <span className="text-2xl font-extrabold text-emerald-400">{weeklyPts}</span>
              <span className="text-xs text-slate-400 block mt-0.5">pts / game</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Floor (10th%)</span>
              <span className="text-2xl font-bold text-slate-300">{floorPts}</span>
              <span className="text-xs text-slate-400 block mt-0.5">pts</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Ceiling (90th%)</span>
              <span className="text-2xl font-bold text-amber-400">{ceilingPts}</span>
              <span className="text-xs text-slate-400 block mt-0.5">pts</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Tier</span>
              <span className="text-2xl font-bold text-purple-400">Tier {player.tier}</span>
              <span className="text-xs text-slate-400 block mt-0.5">Ranked</span>
            </div>
          </div>

          {/* 2025 Projected Stat Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              2025 Full Season Projections
            </h3>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-750">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {player.position === 'QB' && (
                  <>
                    <div>
                      <div className="text-xs text-slate-400">Pass Yds</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.passYds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Pass TDs / INT</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.passTds} / {player.projections2025.int}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Rush Yds</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.rushYds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Rush TDs</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.rushTds}</div>
                    </div>
                  </>
                )}
                {player.position === 'RB' && (
                  <>
                    <div>
                      <div className="text-xs text-slate-400">Rush Yds</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.rushYds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Rush TDs</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.rushTds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Receptions</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.receptions}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Rec Yds / TDs</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.recYds} / {player.projections2025.recTds}</div>
                    </div>
                  </>
                )}
                {(player.position === 'WR' || player.position === 'TE') && (
                  <>
                    <div>
                      <div className="text-xs text-slate-400">Receptions</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.receptions}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Rec Yds</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.recYds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Rec TDs</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.recTds}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Avg YPR</div>
                      <div className="text-lg font-bold text-white">
                        {player.projections2025.receptions > 0 
                          ? (player.projections2025.recYds / player.projections2025.receptions).toFixed(1) 
                          : '0.0'}
                      </div>
                    </div>
                  </>
                )}
                {(player.position === 'K' || player.position === 'DEF') && (
                  <>
                    <div>
                      <div className="text-xs text-slate-400">Total Proj Pts</div>
                      <div className="text-lg font-bold text-white">{player.projections2025.pointsHalfPpr}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Weekly Consistency</div>
                      <div className="text-lg font-bold text-white">±{player.projectedStdDev} pts</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Historical Seasons */}
          {player.historical && Object.keys(player.historical).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
                Historical Fantasy Performance
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-750">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Season</th>
                      <th className="p-2.5">Pass/Rush Yds</th>
                      <th className="p-2.5">Total TDs</th>
                      <th className="p-2.5">Receptions</th>
                      <th className="p-2.5 text-right">Fantasy Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {Object.entries(player.historical).map(([year, st]) => (
                      <tr key={year} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-white">{year}</td>
                        <td className="p-2.5">
                          {player.position === 'QB' 
                            ? `${st.passYds} pass, ${st.rushYds} rush` 
                            : `${st.rushYds + st.recYds} total yds`}
                        </td>
                        <td className="p-2.5 font-medium text-emerald-400">
                          {st.passTds + st.rushTds + st.recTds} TDs
                        </td>
                        <td className="p-2.5">{st.receptions} rec</td>
                        <td className="p-2.5 text-right font-bold text-amber-400">
                          {format === 'fullPpr' ? st.pointsFullPpr : format === 'standard' ? st.pointsStandard : st.pointsHalfPpr} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          {canDraft && onDraft && (
            <button
              onClick={() => {
                onDraft(player);
                onClose();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Draft {player.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
