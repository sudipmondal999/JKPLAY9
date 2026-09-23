import React from 'react';
import { ActiveTab } from '../../types/index.js';
import { Home, Compass, Music2, BookOpen, Radio, Library } from 'lucide-react';
import { useJamStore } from '../../stores/jamStore.js';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { isInJam } = useJamStore();

  const tabs: { tab: ActiveTab; label: string; icon: any; isLive?: boolean }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'discover', label: 'Discover', icon: Compass },
    { tab: 'music', label: 'Music', icon: Music2 },
    { tab: 'stories', label: 'Stories', icon: BookOpen },
    { tab: 'jam', label: 'Jam', icon: Radio, isLive: isInJam },
    { tab: 'library', label: 'Library', icon: Library },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-[#0A0A12]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-2">
      {tabs.map(({ tab, label, icon: Icon, isLive }) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center justify-center py-1 px-2 relative transition-colors ${
              isActive ? 'text-purple-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {isLive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
