import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Country, GameMode } from './types/game';
import {
  ALL_COUNTRIES,
  DEFAULT_PRESET,
  getRandom4Countries,
  getRandom16Countries,
} from './data/countries';
import { GameBoard } from './components/GameBoard';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { CommentaryTicker } from './components/CommentaryTicker';
import { commentator } from './utils/commentator';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('classic_4');

  // Active participating countries
  const [countries, setCountries] = useState<Country[]>(() =>
    DEFAULT_PRESET.countries.map((code) => ALL_COUNTRIES[code])
  );

  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [territoryPercentages, setTerritoryPercentages] = useState<Record<string, number>>({});
  const [ballCounts, setBallCounts] = useState<Record<string, number>>({});
  const [eliminated, setEliminated] = useState<Record<string, boolean>>({});
  const [winner, setWinner] = useState<Country | null>(null);

  // Win counts & match history
  const [winCounts, setWinCounts] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<
    { matchNumber: number; winner: Country; duration: string }[]
  >([]);

  // Enable commentator voice automatically
  useEffect(() => {
    commentator.setEnabled(true);
    commentator.unlockAudio();
  }, []);

  // Match timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [matchNumber]);

  // Handle switching between 4 Nations and 16 Nations World Royale
  const handleToggleMode = (newMode: GameMode) => {
    setGameMode(newMode);
    setMatchNumber((prev) => prev + 1);
    setElapsedSeconds(0);
    setWinner(null);

    if (newMode === 'mega_world') {
      setCountries(getRandom16Countries());
    } else {
      setCountries(getRandom4Countries());
    }
  };

  // Stats update callback from GameBoard
  const handleStatsUpdate = useCallback(
    (stats: {
      territoryCounts: Record<string, number>;
      territoryPercentages: Record<string, number>;
      ballCounts: Record<string, number>;
      eliminated: Record<string, boolean>;
      winner: Country | null;
    }) => {
      setTerritoryPercentages(stats.territoryPercentages);
      setBallCounts(stats.ballCounts);
      setEliminated(stats.eliminated);
      if (stats.winner) {
        setWinner(stats.winner);
      }
    },
    []
  );

  // Round finish callback: record winner in history and win counts
  const handleRoundFinish = useCallback(
    (roundWinner: Country) => {
      setWinner(roundWinner);
      setWinCounts((prev) => ({
        ...prev,
        [roundWinner.id]: (prev[roundWinner.id] || 0) + 1,
      }));

      const mins = Math.floor(elapsedSeconds / 60);
      const secs = elapsedSeconds % 60;
      const durationStr = `${mins}m ${secs}s`;

      setHistory((prev) => [
        ...prev,
        {
          matchNumber,
          winner: roundWinner,
          duration: durationStr,
        },
      ]);
    },
    [elapsedSeconds, matchNumber]
  );

  // Automatic match restart: triggers when victory countdown reaches 0
  const handleNextMatch = useCallback(() => {
    setElapsedSeconds(0);
    setWinner(null);
    setMatchNumber((prev) => prev + 1);

    if (gameMode === 'mega_world') {
      // Draft 16 fresh countries from across the world
      setCountries(getRandom16Countries());
    } else {
      // Draft 4 fresh countries from across the world
      setCountries(getRandom4Countries());
    }
  }, [gameMode]);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row p-1 sm:p-2 gap-1.5 sm:gap-2 font-sans select-none">
      {/* 1. Battle Arena Grid (Full width on mobile, Full height on desktop) */}
      <div className="w-full md:flex-1 h-auto md:h-full max-h-[50vh] sm:max-h-[54vh] md:max-h-none flex items-center justify-center shrink-0 min-h-0 relative">
        <GameBoard
          mode={gameMode}
          countries={countries}
          simSpeed={1.0}
          spawnThresholdPercent={gameMode === 'mega_world' ? 2 : 5}
          randomDropsEnabled={true}
          soundEnabled={true}
          soundVolume={0.7}
          autoRestart={true}
          restartCountdownSeconds={5}
          onStatsUpdate={handleStatsUpdate}
          onRoundFinish={handleRoundFinish}
          matchNumber={matchNumber}
          onNextMatch={handleNextMatch}
        />
      </div>

      {/* 2. On Mobile: In between Battle Arena Grid and Territory Control */}
      <div className="md:hidden w-full shrink-0">
        <CommentaryTicker
          voiceEnabled={true}
          onToggleVoice={() => {}}
          obsCleanMode={true}
        />
      </div>

      {/* 3. Territory Control Column (Bottom on mobile, Right on desktop) */}
      <div className="w-full md:w-[320px] lg:w-[380px] flex-1 md:h-full flex flex-col gap-1.5 shrink-0 min-h-0 overflow-hidden">
        {/* On Desktop: Live Caster sits at the top of the right panel, between Grid and Territory Control */}
        <div className="hidden md:block shrink-0">
          <CommentaryTicker
            voiceEnabled={true}
            onToggleVoice={() => {}}
            obsCleanMode={true}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <LiveLeaderboard
            mode={gameMode}
            countries={countries}
            territoryPercentages={territoryPercentages}
            ballCounts={ballCounts}
            eliminated={eliminated}
            winner={winner}
            history={history}
            winCounts={winCounts}
            obsCleanMode={true}
            onToggleMode={handleToggleMode}
          />
        </div>
      </div>
    </div>
  );
}
