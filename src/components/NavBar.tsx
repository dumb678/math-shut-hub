import React from 'react';
import { Play, User, Settings, Trophy } from 'lucide-react';
import { soundManager } from '../utils/audio';

export type NavTab = 'game' | 'info' | 'settings' | 'ranking';

interface NavBarProps {
  activeTab?: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pilotLevel?: number;
}

export const NavBar: React.FC<NavBarProps> = ({
  activeTab,
  onSelectTab,
  pilotLevel = 1
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'game',
      label: '게임 시작',
      icon: <Play className="w-5 h-5 fill-current" />
    },
    {
      id: 'info',
      label: '정보',
      icon: <User className="w-5 h-5" />,
      badge: `Lv.${pilotLevel}`
    },
    {
      id: 'settings',
      label: '설정',
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 'ranking',
      label: '랭킹',
      icon: <Trophy className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-xl px-4 py-2 sm:py-2.5 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                onSelectTab(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer group ${
                isActive
                  ? 'text-cyan-300 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {/* Active glow pill */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}

              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3.5 bg-amber-400 text-slate-950 font-pixel text-[9px] font-black px-1 py-0.2 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] sm:text-xs font-jua mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
