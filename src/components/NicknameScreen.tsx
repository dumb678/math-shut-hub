import React, { useState } from 'react';
import { ArrowLeft, Rocket, Zap, Shield, Sparkles, Shuffle, CheckCircle2 } from 'lucide-react';
import { PlayerProfile, OperationType, DifficultyLevel } from '../types';
import { SPACESHIPS } from '../utils/ships';
import { soundManager } from '../utils/audio';

interface NicknameScreenProps {
  onBack: () => void;
  onConfirm: (profile: PlayerProfile) => void;
  initialProfile?: Partial<PlayerProfile>;
}

const NICKNAME_ADJECTIVES = ['빛나는', '용감한', '우주최강', '번개', '날쌘', '별빛', '스마트', '달리는', '슈퍼'];
const NICKNAME_NOUNS = ['수학탐험가', '우주조종사', '암산왕', '캡틴', '수호자', '스타', '마스터', '계산천재'];

export const NicknameScreen: React.FC<NicknameScreenProps> = ({
  onBack,
  onConfirm,
  initialProfile
}) => {
  const [nickname, setNickname] = useState(
    initialProfile?.nickname || localStorage.getItem('math_shooting_last_nickname') || '우주수학왕'
  );
  const [selectedShipId, setSelectedShipId] = useState(
    initialProfile?.shipId || 'thunderbolt'
  );
  const [mode, setMode] = useState<OperationType>(
    initialProfile?.mode || 'mixed'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialProfile?.difficulty || 'normal'
  );
  const [autoShoot, setAutoShoot] = useState<boolean>(
    initialProfile?.autoShoot !== undefined ? initialProfile.autoShoot : false
  );
  const [errorMsg, setErrorMsg] = useState('');

  const generateRandomNickname = () => {
    soundManager.playClick();
    const adj = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
    const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    setNickname(`${adj} ${noun}${num}`);
    setErrorMsg('');
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setErrorMsg('닉네임을 입력해주세요!');
      return;
    }
    if (trimmed.length > 14) {
      setErrorMsg('닉네임은 최대 14자까지 가능합니다.');
      return;
    }

    localStorage.setItem('math_shooting_last_nickname', trimmed);
    soundManager.playPowerup();

    onConfirm({
      nickname: trimmed,
      shipId: selectedShipId,
      mode,
      difficulty,
      soundEnabled: !soundManager.getMuted(),
      autoShoot
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 py-8 bg-slate-950 text-white overflow-y-auto">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Header with Back button */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>시작 화면</span>
          </button>

          <h2 className="text-xl sm:text-2xl font-black font-jua text-cyan-300 tracking-wide flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            <span>파일럿 &amp; 기체 설정</span>
          </h2>

          <div className="w-16" /> {/* spacer for balance */}
        </div>

        <form onSubmit={handleStartGame} className="space-y-6">
          
          {/* Section 1: Nickname Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-200 font-jua text-lg">
              1. 파일럿 닉네임 입력
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={14}
                placeholder="예: 4학년 1반 민우, 수학탐험가"
                className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-2xl px-4 py-3 text-white text-base font-medium placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={generateRandomNickname}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-2xl font-jua flex items-center gap-1.5 transition-all text-sm whitespace-nowrap cursor-pointer active:scale-95"
                title="랜덤 닉네임 생성"
              >
                <Shuffle className="w-4 h-4" />
                <span>랜덤 추천</span>
              </button>
            </div>
            {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}
          </div>

          {/* Section 2: Spaceship Selection */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-200 font-jua text-lg">
              2. 전투 비행기 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SPACESHIPS.map((ship) => {
                const isSelected = selectedShipId === ship.id;
                return (
                  <button
                    key={ship.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedShipId(ship.id);
                    }}
                    className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-cyan-400 fill-cyan-950" />
                    )}

                    {/* Ship Vector Icon Representation */}
                    <div className="w-14 h-14 relative flex items-center justify-center my-1">
                      <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-md">
                        {/* Jet flame */}
                        <polygon points="45,85 55,85 50,98" fill="#f97316" className="animate-pulse" />
                        <polygon points="47,85 53,85 50,94" fill="#fde047" />
                        {/* Wings */}
                        <polygon points="50,15 15,75 50,65 85,75" fill={ship.color} />
                        {/* Body cockpit */}
                        <polygon points="50,10 38,60 50,75 62,60" fill={ship.accentColor} />
                        <ellipse cx="50" cy="40" rx="6" ry="14" fill="#ffffff" opacity="0.8" />
                      </svg>
                    </div>

                    <div className="text-xs font-bold text-white font-jua mt-1 truncate w-full">
                      {ship.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {ship.description.substring(0, 16)}...
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Math Operation Mode */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-200 font-jua text-lg">
              3. 연산 미션 선택
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMode('multiplication');
                }}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'multiplication'
                    ? 'border-amber-400 bg-amber-950/30 shadow-md shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="text-amber-400 text-xs font-bold">집중 연습</div>
                <div className="font-jua text-base sm:text-lg text-white mt-0.5">곱셈 미션</div>
                <div className="text-[11px] text-slate-400 mt-1">3자리수 × 2자리수</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMode('division');
                }}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'division'
                    ? 'border-indigo-400 bg-indigo-950/30 shadow-md shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="text-indigo-400 text-xs font-bold">집중 연습</div>
                <div className="font-jua text-base sm:text-lg text-white mt-0.5">나눗셈 미션</div>
                <div className="text-[11px] text-slate-400 mt-1">3자리수 ÷ 2자리수</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setMode('mixed');
                }}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'mixed'
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="text-cyan-400 text-xs font-bold">추천 종합</div>
                <div className="font-jua text-base sm:text-lg text-white mt-0.5">곱셈 + 나눗셈</div>
                <div className="text-[11px] text-slate-400 mt-1">골고루 랜덤 출제</div>
              </button>
            </div>
          </div>

          {/* Section 4: Flight Speed & Auto-shoot options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 font-jua">
                비행 속도 (난이도)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'easy', label: '초급 (여유)' },
                  { id: 'normal', label: '중급 (보통)' },
                  { id: 'hard', label: '고급 (빠름)' }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setDifficulty(lvl.id as DifficultyLevel);
                    }}
                    className={`py-2 px-1 text-xs rounded-xl font-medium border transition-all cursor-pointer ${
                      difficulty === lvl.id
                        ? 'bg-blue-600 border-blue-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 font-jua">
                편의 기능
              </label>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setAutoShoot(!autoShoot);
                }}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                  autoShoot
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>자동 연사 (비행기 이동에만 집중)</span>
                <span className={`w-3.5 h-3.5 rounded-full ${autoShoot ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              </button>
            </div>
          </div>

          {/* Action Button: Proceed to Actual Game */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-jua text-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer border border-cyan-300/30"
            >
              <Rocket className="w-6 h-6" />
              <span>우주로 출격하기 (게임 시작!)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
