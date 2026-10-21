import React from 'react';
import { HelpCircle, X, Target, Heart, Zap, Edit3, Smartphone, Monitor } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black font-jua text-white">
                게임 방법 &amp; 교사/학생 안내
              </h3>
              <p className="text-xs text-slate-400">
                세자리수와 두자리수 연산 슈팅 게임 완벽 가이드
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
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-sm text-slate-300 pr-1">
          
          {/* Rule 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-jua text-base">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>1. 정답 행성만 정확히 조준 사격하기!</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              화면 상단에 출제되는 <strong className="text-amber-300 font-bold">수학 문제(예: 345 × 24 = ?)</strong>를 계산한 후,
              우주에서 내려오는 여러 숫자 행성 중 <strong className="text-emerald-400">올바른 정답</strong>을 레이저로 격추하세요.
              정답을 맞추면 점수 획득과 함께 연속 콤보 보너스가 누적됩니다!
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold font-jua text-base">
              <Heart className="w-5 h-5 text-rose-400" />
              <span>2. 오답 주의 &amp; 하트(생명) 관리</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              오답 행성을 쏘면 보호막(하트 ❤️)이 1개 줄어듭니다.
              하트 3개가 모두 소진되면 게임이 종료되고 오답 노트가 제공됩니다.
              게임 중간에 떨어지는 <span className="text-rose-400 font-bold">❤️ 하트 아이템</span>이나 <span className="text-sky-400 font-bold">⏰ 시간 정지 아이템</span>을 획득해보세요!
            </p>
          </div>

          {/* Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold font-jua text-base">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>3. 기기별 조작 방법</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                <Monitor className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-jua">PC / 노트북</strong>
                  <span className="text-slate-400">좌우 방향키 [← →] 또는 [A/D]로 이동, [스페이스바] 또는 마우스 클릭으로 발사</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-jua">태블릿 / 스마트폰</strong>
                  <span className="text-slate-400">화면 드래그로 비행기 조종, [발사] 버튼 터치 또는 자동 연사 모드 활성화</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scratchpad note */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 font-bold font-jua text-base">
              <Edit3 className="w-5 h-5 text-emerald-400" />
              <span>4. 편리한 연산 연습장 (필기 기능)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              게임 중 상단의 <span className="text-emerald-300 font-bold">📝 풀이 연습장</span> 버튼을 누르면
              화면 위에 자유롭게 세로셈을 적을 수 있는 화이트보드가 열립니다.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-jua text-base transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
