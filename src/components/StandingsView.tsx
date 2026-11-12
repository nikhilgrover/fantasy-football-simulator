import { useEffect, type FC } from 'react';
import type { SeasonSimulationResult, Team } from '../types';
import { Trophy, Medal, Award, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StandingsViewProps {
  simulationResult: SeasonSimulationResult | null;
  teams: Team[];
  onRunSimulation: () => void;
  isDraftComplete: boolean;
}

export const StandingsView: FC<StandingsViewProps> = ({
  simulationResult,
  teams,
  onRunSimulation,
  isDraftComplete,
}) => {
  useEffect(() => {
    if (simulationResult) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [simulationResult]);

  if (!isDraftComplete) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Draft Not Finished</h3>
        <p className="text-sm text-slate-400">
          Complete your draft to simulate the season and generate the final league standings.
        </p>
      </div>
    );
  }

  if (!simulationResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
          <Trophy className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Season Not Yet Simulated</h3>
        <p className="text-sm text-slate-400">
          Click below to run all 14 regular season weeks and the championship playoffs!
        </p>
        <button
          onClick={onRunSimulation}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all inline-flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          Simulate Season & Playoffs
        </button>
      </div>
    );
  }

  const teamMap = new Map<string, Team>(teams.map(t => [t.id, t]));
  const champTeam = teamMap.get(simulationResult.championId);
  const runnerUpTeam = teamMap.get(simulationResult.runnerUpId);
  const thirdTeam = teamMap.get(simulationResult.thirdPlaceId);

  const strategyLabels: Record<string, string> = {
    heroRb: 'Hero RB',
    zeroRb: 'Zero RB',
    bpa: 'BPA',
    robustRb: 'Robust RB',
    eliteQb: 'Elite QB',
    eliteTe: 'Elite TE',
    balanced: 'Balanced',
  };

  return (
    <div className="space-y-8">
      {/* Champion Podium Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
                <Medal className="w-4 h-4" />
                League Champion
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {champTeam?.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {champTeam?.isUser && (
                  <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    YOUR TEAM WON THE CHAMPIONSHIP! 🎉
                  </span>
                )}
                <span className="text-xs text-slate-300">
                  Strategy: <strong>{strategyLabels[champTeam?.strategy || 'bpa']}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Podium Runners-Up */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 px-5 py-3.5 rounded-2xl">
            <div className="text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-300" />
                2nd Place
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{runnerUpTeam?.name}</div>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="text-center">
              <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                3rd Place
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{thirdTeam?.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Full League Standings</h3>
            <p className="text-xs text-slate-400">Rankings based on Win %, Points For (PF), and Playoff Results</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-xs">
              <tr>
                <th className="p-3 text-center">Rank</th>
                <th className="p-3">Team</th>
                <th className="p-3">Strategy</th>
                <th className="p-3 text-center">Record</th>
                <th className="p-3 text-center">Win %</th>
                <th className="p-3 text-right">Points For</th>
                <th className="p-3 text-right">Points Against</th>
                <th className="p-3 text-center">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {simulationResult.standings.map(s => {
                const isChampion = s.finalRank === 1;
                const isPlayoffs = (s.playoffSeed || 0) <= 4;

                return (
                  <tr
                    key={s.teamId}
                    className={`transition-colors ${
                      s.isUser
                        ? 'bg-emerald-950/30 border-l-4 border-emerald-500'
                        : isChampion
                        ? 'bg-amber-950/20'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3 text-center font-bold">
                      {isChampion ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400">
                          🏆
                        </span>
                      ) : (
                        <span className="text-slate-400">#{s.finalRank}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{s.teamName}</span>
                        {s.isUser && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                        {isPlayoffs && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.2 rounded font-semibold">
                            Seed #{s.playoffSeed}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {strategyLabels[s.strategy]}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-white">
                      {s.wins}-{s.losses}{s.ties > 0 ? `-${s.ties}` : ''}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-300">
                      {(s.winPercentage * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {s.pointsFor.toFixed(1)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {s.pointsAgainst.toFixed(1)}
                    </td>
                    <td className="p-3 text-center font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        s.streak.startsWith('W')
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {s.streak}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Playoff Tournament Bracket View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-1">Playoff Tournament Bracket (Weeks 15–16)</h3>
        <p className="text-xs text-slate-400 mb-6">Top 4 regular season seeds compete in single elimination tournament</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Semifinals */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Semifinals (Week 15)
            </div>

            {simulationResult.playoffMatchups
              .filter(m => m.round === 'semifinal')
              .map((m, mIdx) => {
                const t1 = teamMap.get(m.team1Id)!;
                const t2 = teamMap.get(m.team2Id)!;
                const t1Won = m.team1Score >= m.team2Score;

                return (
                  <div key={m.id} className="bg-slate-800/60 border border-slate-750 rounded-xl p-3.5 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400">
                      Semifinal Match {mIdx + 1}
                    </div>

                    <div className={`p-2 rounded-lg flex items-center justify-between text-xs ${
                      t1Won ? 'bg-emerald-950/40 border border-emerald-500/40 text-white font-bold' : 'text-slate-400'
                    }`}>
                      <span>{t1.name} {t1.isUser && '(You)'}</span>
                      <span className="font-mono">{m.team1Score.toFixed(1)}</span>
                    </div>

                    <div className={`p-2 rounded-lg flex items-center justify-between text-xs ${
                      !t1Won ? 'bg-emerald-950/40 border border-emerald-500/40 text-white font-bold' : 'text-slate-400'
                    }`}>
                      <span>{t2.name} {t2.isUser && '(You)'}</span>
                      <span className="font-mono">{m.team2Score.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Finals & 3rd Place */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Championship Final (Week 16)
            </div>

            {simulationResult.playoffMatchups
              .filter(m => m.round === 'final')
              .map(m => {
                const t1 = teamMap.get(m.team1Id)!;
                const t2 = teamMap.get(m.team2Id)!;
                const t1Won = m.team1Score >= m.team2Score;

                return (
                  <div key={m.id} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="text-[11px] font-bold text-amber-300">
                      Title Game Winner takes the Trophy 🏆
                    </div>

                    <div className={`p-2.5 rounded-lg flex items-center justify-between text-xs ${
                      t1Won ? 'bg-amber-500/20 border border-amber-400 text-white font-extrabold' : 'text-slate-400'
                    }`}>
                      <span>{t1.name} {t1Won && '👑'}</span>
                      <span className="font-mono text-sm">{m.team1Score.toFixed(1)}</span>
                    </div>

                    <div className={`p-2.5 rounded-lg flex items-center justify-between text-xs ${
                      !t1Won ? 'bg-amber-500/20 border border-amber-400 text-white font-extrabold' : 'text-slate-400'
                    }`}>
                      <span>{t2.name} {!t1Won && '👑'}</span>
                      <span className="font-mono text-sm">{m.team2Score.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}

            {/* 3rd place */}
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
              3rd Place Consolation Game
            </div>
            {simulationResult.playoffMatchups
              .filter(m => m.round === 'thirdPlace')
              .map(m => {
                const t1 = teamMap.get(m.team1Id)!;
                const t2 = teamMap.get(m.team2Id)!;
                const t1Won = m.team1Score >= m.team2Score;

                return (
                  <div key={m.id} className="bg-slate-800/40 border border-slate-750 rounded-xl p-3 space-y-1.5">
                    <div className={`p-1.5 rounded flex items-center justify-between text-xs ${
                      t1Won ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      <span>{t1.name} (3rd Place)</span>
                      <span className="font-mono">{m.team1Score.toFixed(1)}</span>
                    </div>
                    <div className={`p-1.5 rounded flex items-center justify-between text-xs ${
                      !t1Won ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}>
                      <span>{t2.name}</span>
                      <span className="font-mono">{m.team2Score.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
