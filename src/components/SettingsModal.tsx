import React, { useState } from 'react';
import { Settings, X, Volume2, VolumeX, ShieldCheck, FileText, CheckCircle2, Play } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  onClose: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

type SettingsTab = 'sound' | 'privacy' | 'license';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  soundMuted,
  onToggleSound
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('sound');

  const testLaser = () => {
    soundManager.playLaser();
  };

  const testCorrect = () => {
    soundManager.playCorrect();
  };

  const testPowerup = () => {
    soundManager.playPowerup();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black font-jua text-white">
                환경 설정
              </h3>
              <p className="text-xs text-slate-400">
                효과음, 개인정보처리방침 및 오픈소스 라이선스 안내
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

        {/* Tab Buttons */}
        <div className="flex gap-2 py-3 border-b border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('sound');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-jua flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sound'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>소리 설정</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('privacy');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-jua flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>개인정보처리방침</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('license');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-jua flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'license'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>오픈소스 라이선스</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm text-slate-300">
          
          {/* 1. Sound Settings */}
          {activeTab === 'sound' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-jua text-base flex items-center gap-2">
                    {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                    <span>게임 효과음 (SFX)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    레이저 사격, 행성 폭발, 정답 딩동 챠임음 재생
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    onToggleSound();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-jua font-bold transition-all cursor-pointer ${
                    soundMuted
                      ? 'bg-rose-950/80 border border-rose-600 text-rose-300'
                      : 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                  }`}
                >
                  {soundMuted ? '음소거 됨' : '소리 켜짐'}
                </button>
              </div>

              {/* Sound Test Panel */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 font-jua uppercase">
                  효과음 사운드 테스트
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={testLaser}
                    disabled={soundMuted}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-xs font-jua text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>레이저 발사</span>
                  </button>
                  <button
                    onClick={testCorrect}
                    disabled={soundMuted}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-xs font-jua text-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>정답 챠임</span>
                  </button>
                  <button
                    onClick={testPowerup}
                    disabled={soundMuted}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-xs font-jua text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>파워업 효과음</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 leading-relaxed">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-jua text-base">
                  <ShieldCheck className="w-5 h-5" />
                  <span>초등학교 교육 환경을 위한 안심 개인정보처리방침</span>
                </div>
                
                <p className="text-xs text-slate-300">
                  본 애플리케이션(&ldquo;수학 슈팅 스타&rdquo;)은 초등학교 수업 및 학생들의 자율 연산 학습을 위해 제작된 안전한 교육용 웹앱입니다.
                </p>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-white block font-jua mb-1">1. 서버 개인정보 비수집 원칙</strong>
                    <span>본 서비스는 외부 서버로 학생의 실명, 전화번호, 이메일, 생년월일 등 어떠한 개인정보도 전송하거나 수집하지 않습니다.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-white block font-jua mb-1">2. 브라우저 로컬 저장소(LocalStorage) 안내</strong>
                    <span>학생이 설정한 게임 닉네임과 획득 점수, 랭킹 기록은 오직 학생 또는 학교 기기의 웹 브라우저 내부에만 안전하게 저장됩니다. 브라우저 캐시 삭제 시 즉시 초기화할 수 있습니다.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-white block font-jua mb-1">3. 쿠키 및 제3자 트래커 미사용</strong>
                    <span>상업적 광고, 트래커, 행동 분석 스크립트를 일체 사용하지 않으며 아동 및 학생 보호를 최우선으로 합니다.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Open Source Licenses */}
          {activeTab === 'license' && (
            <div className="space-y-2.5 animate-fadeIn">
              <p className="text-xs text-slate-400 mb-2">
                수학 슈팅 스타는 다음의 훌륭한 오픈소스 라이브러리와 폰트를 활용하여 제작되었습니다:
              </p>

              {[
                { name: 'React & React DOM', license: 'MIT License', desc: 'A declarative, efficient UI library for building interfaces' },
                { name: 'Tailwind CSS', license: 'MIT License', desc: 'Utility-first CSS framework for rapid and modern UI styling' },
                { name: 'Lucide React', license: 'ISC License', desc: 'Beautiful & consistent icon toolkit for modern web applications' },
                { name: 'Canvas Confetti', license: 'ISC License', desc: 'On-demand confetti animations for triumphant milestones' },
                { name: 'Google Fonts (Jua, Noto Sans KR, Press Start 2P)', license: 'SIL Open Font License 1.1 / Apache 2.0', desc: 'Clear, engaging Korean typography for elementary school students' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-jua text-sm">{item.name}</strong>
                    <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
                      {item.license}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-jua text-sm transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
