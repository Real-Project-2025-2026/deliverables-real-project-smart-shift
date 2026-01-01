
import React from 'react';
import { Station, Language } from '../types';
import { BatteryCharging, MapPin, ChevronRight, Star, Zap, Filter } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface StationListProps {
  stations: Station[];
  onSelect: (station: Station) => void;
  isSearchResults?: boolean;
  language: Language;
}

export const StationList: React.FC<StationListProps> = ({ stations, onSelect, isSearchResults = false, language }) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-[800] pt-24 pb-32 px-4 overflow-y-auto animate-fade-in no-scrollbar border-l border-white/20 dark:border-gray-700/50 shadow-2xl transition-all duration-300">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-2 sticky top-0">
            {isSearchResults ? t.stationsNearby : `${t.availableStations} (${stations.length})`}
        </h2>
        
        {stations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <Filter className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t.noResults}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    {t.adjustFilter}
                </p>
            </div>
        ) : (
            stations.map((station) => (
            <button
                key={station.id}
                onClick={() => onSelect(station)}
                className="w-full bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 p-4 rounded-2xl shadow-sm hover:shadow-md border border-gray-100/50 dark:border-gray-700/50 flex items-center justify-between group active:scale-[0.98] transition-all duration-200"
            >
                <div className="flex items-center space-x-4 overflow-hidden">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    station.status === 'available' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                }`}>
                    <Zap size={24} fill="currentColor" className={station.status === 'available' ? '' : 'opacity-50'} />
                </div>

                <div className="text-left overflow-hidden">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate pr-4">{station.name}</h3>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mt-1 space-x-2">
                        <span className={`px-1.5 py-0.5 rounded font-medium border ${
                            station.status === 'available' 
                            ? 'border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10' 
                            : 'border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10'
                        }`}>
                            {station.status === 'available' ? t.available : t.busy}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="font-medium bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{station.power} kW</span>
                    </div>
                </div>
                </div>
                
                <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-green-500 transition-colors" />
            </button>
            ))
        )}
      </div>
    </div>
  );
};
