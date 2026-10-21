import React, { useState } from 'react';
import { Trophy, Medal, X, RotateCcw, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { LeaderboardEntry, OperationType } from '../types';
import { getLeaderboard, clearLeaderboard } from '../utils/leaderboard';
import { soundManager } from '../utils/audio';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [scores, setScores] = useState<LeaderboardEntry[]>(getLeaderboard());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredScores = scores.filter((entry) => {
    if (filterMode === 'all') return true;
    return entry.mode === filterMode;
  });

  const handleReset = () => {
    clearLeaderboard();
    setScores(getLeaderboard());
    setShowResetConfirm(false);
    soundManager.playClick();
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black font-pixel text-xs shadow-md shadow-amber-400/40">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black font-pixel text-xs shadow-md shadow-slate-300/40">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black font-pixel text-xs shadow-md shadow-amber-700/40">
          3
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold text-sm">
        {index + 1}
      </span>
    );
  };

  const getModeLabel = (mode: OperationType) => {
    switch (mode) {
      case 'multiplication':
        return <span className="text-amber-400 font-medium">곱셈</span>;
      case 'division':
        return <span className="text-indigo-400 font-medium">나눗셈</span>;
      case 'mixed':
      default:
        return <span className="text-cyan-400 font-medium">혼합</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black font-jua text-white flex items-center gap-2">
                <span>명예의 전당 (우주 랭킹)</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                수학 슈팅 스타 최고 득점자 랭킹 (로컬 저장소)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-2 py-3 border-b border-slate-800/50">
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'all', label: '전체' },
              { id: 'multiplication', label: '세자리수×두자리수' },
              { id: 'division', label: '세자리수÷두자리수' },
              { id: 'mixed', label: '혼합 연산' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setFilterMode(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-jua transition-all cursor-pointer whitespace-nowrap ${
                  filterMode === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer"
            title="기록 초기화"
          >
            <RotateCcw className="w-3 h-3" />
            <span>초기화</span>
          </button>
        </div>

        {/* Confirm reset prompt */}
        {showResetConfirm && (
          <div className="my-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center justify-between text-xs text-rose-200">
            <span>정말 모든 랭킹 기록을 기본 상태로 초기화할까요?</span>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold cursor-pointer"
              >
                초기화
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {filteredScores.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              해당 모드의 랭킹 기록이 아직 없습니다. 첫 도전에 나서보세요!
            </div>
          ) : (
            filteredScores.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                    : idx === 1
                    ? 'bg-slate-800/40 border-slate-700/60'
                    : idx === 2
                    ? 'bg-amber-950/10 border-amber-800/40'
                    : 'bg-slate-900/40 border-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(idx)}
                  <div className="min-w-0">
                    <div className="font-bold text-white font-jua text-base truncate flex items-center gap-1.5">
                      <span>{item.nickname}</span>
                      {idx === 0 && <Medal className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{getModeLabel(item.mode)}</span>
                      <span>&bull;</span>
                      <span>정답률 {item.accuracy}%</span>
                      {item.maxCombo > 1 && (
                        <>
                          <span>&bull;</span>
                          <span className="text-amber-400 font-semibold">{item.maxCombo}연속콤보</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div className="font-pixel text-cyan-300 text-base font-bold">
                    {item.score.toLocaleString()} <span className="text-xs font-jua text-slate-400">점</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.date}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-jua text-base transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
