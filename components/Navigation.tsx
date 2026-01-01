
import React from 'react';
import { Map, Settings, ScanLine } from 'lucide-react';
import { ViewState, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  language: Language;
}

export const Navigation: React.FC<NavigationProps> = React.memo(({ currentView, onNavigate, language }) => {
  const t = TRANSLATIONS[language];

  const navItems = [
    { id: 'map', label: t.map, icon: Map },
    { id: 'scanner', label: t.scan, icon: ScanLine },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[4000] flex justify-center pointer-events-none pb-6 pb-safe">
      <nav className="pointer-events-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-2xl rounded-full px-6 py-3 flex items-center space-x-2 md:space-x-4 transition-all duration-300 hover:scale-[1.02]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'settings' && (currentView === 'vehicle_edit' || currentView === 'profile_edit'));
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`relative flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/10'
              }`}
              aria-label={item.label}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full opacity-0"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
});
