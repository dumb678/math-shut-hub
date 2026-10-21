import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp, Star, Award } from 'lucide-react';
import { QuestionRecord, PlayerProfile, LeaderboardEntry } from '../types';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  profile: PlayerProfile;
  score: number;
  maxCombo: number;
  questionHistory: QuestionRecord[];
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  profile,
  score,
  maxCombo,
  questionHistory,
  onPlayAgain,
  onOpenLeaderboard,
  onGoHome
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalQuestions = questionHistory.length;
  const correctCount = questionHistory.filter((q) => q.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let grade = 'C';
  let gradeColor = 'text-amber-500';
  let gradeBg = 'bg-amber-500/10 border-amber-500/30';
  let badgeTitle = '우주 비행 연습생';

  if (score >= 1500 && accuracy >= 85) {
    grade = 'S';
    gradeColor = 'text-cyan-400';
    gradeBg = 'bg-cyan-500/10 border-cyan-500/30';
    badgeTitle = '전설의 은하수 연산 마스터';
  } else if (score >= 1000 && accuracy >= 75) {
    grade = 'A';
    gradeColor = 'text-emerald-400';
    gradeBg = 'bg-emerald-500/10 border-emerald-500/30';
    badgeTitle = '숙련된 우주 전투 에이스';
  } else if (score >= 500) {
    grade = 'B';
    gradeColor = 'text-blue-400';
    gradeBg = 'bg-blue-500/10 border-blue-500/30';
    badgeTitle = '성장하는 우주 파일럿';
  }

  useEffect(() => {
    if (score >= 500) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [score]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="text-center space-y-1 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-jua border mb-1 bg-slate-800/80 border-slate-700 text-cyan-300">
            <Award className="w-3.5 h-3.5" />
            <span>{badgeTitle}</span>
          </div>
          <h2 className="text-3xl font-black font-jua text-white">
            미션 종료!
          </h2>
          <p className="text-xs text-slate-400">
            {profile.nickname} 파일럿님의 우주 연산 탐사 결과입니다.
          </p>
        </div>

        {/* Score & Grade Display */}
        <div className="my-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-semibold font-jua">최종 점수</div>
            <div className="text-3xl sm:text-4xl font-black font-pixel text-cyan-300 mt-1">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div className="text-center">
            <div className="text-xs text-slate-400 font-semibold font-jua">연산 등급</div>
            <div className={`text-3xl sm:text-4xl font-black font-pixel ${gradeColor} mt-1`}>
              {grade}
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div className="text-center">
            <div className="text-xs text-slate-400 font-semibold font-jua">정답률</div>
            <div className="text-2xl sm:text-3xl font-bold font-jua text-white mt-1">
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Stats details */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-300 mb-3">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block">해결한 문제</span>
            <strong className="text-white font-jua text-sm">{correctCount} / {totalQuestions}</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block">최대 연속 콤보</span>
            <strong className="text-amber-400 font-jua text-sm">{maxCombo} 콤보</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block">연산 유형</span>
            <strong className="text-cyan-400 font-jua text-sm">
              {profile.mode === 'multiplication' ? '세자리×두자리' : profile.mode === 'division' ? '세자리÷두자리' : '곱셈+나눗셈'}
            </strong>
          </div>
        </div>

        {/* Review Notes Accordion (초등 교사와 학생을 위한 오답 및 풀이 노트) */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 border-t border-b border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 font-jua mb-1">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>학습 검토 &amp; 문제별 풀이 노트 ({totalQuestions}문제)</span>
          </div>

          {questionHistory.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              기록된 문제가 없습니다.
            </div>
          ) : (
            questionHistory.map((q, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    q.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-mono">
                      {q.isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold text-white text-sm">
                        {idx + 1}. {q.problem.displayQuestion}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={q.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {q.isCorrect ? '정답' : '오답'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-2 border-t border-slate-800/70 space-y-1.5 font-sans">
                      <div className="flex gap-4 text-[11px]">
                        <div>
                          <span className="text-slate-400">나의 선택: </span>
                          <strong className={q.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                            {q.userAnswer !== null ? q.userAnswer.toLocaleString() : '미격추(시간초과)'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">실제 정답: </span>
                          <strong className="text-cyan-300">{q.problem.correctAnswer.toLocaleString()}</strong>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-lg space-y-1 mt-1 border border-slate-800">
                        <div className="text-[11px] font-bold text-amber-300 font-jua">
                          단계별 세로셈 풀이:
                        </div>
                        {q.problem.stepExplanation.map((step, sIdx) => (
                          <div key={sIdx} className="text-[11px] text-slate-300 font-mono">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Buttons */}
        <div className="pt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="py-3 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-jua text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLeaderboard();
            }}
            className="py-3 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-jua text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>랭킹 확인</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onGoHome();
            }}
            className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-jua text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>시작 화면</span>
          </button>
        </div>

      </div>
    </div>
  );
};
