
import React, { useState, useEffect } from 'react';
import { X, Zap, CheckCircle, BatteryCharging, Plug } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

export interface FilterOptions {
  onlyAvailable: boolean;
  minPower: number;
  type: 'all' | 'Typ 2' | 'CCS';
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  language: Language;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, currentFilters, onApply, language }) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);
  const t = TRANSLATIONS[language];

  // Sync local state when opening
  useEffect(() => {
    if (isOpen) setLocalFilters(currentFilters);
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetState: FilterOptions = { onlyAvailable: false, minPower: 0, type: 'all' };
    setLocalFilters(resetState);
    onApply(resetState); // Optional: Apply immediately on reset or wait for user to click apply
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-end md:items-center md:justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="bg-white dark:bg-gray-800 w-full md:w-[400px] rounded-2xl shadow-2xl relative z-10 animate-slide-up overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.filter}</h3>
            <button 
                onClick={onClose} 
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto">
            
            {/* Availability Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${localFilters.onlyAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} dark:bg-gray-700`}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-900 dark:text-white">{t.onlyAvailable}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t.hideBusy}</span>
                    </div>
                </div>
                <button 
                    onClick={() => setLocalFilters({...localFilters, onlyAvailable: !localFilters.onlyAvailable})}
                    className={`w-14 h-8 rounded-full transition-colors relative ${localFilters.onlyAvailable ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${localFilters.onlyAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Min Power */}
            <div>
                <div className="flex items-center space-x-2 mb-4 text-gray-900 dark:text-white font-bold">
                    <Zap size={20} className="text-yellow-500" />
                    <span>{t.minPower}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[0, 11, 22, 50].map((power) => (
                        <button
                            key={power}
                            onClick={() => setLocalFilters({...localFilters, minPower: power})}
                            className={`py-3 md:py-2 rounded-xl text-sm font-bold border transition-all ${
                                localFilters.minPower === power 
                                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' 
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-400'
                            }`}
                        >
                            {power === 0 ? t.all || 'Alle' : `≥ ${power}kW`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Connector Type */}
            <div>
                <div className="flex items-center space-x-2 mb-4 text-gray-900 dark:text-white font-bold">
                    <Plug size={20} className="text-blue-500" />
                    <span>{t.connectorType}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {(['all', 'Typ 2', 'CCS'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setLocalFilters({...localFilters, type})}
                            className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                                localFilters.type === type 
                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                            }`}
                        >
                            {type === 'all' ? (t.all || 'Alle') : type}
                        </button>
                    ))}
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex space-x-3">
            <button 
                onClick={handleReset}
                className="flex-1 py-3.5 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
                {t.reset}
            </button>
            <button 
                onClick={handleApply}
                className="flex-[2] py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
            >
                {t.apply}
            </button>
        </div>
      </div>
    </div>
  );
};
