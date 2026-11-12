import { useState, type FC, type FormEvent } from 'react';
import type { LeagueSize, ScoringFormat, StrategyType, DatasetYear } from '../types';
import { Settings, Users, Trophy, Award, Sparkles, X, Check } from 'lucide-react';

interface LeagueConfigModalProps {
  isOpen: boolean;
  currentSize: LeagueSize;
  currentFormat: ScoringFormat;
  currentSlot: number;
  currentStrategy: StrategyType;
  currentYear: DatasetYear;
  onClose: () => void;
  onSave: (config: {
    size: LeagueSize;
    format: ScoringFormat;
    slot: number;
    strategy: StrategyType;
    year: DatasetYear;
  }) => void;
}

export const LeagueConfigModal: FC<LeagueConfigModalProps> = ({
  isOpen,
  currentSize,
  currentFormat,
  currentSlot,
  currentStrategy,
  currentYear,
  onClose,
  onSave,
}) => {
  const [size, setSize] = useState<LeagueSize>(currentSize);
  const [format, setFormat] = useState<ScoringFormat>(currentFormat);
  const [slot, setSlot] = useState<number>(currentSlot);
  const [strategy, setStrategy] = useState<StrategyType>(currentStrategy);
  const [year, setYear] = useState<DatasetYear>(currentYear);

  if (!isOpen) return null;

  // Make sure slot is valid if size decreases
  const effectiveSlot = Math.min(slot, size);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      size,
      format,
      slot: effectiveSlot,
      strategy,
      year,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">League Settings & Rules</h2>
              <p className="text-xs text-slate-400">Configure team size, scoring rules, draft format, and datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* League Size */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              League Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([8, 10, 12] as LeagueSize[]).map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setSize(s);
                    if (slot > s) setSlot(s);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    size === s
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-md shadow-emerald-950'
                      : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="text-lg">{s} Teams</div>
                  <div className="text-xs text-slate-400">
                    {s === 8 ? 'Casual & Deep' : s === 10 ? 'Standard League' : 'Competitive'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scoring Format */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Scoring System
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'standard', title: 'Standard', desc: '0.0 PPR' },
                { id: 'halfPpr', title: 'Half PPR', desc: '0.5 PPR (Default)' },
                { id: 'fullPpr', title: 'Full PPR', desc: '1.0 PPR' },
              ].map(f => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFormat(f.id as ScoringFormat)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    format === f.id
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md shadow-amber-950'
                      : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="text-sm">{f.title}</div>
                  <div className="text-xs text-slate-400">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Draft Format */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" />
              Draft Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border bg-blue-500/20 border-blue-500 text-white font-medium flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">Snake Draft</div>
                  <div className="text-xs text-slate-300">Rounds alternate order (1→N, N→1)</div>
                </div>
                <Check className="w-4 h-4 text-blue-400" />
              </div>
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-850 text-slate-500 opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Salary / Auction</div>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 border border-amber-500/30">
                    Roadmap
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">$200 budget bidding</div>
              </div>
            </div>
          </div>

          {/* Draft Slot Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">
              Your Draft Position (Slot 1 to {size})
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: size }, (_, i) => i + 1).map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    effectiveSlot === s
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  #{s}
                </button>
              ))}
            </div>
          </div>

          {/* Data Set & Rookie Inclusion */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Dataset & Projections
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { yr: '2025', label: '2025 Projections', badge: '+ Rookies' },
                { yr: '2024', label: '2024 Actuals', badge: 'Full Season' },
                { yr: '2023', label: '2023 Actuals', badge: 'Archive' },
                { yr: '2022', label: '2022 Actuals', badge: 'Archive' },
              ].map(d => (
                <button
                  type="button"
                  key={d.yr}
                  onClick={() => setYear(d.yr as DatasetYear)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    year === d.yr
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{d.label}</div>
                  <div className="text-[10px] text-emerald-400">{d.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {/* User Auto-Draft Strategy (if user uses auto-pick) */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">
              Auto-Pick Preferred Strategy
            </label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value as StrategyType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="heroRb">Hero RB (Anchor RB in Rd 1-2, hammer WR/TE/QB)</option>
              <option value="zeroRb">Zero RB (Load WR/TE/QB first 5 rounds, RBs late)</option>
              <option value="bpa">Best Player Available (BPA - Maximize VORP)</option>
              <option value="robustRb">Robust RB (3+ RBs in first 4 rounds)</option>
              <option value="eliteQb">Elite QB Early (Target Allen/Hurts/Lamar in Rd 2-3)</option>
              <option value="eliteTe">Elite TE Early (Target LaPorta/Kelce/McBride/Bowers)</option>
              <option value="balanced">Balanced Positional Need</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all"
            >
              Save & Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
