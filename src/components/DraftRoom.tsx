import { useState, useMemo, type FC } from 'react';
import type { Player, Team, ScoringFormat, DraftPick } from '../types';
import { getPlayerProjectedWeeklyPoints } from '../data/scoringRules';
import type { DraftSlotInfo } from '../engine/draftEngine';
import { Search, Play, FastForward, RotateCcw, Award, Info, Zap, CheckCircle2, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DraftRoomProps {
  teams: Team[];
  availablePlayers: Player[];
  allPicks: DraftSlotInfo[];
  pickHistory: DraftPick[];
  currentPickIndex: number; // 0-based
  scoringFormat: ScoringFormat;
  onDraftPlayer: (player: Player) => void;
  onSimPick: () => void;
  onSimToUserPick: () => void;
  onSimAll: () => void;
  onResetDraft: () => void;
  onSelectPlayerModal: (player: Player) => void;
}

export const DraftRoom: FC<DraftRoomProps> = ({
  teams,
  availablePlayers,
  allPicks,
  pickHistory,
  currentPickIndex,
  scoringFormat,
  onDraftPlayer,
  onSimPick,
  onSimToUserPick,
  onSimAll,
  onResetDraft,
  onSelectPlayerModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [rookiesOnly, setRookiesOnly] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'roster' | 'board'>('roster');

  const isDraftComplete = currentPickIndex >= allPicks.length;
  const currentPickInfo = isDraftComplete ? null : allPicks[currentPickIndex];
  const currentTeam = currentPickInfo ? teams[currentPickInfo.teamIndex] : null;
  const isUserTurn = currentTeam?.isUser || false;

  const userTeam = teams.find(t => t.isUser) || teams[0];

  // Filter available players
  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesTeam = p.team.toLowerCase().includes(q);
        if (!matchesName && !matchesTeam) return false;
      }
      if (rookiesOnly && !p.isRookie) return false;
      if (selectedPos !== 'ALL' && p.position !== selectedPos) return false;
      return true;
    });
  }, [availablePlayers, search, selectedPos, rookiesOnly]);

  const selectedPlayer = useMemo(() => {
    return availablePlayers.find(p => p.id === selectedPlayerId) || filteredPlayers[0] || null;
  }, [availablePlayers, selectedPlayerId, filteredPlayers]);

  const handleDraftCurrent = () => {
    if (!selectedPlayer || !isUserTurn || isDraftComplete) return;
    onDraftPlayer(selectedPlayer);
    setSelectedPlayerId(null);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  const posColorMap: Record<string, string> = {
    QB: 'bg-red-500/20 text-red-400 border-red-500/30',
    RB: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    WR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    TE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    K: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    DEF: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Draft Command Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status info */}
          <div className="flex flex-wrap items-center gap-3">
            {!isDraftComplete && currentPickInfo ? (
              <>
                <div className="bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Round</span>
                  <span className="text-lg font-bold text-white">{currentPickInfo.round}</span>
                  <span className="text-xs font-semibold text-slate-500">•</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Pick</span>
                  <span className="text-lg font-bold text-emerald-400">{currentPickInfo.pickInRound}</span>
                  <span className="text-xs text-slate-500">(#{currentPickInfo.overallPick} overall)</span>
                </div>

                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 transition-all ${
                  isUserTurn 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse' 
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs uppercase font-semibold text-slate-400">On The Clock:</span>
                  <strong className="text-sm font-bold text-white">{currentTeam?.name}</strong>
                  {isUserTurn && (
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 ml-1">
                      Your Turn
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500 px-4 py-2 rounded-xl text-emerald-300 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Draft Complete! Proceed to Season Simulation
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isDraftComplete && (
              <>
                {isUserTurn ? (
                  <button
                    onClick={handleDraftCurrent}
                    disabled={!selectedPlayer}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
                  >
                    <Award className="w-4 h-4" />
                    Draft {selectedPlayer?.name || 'Player'}
                  </button>
                ) : (
                  <button
                    onClick={onSimPick}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-400" />
                    Sim Pick
                  </button>
                )}

                <button
                  onClick={onSimToUserPick}
                  className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Sim to My Turn
                </button>

                <button
                  onClick={onSimAll}
                  className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <FastForward className="w-3.5 h-3.5 text-purple-400" />
                  Fast-Forward Draft
                </button>
              </>
            )}

            <button
              onClick={onResetDraft}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-750 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors ml-auto sm:ml-0"
              title="Reset Draft"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Draft Room Workspace: Left = Players, Right = Roster / Draft Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Available Players (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search player or team..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Rookie filter toggle */}
            <button
              onClick={() => setRookiesOnly(!rookiesOnly)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                rookiesOnly
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Rookies Only
            </button>
          </div>

          {/* Positional filter tabs */}
          <div className="flex flex-wrap gap-1.5 pb-3 border-b border-slate-800 mb-3">
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPos(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPos === pos
                    ? 'bg-slate-100 text-slate-900 shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {pos}
              </button>
            ))}
            <span className="text-xs text-slate-400 ml-auto self-center">
              {filteredPlayers.length} available
            </span>
          </div>

          {/* Players Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/90 text-slate-400 uppercase font-semibold sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="p-2.5">Pos</th>
                  <th className="p-2.5">Player</th>
                  <th className="p-2.5">Bye</th>
                  <th className="p-2.5">ADP</th>
                  <th className="p-2.5">Proj PPG</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPlayers.slice(0, 50).map(player => {
                  const isSelected = selectedPlayer?.id === player.id;
                  const ppg = getPlayerProjectedWeeklyPoints(player.projectedMean, player.position, scoringFormat);

                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/40 border-l-4 border-emerald-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${posColorMap[player.position]}`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{player.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">({player.team})</span>
                          {player.isRookie && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                              ROOKIE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-400">Wk {player.byeWeek}</td>
                      <td className="p-2.5 text-slate-300 font-mono">#{player.adp.toFixed(1)}</td>
                      <td className="p-2.5 font-bold text-emerald-400 font-mono">{ppg}</td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onSelectPlayerModal(player);
                            }}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/60"
                            title="Player Scouting Info"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {isUserTurn && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                onDraftPlayer(player);
                                confetti({ particleCount: 30, spread: 50 });
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px]"
                            >
                              Draft
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: User Roster OR Live Board (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          {/* Header Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRightTab('roster')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  rightTab === 'roster'
                    ? 'bg-emerald-500/20 border border-emerald-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Roster ({userTeam.roster.all.length}/15)
              </button>
              <button
                onClick={() => setRightTab('board')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  rightTab === 'board'
                    ? 'bg-blue-500/20 border border-blue-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Draft Board
              </button>
            </div>
          </div>

          {rightTab === 'roster' ? (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Starting Lineup
                </span>
                <div className="space-y-1.5">
                  {[
                    { slot: 'QB', player: userTeam.roster.qb[0] },
                    { slot: 'RB1', player: userTeam.roster.rb[0] },
                    { slot: 'RB2', player: userTeam.roster.rb[1] },
                    { slot: 'WR1', player: userTeam.roster.wr[0] },
                    { slot: 'WR2', player: userTeam.roster.wr[1] },
                    { slot: 'TE', player: userTeam.roster.te[0] },
                    { 
                      slot: 'FLEX', 
                      player: userTeam.roster.rb[2] || userTeam.roster.wr[2] || userTeam.roster.te[1] 
                    },
                    { slot: 'K', player: userTeam.roster.k[0] },
                    { slot: 'DEF', player: userTeam.roster.def[0] },
                  ].map(({ slot, player }, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-750 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-10 font-bold text-slate-400">{slot}</span>
                        {player ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{player.name}</span>
                            <span className="text-[11px] text-slate-400">({player.team})</span>
                            {player.isRookie && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">
                                R
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Empty Slot</span>
                        )}
                      </div>
                      {player && (
                        <span className="font-mono font-bold text-emerald-400">
                          {getPlayerProjectedWeeklyPoints(player.projectedMean, player.position, scoringFormat)} pts
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bench */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Bench (6 Slots)
                </span>
                <div className="space-y-1.5">
                  {Array.from({ length: 6 }).map((_, i) => {
                    // Extract players beyond starting requirements
                    const benchPlayer = userTeam.roster.bench[i] || null;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-8 font-semibold text-slate-500">BN{i + 1}</span>
                          {benchPlayer ? (
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${posColorMap[benchPlayer.position]}`}>
                                {benchPlayer.position}
                              </span>
                              <span className="font-semibold text-slate-200">{benchPlayer.name}</span>
                              <span className="text-slate-400">({benchPlayer.team})</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">Empty Bench</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Live Board / Pick History */
            <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Recent Picks ({pickHistory.length} of {allPicks.length})
              </span>
              {pickHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No picks made yet. Start drafting!
                </div>
              ) : (
                <div className="space-y-2">
                  {[...pickHistory].reverse().map(pick => {
                    const team = teams.find(t => t.id === pick.teamId);
                    return (
                      <div
                        key={pick.overallPick}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          team?.isUser
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-slate-800/50 border-slate-750'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400 w-8">
                            #{pick.overallPick}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${posColorMap[pick.player.position]}`}>
                            {pick.player.position}
                          </span>
                          <div>
                            <span className="font-semibold text-white">{pick.player.name}</span>
                            <span className="text-slate-400 text-[11px] block">
                              to <strong className="text-slate-200">{team?.name}</strong> (Rd {pick.round}, Pick {pick.pickInRound})
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          {getPlayerProjectedWeeklyPoints(pick.player.projectedMean, pick.player.position, scoringFormat)} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
