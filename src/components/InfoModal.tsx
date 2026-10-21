import React, { useState } from 'react';
import { User, X, Award, Shield, Sparkles, Check, Edit2, Zap, Target, BookOpen } from 'lucide-react';
import { PlayerStats, getPlayerStats, savePlayerStats } from '../utils/playerStats';
import { soundManager } from '../utils/audio';

interface InfoModalProps {
  onClose: () => void;
  onStartGame: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose, onStartGame }) => {
  const [stats, setStats] = useState<PlayerStats>(getPlayerStats());
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(stats.nickname);

  const accuracy = stats.totalSolved > 0 
    ? Math.round((stats.totalCorrect / stats.totalSolved) * 100) 
    : 100;

  const currentLevelBaseExp = stats.level === 1 ? 0 : 300 * Math.pow(2, stats.level - 2);
  const expInCurrentLevel = Math.max(0, stats.exp - currentLevelBaseExp);
  const expNeededForNextLevel = Math.max(1, stats.nextExp - currentLevelBaseExp);
  const expPercentage = Math.min(100, Math.round((expInCurrentLevel / expNeededForNextLevel) * 100));

  const handleSaveNickname = () => {
    const trimmed = tempNickname.trim();
    if (!trimmed) return;
    soundManager.playClick();
    const updated = { ...stats, nickname: trimmed };
    savePlayerStats(updated);
    setStats(updated);
    setIsEditingNickname(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black font-jua text-white flex items-center gap-2">
                <span>파일럿 정보 (내 프로필)</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400">
                나의 닉네임과 연산 레벨, 누적 탐사 기록
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* Card: Nickname & Level Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border border-slate-800 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-jua">
                  현재 파일럿 닉네임
                </span>
                
                {isEditingNickname ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      maxLength={14}
                      className="bg-slate-950 border border-cyan-400 rounded-xl px-3 py-1.5 text-white font-jua text-lg outline-none w-48"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveNickname}
                      className="p-2 bg-cyan-500 text-slate-950 rounded-xl hover:bg-cyan-400 transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-black font-jua text-white">
                      {stats.nickname}
                    </h4>
                    <button
                      onClick={() => setIsEditingNickname(true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all cursor-pointer"
                      title="닉네임 변경"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-jua mt-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{stats.levelTitle}</span>
                </div>
              </div>

              {/* Big Level Emblem */}
              <div className="text-center p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md">
                <div className="text-[10px] text-slate-400 font-bold uppercase">LEVEL</div>
                <div className="text-3xl font-black font-pixel text-amber-300 mt-0.5">
                  Lv.{stats.level}
                </div>
              </div>
            </div>

            {/* EXP Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-jua">다음 레벨까지 경험치 (EXP)</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {stats.exp.toLocaleString()} / {stats.nextExp.toLocaleString()} ({expPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, expPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-jua block">누적 점수</span>
              <span className="text-lg font-black font-pixel text-amber-300 mt-0.5 block">
                {stats.totalScore.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-jua block">정답률</span>
              <span className="text-lg font-black font-jua text-emerald-400 mt-0.5 block">
                {accuracy}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-jua block">해결한 문제</span>
              <span className="text-lg font-black font-jua text-cyan-300 mt-0.5 block">
                {stats.totalCorrect}개
              </span>
            </div>
          </div>

          {/* Information Notice for Elementary School */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs text-slate-400 leading-relaxed">
            <div className="text-slate-300 font-bold font-jua flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>레벨업 팁</span>
            </div>
            <p>
              문제를 정확히 맞출 때마다 획득한 점수가 경험치로 쌓여 레벨이 올라갑니다. 
              연속 콤보를 이어가면 더 높은 경험치를 얻을 수 있습니다!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-jua text-sm transition-colors cursor-pointer"
          >
            닫기
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onStartGame();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-jua text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>이 파일럿으로 게임 시작</span>
          </button>
        </div>

      </div>
    </div>
  );
};
