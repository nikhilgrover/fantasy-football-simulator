import { useState, type FC } from 'react';
import type { Team, ScoringFormat, Player } from '../types';
import { getPlayerProjectedWeeklyPoints } from '../data/scoringRules';
import { Users, Info, Shield } from 'lucide-react';

interface RostersViewProps {
  teams: Team[];
  scoringFormat: ScoringFormat;
  onSelectPlayerModal: (player: Player) => void;
}

export const RostersView: FC<RostersViewProps> = ({
  teams,
  scoringFormat,
  onSelectPlayerModal,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    teams.find(t => t.isUser)?.id || teams[0]?.id || ''
  );

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const posColorMap: Record<string, string> = {
    QB: 'bg-red-500/20 text-red-400 border-red-500/30',
    RB: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    WR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    TE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    K: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    DEF: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  if (!selectedTeam) return null;

  // Compute total starting projected points
  const startingLineup = [
    { slot: 'QB', player: selectedTeam.roster.qb[0] },
    { slot: 'RB1', player: selectedTeam.roster.rb[0] },
    { slot: 'RB2', player: selectedTeam.roster.rb[1] },
    { slot: 'WR1', player: selectedTeam.roster.wr[0] },
    { slot: 'WR2', player: selectedTeam.roster.wr[1] },
    { slot: 'TE', player: selectedTeam.roster.te[0] },
    { slot: 'FLEX', player: selectedTeam.roster.rb[2] || selectedTeam.roster.wr[2] || selectedTeam.roster.te[1] },
    { slot: 'K', player: selectedTeam.roster.k[0] },
    { slot: 'DEF', player: selectedTeam.roster.def[0] },
  ];

  const totalStarterPts = startingLineup.reduce((sum, item) => {
    if (!item.player) return sum;
    return sum + getPlayerProjectedWeeklyPoints(item.player.projectedMean, item.player.position, scoringFormat);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Team Selector Horizontal Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Select Team to Inspect
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {teams.map(t => {
            const isSelected = t.id === selectedTeamId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-950 scale-102'
                    : 'bg-slate-800/80 border-slate-750 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: t.avatarColor }}
                ></span>
                <span>{t.name}</span>
                {t.isUser && (
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                    YOU
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Team Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg"
              style={{ backgroundColor: selectedTeam.avatarColor }}
            >
              {selectedTeam.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{selectedTeam.name}</h3>
                {selectedTeam.isUser && (
                  <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    Your Team
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Draft Slot #{selectedTeam.draftSlot} • Strategy: <span className="text-emerald-400 uppercase font-semibold">{selectedTeam.strategy}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-xl text-right">
            <span className="text-xs text-slate-400 block uppercase">Projected Weekly Starters</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {totalStarterPts.toFixed(1)} <span className="text-xs font-normal text-slate-400">pts/wk</span>
            </span>
          </div>
        </div>

        {/* Rosters Split: Starters vs Bench */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Starters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Starting Lineup
            </h4>
            <div className="space-y-2">
              {startingLineup.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-750 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 font-bold text-slate-400">{item.slot}</span>
                    {item.player ? (
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${posColorMap[item.player.position]}`}>
                          {item.player.position}
                        </span>
                        <span className="font-semibold text-white text-sm">{item.player.name}</span>
                        <span className="text-slate-400">({item.player.team})</span>
                        {item.player.isRookie && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">
                            ROOKIE
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Empty</span>
                    )}
                  </div>

                  {item.player && (
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400">
                        {getPlayerProjectedWeeklyPoints(item.player.projectedMean, item.player.position, scoringFormat)} pts
                      </span>
                      <button
                        onClick={() => onSelectPlayerModal(item.player!)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bench */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Bench Depth
            </h4>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => {
                const player = selectedTeam.roster.bench[idx] || null;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-bold text-slate-500">BN{idx + 1}</span>
                      {player ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${posColorMap[player.position]}`}>
                            {player.position}
                          </span>
                          <span className="font-semibold text-slate-200 text-sm">{player.name}</span>
                          <span className="text-slate-400">({player.team})</span>
                          {player.isRookie && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">
                              ROOKIE
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Empty Slot</span>
                      )}
                    </div>

                    {player && (
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-slate-400">
                          {getPlayerProjectedWeeklyPoints(player.projectedMean, player.position, scoringFormat)} pts
                        </span>
                        <button
                          onClick={() => onSelectPlayerModal(player)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
