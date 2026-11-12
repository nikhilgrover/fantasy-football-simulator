import type { FC, ReactNode } from 'react';
import type { LeagueSize, ScoringFormat, DatasetYear } from '../types';
import { Trophy, Settings, Users, FlaskConical, LayoutGrid, Calendar } from 'lucide-react';

export type ActiveTab = 'draft' | 'season' | 'standings' | 'strategy' | 'rosters';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  leagueSize: LeagueSize;
  scoringFormat: ScoringFormat;
  datasetYear: DatasetYear;
  draftSlot: number;
  onOpenSettings: () => void;
  isDraftComplete: boolean;
  hasSimulatedSeason: boolean;
}

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  leagueSize,
  scoringFormat,
  datasetYear,
  draftSlot,
  onOpenSettings,
  isDraftComplete,
  hasSimulatedSeason,
}) => {
  const formatLabel = 
    scoringFormat === 'fullPpr' ? 'Full PPR' :
    scoringFormat === 'halfPpr' ? 'Half PPR' : 'Standard';

  const navItems: { id: ActiveTab; label: string; icon: ReactNode; badge?: string }[] = [
    {
      id: 'draft',
      label: 'Draft Room',
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: !isDraftComplete ? 'In Progress' : 'Done',
    },
    {
      id: 'season',
      label: 'Season Matchups',
      icon: <Calendar className="w-4 h-4" />,
      badge: hasSimulatedSeason ? 'Simulated' : undefined,
    },
    {
      id: 'standings',
      label: 'Standings & Playoffs',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: 'strategy',
      label: 'Strategy Benchmark Lab',
      icon: <FlaskConical className="w-4 h-4" />,
      badge: 'Monte Carlo',
    },
    {
      id: 'rosters',
      label: 'League Rosters',
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-950">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Fantasy Football Simulator
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 hidden sm:inline-block">
                  v2025
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Draft • Monte Carlo H2H Season Sim • Playoffs
              </p>
            </div>
          </div>

          {/* League Rules Summary Pills & Settings Trigger */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300">
              <span className="font-bold text-white">{leagueSize} Teams</span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-amber-400">{formatLabel}</span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-blue-400">Pick #{draftSlot}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">{datasetYear} Data</span>
            </div>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>League Rules</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-900/60">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                      isActive
                        ? 'bg-slate-950 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
