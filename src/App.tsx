/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { NicknameScreen } from './components/NicknameScreen';
import { GameScreen } from './components/GameScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GuideModal } from './components/GuideModal';
import { InfoModal } from './components/InfoModal';
import { SettingsModal } from './components/SettingsModal';
import { NavBar, NavTab } from './components/NavBar';
import { PlayerProfile } from './types';
import { soundManager } from './utils/audio';
import { getPlayerStats } from './utils/playerStats';

type ScreenState = 'start' | 'nickname' | 'game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('start');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(soundManager.getMuted());

  const playerStats = getPlayerStats();

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setSoundMuted(muted);
  };

  const handleStartFromSplash = () => {
    // Go from Start Screen -> Nickname Setup Screen
    setCurrentScreen('nickname');
  };

  const handleNicknameConfirmed = (confirmedProfile: PlayerProfile) => {
    // Go from Nickname Setup Screen -> Actual Game Screen
    setProfile(confirmedProfile);
    setCurrentScreen('game');
  };

  const handleExitGameToStart = () => {
    setCurrentScreen('start');
  };

  const handleNavSelect = (tab: NavTab) => {
    if (tab === 'game') {
      if (currentScreen === 'game') return;
      setCurrentScreen('nickname');
    } else if (tab === 'info') {
      setShowInfo(true);
    } else if (tab === 'settings') {
      setShowSettings(true);
    } else if (tab === 'ranking') {
      setShowLeaderboard(true);
    }
  };

  // Determine active nav tab for styling
  let activeNavTab: NavTab = 'game';
  if (showInfo) activeNavTab = 'info';
  else if (showSettings) activeNavTab = 'settings';
  else if (showLeaderboard) activeNavTab = 'ranking';

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Screen 1: Start Screen */}
      {currentScreen === 'start' && (
        <StartScreen
          onStart={handleStartFromSplash}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenGuide={() => setShowGuide(true)}
          onOpenInfo={() => setShowInfo(true)}
          onOpenSettings={() => setShowSettings(true)}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Screen 2: Nickname Setup Screen */}
      {currentScreen === 'nickname' && (
        <div className="pb-24">
          <NicknameScreen
            onBack={() => setCurrentScreen('start')}
            onConfirm={handleNicknameConfirmed}
            initialProfile={profile || undefined}
          />
        </div>
      )}

      {/* Screen 3: Actual Game Screen */}
      {currentScreen === 'game' && profile && (
        <GameScreen
          profile={profile}
          onExit={handleExitGameToStart}
        />
      )}

      {/* Navigation Bar (visible on Start Screen and Nickname Screen) */}
      {currentScreen !== 'game' && (
        <NavBar
          activeTab={activeNavTab}
          onSelectTab={handleNavSelect}
          pilotLevel={playerStats.level}
        />
      )}

      {/* Global Modals */}
      {showInfo && (
        <InfoModal
          onClose={() => setShowInfo(false)}
          onStartGame={() => {
            setShowInfo(false);
            setCurrentScreen('nickname');
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}
