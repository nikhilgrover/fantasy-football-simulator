import { useState, useMemo } from 'react';
import type { LeagueSize, ScoringFormat, StrategyType, DatasetYear, Player, Team, DraftPick, SeasonSimulationResult } from './types';
import { PLAYERS_DATABASE } from './data/playersData';
import { initializeTeams, getSnakePickOrder, addPlayerToTeam } from './engine/draftEngine';
import { selectBestPlayerForTeam } from './engine/draftAI';
import { simulateFullSeason } from './engine/seasonSimulator';
import { Navbar, type ActiveTab } from './components/Navbar';
import { DraftRoom } from './components/DraftRoom';
import { SeasonView } from './components/SeasonView';
import { StandingsView } from './components/StandingsView';
import { StrategyLab } from './components/StrategyLab';
import { RostersView } from './components/RostersView';
import { PlayerCardModal } from './components/PlayerCardModal';
import { LeagueConfigModal } from './components/LeagueConfigModal';

export function App() {
  // League Settings
  const [leagueSize, setLeagueSize] = useState<LeagueSize>(10);
  const [scoringFormat, setScoringFormat] = useState<ScoringFormat>('halfPpr');
  const [draftSlot, setDraftSlot] = useState<number>(1);
  const [userStrategy, setUserStrategy] = useState<StrategyType>('heroRb');
  const [datasetYear, setDatasetYear] = useState<DatasetYear>('2025');

  // Active Tab & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('draft');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);

  // Draft & Teams State
  const [teams, setTeams] = useState<Team[]>(() =>
    initializeTeams(10, 1, 'heroRb')
  );
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>(() => [...PLAYERS_DATABASE]);
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [pickHistory, setPickHistory] = useState<DraftPick[]>([]);

  // Season Simulation State
  const [simulationResult, setSimulationResult] = useState<SeasonSimulationResult | null>(null);

  // Computed draft picks
  const allPicks = useMemo(() => getSnakePickOrder(teams), [teams]);
  const isDraftComplete = currentPickIndex >= allPicks.length;

  const currentPickInfo = isDraftComplete ? null : allPicks[currentPickIndex];
  const currentTeam = currentPickInfo ? teams[currentPickInfo.teamIndex] : null;
  const isUserTurn = currentTeam?.isUser || false;

  // Reset Draft Helper
  const resetDraftState = (
    size: LeagueSize = leagueSize,
    slot: number = draftSlot,
    strat: StrategyType = userStrategy
  ) => {
    const newTeams = initializeTeams(size, slot, strat);
    setTeams(newTeams);
    setAvailablePlayers([...PLAYERS_DATABASE]);
    setCurrentPickIndex(0);
    setPickHistory([]);
    setSimulationResult(null);
  };

  // Draft a specific player
  const handleDraftPlayer = (player: Player) => {
    if (isDraftComplete || !currentPickInfo) return;

    const teamIndex = currentPickInfo.teamIndex;
    const team = teams[teamIndex];

    const updatedTeam = addPlayerToTeam(team, player);
    const newTeams = [...teams];
    newTeams[teamIndex] = updatedTeam;
    setTeams(newTeams);

    // Remove from available
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));

    // Record pick
    const newPick: DraftPick = {
      overallPick: currentPickInfo.overallPick,
      round: currentPickInfo.round,
      pickInRound: currentPickInfo.pickInRound,
      teamId: team.id,
      player,
      timestamp: Date.now(),
    };
    setPickHistory(prev => [...prev, newPick]);
    setCurrentPickIndex(prev => prev + 1);
  };

  // Simulate 1 Pick
  const handleSimPick = () => {
    if (isDraftComplete || !currentPickInfo) return;

    const teamIndex = currentPickInfo.teamIndex;
    const team = teams[teamIndex];
    const pickedPlayer = selectBestPlayerForTeam(team, availablePlayers, currentPickInfo.round, scoringFormat);

    handleDraftPlayer(pickedPlayer);
  };

  // Simulate to User Pick
  const handleSimToUserPick = () => {
    if (isDraftComplete) return;

    let pIdx = currentPickIndex;
    let currentTeams = [...teams];
    let currentAvail = [...availablePlayers];
    const newHistory = [...pickHistory];

    while (pIdx < allPicks.length) {
      const pickInfo = allPicks[pIdx];
      const team = currentTeams[pickInfo.teamIndex];

      // If it's the user's turn and not the initial click, stop so user can pick
      if (team.isUser && pIdx !== currentPickIndex) {
        break;
      }

      const pickedPlayer = selectBestPlayerForTeam(team, currentAvail, pickInfo.round, scoringFormat);
      currentTeams[pickInfo.teamIndex] = addPlayerToTeam(team, pickedPlayer);
      currentAvail = currentAvail.filter(p => p.id !== pickedPlayer.id);

      newHistory.push({
        overallPick: pickInfo.overallPick,
        round: pickInfo.round,
        pickInRound: pickInfo.pickInRound,
        teamId: team.id,
        player: pickedPlayer,
        timestamp: Date.now(),
      });

      pIdx++;
      if (pIdx < allPicks.length && currentTeams[allPicks[pIdx].teamIndex].isUser) {
        break;
      }
    }

    setTeams(currentTeams);
    setAvailablePlayers(currentAvail);
    setPickHistory(newHistory);
    setCurrentPickIndex(pIdx);
  };

  // Simulate All Remaining Picks
  const handleSimAll = () => {
    if (isDraftComplete) return;

    let pIdx = currentPickIndex;
    let currentTeams = [...teams];
    let currentAvail = [...availablePlayers];
    const newHistory = [...pickHistory];

    while (pIdx < allPicks.length) {
      const pickInfo = allPicks[pIdx];
      const team = currentTeams[pickInfo.teamIndex];
      const pickedPlayer = selectBestPlayerForTeam(team, currentAvail, pickInfo.round, scoringFormat);

      currentTeams[pickInfo.teamIndex] = addPlayerToTeam(team, pickedPlayer);
      currentAvail = currentAvail.filter(p => p.id !== pickedPlayer.id);

      newHistory.push({
        overallPick: pickInfo.overallPick,
        round: pickInfo.round,
        pickInRound: pickInfo.pickInRound,
        teamId: team.id,
        player: pickedPlayer,
        timestamp: Date.now(),
      });

      pIdx++;
    }

    setTeams(currentTeams);
    setAvailablePlayers(currentAvail);
    setPickHistory(newHistory);
    setCurrentPickIndex(pIdx);
  };

  // Run Season Simulation
  const handleRunSimulation = () => {
    if (!isDraftComplete) return;
    const simResult = simulateFullSeason(teams, scoringFormat);
    setSimulationResult(simResult);
    setActiveTab('standings');
  };

  // Save Settings from Modal
  const handleSaveConfig = (config: {
    size: LeagueSize;
    format: ScoringFormat;
    slot: number;
    strategy: StrategyType;
    year: DatasetYear;
  }) => {
    setLeagueSize(config.size);
    setScoringFormat(config.format);
    setDraftSlot(config.slot);
    setUserStrategy(config.strategy);
    setDatasetYear(config.year);

    resetDraftState(config.size, config.slot, config.strategy);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leagueSize={leagueSize}
        scoringFormat={scoringFormat}
        datasetYear={datasetYear}
        draftSlot={draftSlot}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDraftComplete={isDraftComplete}
        hasSimulatedSeason={!!simulationResult}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'draft' && (
          <DraftRoom
            teams={teams}
            availablePlayers={availablePlayers}
            allPicks={allPicks}
            pickHistory={pickHistory}
            currentPickIndex={currentPickIndex}
            scoringFormat={scoringFormat}
            onDraftPlayer={handleDraftPlayer}
            onSimPick={handleSimPick}
            onSimToUserPick={handleSimToUserPick}
            onSimAll={handleSimAll}
            onResetDraft={() => resetDraftState()}
            onSelectPlayerModal={setInspectPlayer}
          />
        )}

        {activeTab === 'season' && (
          <SeasonView
            simulationResult={simulationResult}
            teams={teams}
            onRunSimulation={handleRunSimulation}
            isDraftComplete={isDraftComplete}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsView
            simulationResult={simulationResult}
            teams={teams}
            onRunSimulation={handleRunSimulation}
            isDraftComplete={isDraftComplete}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyLab
            leagueSize={leagueSize}
            scoringFormat={scoringFormat}
            draftSlot={draftSlot}
          />
        )}

        {activeTab === 'rosters' && (
          <RostersView
            teams={teams}
            scoringFormat={scoringFormat}
            onSelectPlayerModal={setInspectPlayer}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Fantasy Football Draft & Season Simulator • Built with React, TypeScript & Tailwind CSS • Hosted on Firebase</p>
      </footer>

      {/* Modals */}
      <LeagueConfigModal
        isOpen={isSettingsOpen}
        currentSize={leagueSize}
        currentFormat={scoringFormat}
        currentSlot={draftSlot}
        currentStrategy={userStrategy}
        currentYear={datasetYear}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveConfig}
      />

      <PlayerCardModal
        player={inspectPlayer}
        format={scoringFormat}
        onClose={() => setInspectPlayer(null)}
        onDraft={handleDraftPlayer}
        canDraft={isUserTurn && !isDraftComplete}
      />
    </div>
  );
}

export default App;
