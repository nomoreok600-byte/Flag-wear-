import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Country, GameMode } from './types/game';
import {
  ALL_COUNTRIES,
  DEFAULT_PRESET,
  MATCHUP_PRESETS,
  MatchupPreset,
  getMegaWorldCountries,
  getRandom16Countries,
} from './data/countries';
import { GameBoard } from './components/GameBoard';
import { BroadcastHeader } from './components/BroadcastHeader';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { StreamerControls } from './components/StreamerControls';
import { CountryRouletteModal } from './components/CountryRouletteModal';
import { CommentaryTicker } from './components/CommentaryTicker';
import { RdpObsGuideModal } from './components/RdpObsGuideModal';
import { CpanelHostingModal } from './components/CpanelHostingModal';
import { commentator } from './utils/commentator';
import { Sparkles, Radio, Package } from 'lucide-react';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('classic_4');
  const [selectedPreset, setSelectedPreset] = useState<MatchupPreset>(DEFAULT_PRESET);

  // Active participating countries
  const [countries, setCountries] = useState<Country[]>(() =>
    DEFAULT_PRESET.countries.map((code) => ALL_COUNTRIES[code])
  );

  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [autoRestart, setAutoRestart] = useState<boolean>(true);
  const [restartDelay, setRestartDelay] = useState<number>(4);
  const [spawnThresholdPercent, setSpawnThresholdPercent] = useState<number>(5);
  const [randomDropsEnabled, setRandomDropsEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(0.5);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [obsCleanMode, setObsCleanMode] = useState<boolean>(false);

  // Modals
  const [isRouletteOpen, setIsRouletteOpen] = useState<boolean>(false);
  const [isRdpGuideOpen, setIsRdpGuideOpen] = useState<boolean>(false);
  const [isCpanelGuideOpen, setIsCpanelGuideOpen] = useState<boolean>(false);

  // Live match state
  const [territoryPercentages, setTerritoryPercentages] = useState<Record<string, number>>({});
  const [ballCounts, setBallCounts] = useState<Record<string, number>>({});
  const [eliminated, setEliminated] = useState<Record<string, boolean>>({});
  const [winner, setWinner] = useState<Country | null>(null);

  // Win counts & history
  const [winCounts, setWinCounts] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<
    { matchNumber: number; winner: Country; duration: string }[]
  >([]);

  // Manual ball injection trigger reference
  const manualSpawnRef = useRef<((countryId: string) => void) | null>(null);

  // Sync commentary voice setting
  useEffect(() => {
    commentator.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  // Match timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [matchNumber]);

  // Handle switching game mode
  const handleToggleMode = (newMode: GameMode) => {
    setGameMode(newMode);
    setMatchNumber((prev) => prev + 1);
    setElapsedSeconds(0);
    setWinner(null);

    if (newMode === 'mega_world') {
      setCountries(getRandom16Countries());
    } else {
      setCountries(selectedPreset.countries.map((code) => ALL_COUNTRIES[code]));
    }
  };

  // Handle Preset change
  const handleSelectPreset = (preset: MatchupPreset) => {
    setSelectedPreset(preset);
    setGameMode('classic_4');
    setCountries(preset.countries.map((code) => ALL_COUNTRIES[code]));
    setMatchNumber((prev) => prev + 1);
    setElapsedSeconds(0);
    setWinner(null);
  };

  // Reset current match
  const handleResetMatch = () => {
    if (gameMode === 'mega_world') {
      setCountries(getRandom16Countries());
    }
    setMatchNumber((prev) => prev + 1);
    setElapsedSeconds(0);
    setWinner(null);
  };

  // Trigger Country Roulette or 16-country World Draft
  const handleTriggerRoulette = () => {
    if (gameMode === 'mega_world') {
      const new16 = getRandom16Countries();
      setCountries(new16);
      setMatchNumber((prev) => prev + 1);
      setElapsedSeconds(0);
      setWinner(null);
    } else {
      setIsRouletteOpen(true);
    }
  };

  // When roulette finishes drafting 4 random countries
  const handleRouletteComplete = (newSelected: Country[]) => {
    setIsRouletteOpen(false);
    setCountries(newSelected);
    setMatchNumber((prev) => prev + 1);
    setElapsedSeconds(0);
    setWinner(null);
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

  // Round finish callback
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

      // Every match automatically select new countries when auto-restart is on
      if (autoRestart) {
        setTimeout(() => {
          if (gameMode === 'mega_world') {
            // Draft brand new 16 countries from all over the world
            const fresh16 = getRandom16Countries();
            setCountries(fresh16);
            setMatchNumber((prev) => prev + 1);
            setElapsedSeconds(0);
            setWinner(null);
          } else {
            setIsRouletteOpen(true);
          }
        }, (restartDelay + 1) * 1000);
      }
    },
    [elapsedSeconds, matchNumber, gameMode, autoRestart, restartDelay]
  );

  // Manual ball spawn for streamer
  const handleManualSpawnBall = (countryId: string) => {
    if (manualSpawnRef.current) {
      manualSpawnRef.current(countryId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Broadcast Header */}
      <BroadcastHeader
        mode={gameMode}
        onToggleMode={handleToggleMode}
        matchNumber={matchNumber}
        elapsedSeconds={elapsedSeconds}
        countries={countries}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
        obsCleanMode={obsCleanMode}
        onToggleObsMode={() => setObsCleanMode((prev) => !prev)}
        onTriggerRoulette={handleTriggerRoulette}
        onOpenRdpGuide={() => setIsRdpGuideOpen(true)}
        onOpenCpanelGuide={() => setIsCpanelGuideOpen(true)}
      />

      {/* Main Content Area - Maximized View on the Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 flex flex-col gap-4">
        {/* Stream Banner Ticker (Clean & Informative) */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-300">
              {gameMode === 'mega_world' ? 'MEGA WORLD CLASH:' : 'BATTLE:'}
            </span>
            <span className="font-semibold text-slate-200">
              {gameMode === 'mega_world'
                ? `${countries.length} Nations Worldwide Fighting for World Domination`
                : countries.map((c) => `${c.emoji} ${c.name}`).join('  vs  ')}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            {randomDropsEnabled && (
              <div className="flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                <Package className="w-3 h-3" />
                <span>Drops Active: 💣 Bomb • ⚽ +2 Balls • ⚡ Speed</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
              <Radio className="w-3 h-3" />
              <span>24/7 AUTO-PILOT</span>
            </div>
          </div>
        </div>

        {/* Battle Arena & Scoreboard Grid (Maximized for Arena View) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Main Focus: Interactive Canvas GameBoard with Expanding Flags */}
          <div
            className={`${
              obsCleanMode ? 'lg:col-span-9' : 'lg:col-span-8'
            } flex flex-col items-center gap-2.5 w-full`}
          >
            <GameBoard
              mode={gameMode}
              countries={countries}
              simSpeed={simSpeed}
              spawnThresholdPercent={spawnThresholdPercent}
              randomDropsEnabled={randomDropsEnabled}
              soundEnabled={soundEnabled}
              soundVolume={soundVolume}
              autoRestart={autoRestart}
              restartCountdownSeconds={restartDelay}
              onStatsUpdate={handleStatsUpdate}
              onRoundFinish={handleRoundFinish}
              matchNumber={matchNumber}
              onRegisterSpawnBall={(fn) => {
                manualSpawnRef.current = fn;
              }}
            />

            {/* Live AI Announcer Commentary Ticker & Subtitles */}
            <CommentaryTicker
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
            />
          </div>

          {/* Right Column: Live Territory Control Scoreboard */}
          <div
            className={`${
              obsCleanMode ? 'lg:col-span-3' : 'lg:col-span-4'
            } flex flex-col gap-3 w-full`}
          >
            <LiveLeaderboard
              mode={gameMode}
              countries={countries}
              territoryPercentages={territoryPercentages}
              ballCounts={ballCounts}
              eliminated={eliminated}
              winner={winner}
              history={history}
              winCounts={winCounts}
            />
          </div>
        </div>

        {/* Streamer Controls Deck (Only visible when not in OBS clean mode) */}
        {!obsCleanMode && (
          <div className="mt-1">
            <StreamerControls
              mode={gameMode}
              onSetMode={handleToggleMode}
              simSpeed={simSpeed}
              onSetSimSpeed={setSimSpeed}
              autoRestart={autoRestart}
              onToggleAutoRestart={() => setAutoRestart((prev) => !prev)}
              restartDelay={restartDelay}
              onSetRestartDelay={setRestartDelay}
              randomDropsEnabled={randomDropsEnabled}
              onToggleRandomDrops={() => setRandomDropsEnabled((prev) => !prev)}
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              onTriggerRoulette={handleTriggerRoulette}
              onResetMatch={handleResetMatch}
              onManualSpawnBall={handleManualSpawnBall}
              countries={countries}
              spawnThresholdPercent={spawnThresholdPercent}
              onSetSpawnThreshold={setSpawnThresholdPercent}
              soundVolume={soundVolume}
              onSetVolume={setSoundVolume}
            />
          </div>
        )}
      </main>

      {/* Country Selection Roulette Animation Modal */}
      <CountryRouletteModal
        isOpen={isRouletteOpen}
        onSelectionComplete={handleRouletteComplete}
      />

      {/* RDP & OBS Setup Guide Modal */}
      <RdpObsGuideModal
        isOpen={isRdpGuideOpen}
        onClose={() => setIsRdpGuideOpen(false)}
      />

      {/* cPanel Website Hosting Guide Modal */}
      <CpanelHostingModal
        isOpen={isCpanelGuideOpen}
        onClose={() => setIsCpanelGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-3 px-6 text-center text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <span>Flag Wars — Automated 24/7 Live Stream Game</span>
          <span>Dynamic Flag Expansion • AI Live Commentary • 1080p OBS Ready</span>
        </div>
      </footer>
    </div>
  );
}
