import React from 'react';
import { Play, Trophy, HelpCircle, Volume2, VolumeX, Sparkles, Rocket, User, Settings, Award } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getPlayerStats } from '../utils/playerStats';

interface StartScreenProps {
  onStart: () => void;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
  onOpenInfo: () => void;
  onOpenSettings: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenLeaderboard,
  onOpenGuide,
  onOpenInfo,
  onOpenSettings,
  soundMuted,
  onToggleSound
}) => {
  const stats = getPlayerStats();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 pb-28 overflow-hidden bg-slate-950 text-white">
      {/* Background stars and nebula */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        
        {/* Floating star particles */}
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-60 animate-ping"
            style={{
              top: `${(i * 19) % 100}%`,
              left: `${(i * 27) % 100}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${(i % 5) * 0.7}s`
            }}
          />
        ))}
      </div>

      {/* Top Bar Controls */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
        {/* Pilot Info Badge */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenInfo();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-jua text-slate-300 hover:text-white transition-all shadow-md cursor-pointer backdrop-blur-md active:scale-95"
          title="파일럿 정보 (닉네임 & 레벨)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>파일럿: <strong className="text-cyan-300">{stats.nickname}</strong></span>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-pixel text-[9px] font-bold">
            Lv.{stats.level}
          </span>
        </button>

        {/* Right Buttons: Settings & Sound Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95 text-slate-200 cursor-pointer"
            title="환경 설정"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95 text-slate-200 cursor-pointer"
            title={soundMuted ? "소리 켜기" : "소리 끄기"}
            aria-label="Sound Toggle"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center text-center space-y-6">
        
        {/* Animated Spaceship Badge */}
        <div className="relative animate-float mb-2">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-1 shadow-2xl shadow-cyan-500/30">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-purple-500/20" />
              <Rocket className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              <div className="absolute bottom-2 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 font-jua">
            <Sparkles className="w-3.5 h-3.5" /> 초등 수학
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-sm font-medium backdrop-blur-sm">
            <span>✨ 4학년 1학기 수학교과 완벽 연계</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-jua text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 drop-shadow-md">
            수학 슈팅 스타
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-sm mx-auto">
            세자리수와 두자리수의 <span className="text-amber-400 font-bold">곱셈</span> &amp; <span className="text-cyan-400 font-bold">나눗셈</span>!
            <br />
            비행기로 정답을 조준 사격하세요 🎯
          </p>
        </div>

        {/* Action Buttons: Start Button & Ranking Button Right Below It */}
        <div className="w-full max-w-xs space-y-3.5 pt-4">
          {/* Start Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onStart();
            }}
            className="group w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-jua text-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border border-cyan-300/30 cursor-pointer"
          >
            <Play className="w-7 h-7 fill-current transition-transform group-hover:scale-110" />
            <span>게임 시작하기</span>
          </button>

          {/* Ranking Button - Directly Below Start */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLeaderboard();
            }}
            className="group w-full py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-amber-300 hover:text-amber-200 font-jua text-xl border-2 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/10 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-md"
          >
            <Trophy className="w-6 h-6 text-amber-400 fill-amber-400/20 group-hover:rotate-12 transition-transform" />
            <span>명예의 전당 (랭킹)</span>
          </button>

          {/* How to Play Guide Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenGuide();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/50"
          >
            <HelpCircle className="w-4 h-4" />
            <span>게임 방법 및 조작법</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-4 text-center">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 backdrop-blur-xs">
            <div className="text-cyan-400 text-xs font-semibold">초등 연산</div>
            <div className="text-white text-xs font-bold mt-0.5">3자리수 × 2자리수</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 backdrop-blur-xs">
            <div className="text-indigo-400 text-xs font-semibold">초등 나눗셈</div>
            <div className="text-white text-xs font-bold mt-0.5">3자리수 ÷ 2자리수</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 backdrop-blur-xs">
            <div className="text-amber-400 text-xs font-semibold">오답 풀이</div>
            <div className="text-white text-xs font-bold mt-0.5">단계별 풀이 노트</div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 pt-2">
          교실 스마트보드 &bull; 태블릿 터치 &bull; PC 키보드 &bull; 마우스 모두 지원
        </div>

      </div>
    </div>
  );
};
