
import React from 'react';
import { Navigation as NavIcon, Car, X, QrCode } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface NavigationActiveOverlayProps { 
    routeInfo: { distance: string; duration: number } | null;
    onStop: () => void;
    onScan: () => void;
    language: Language;
}

export const NavigationActiveOverlay: React.FC<NavigationActiveOverlayProps> = ({ routeInfo, onStop, onScan, language }) => {
    const t = TRANSLATIONS[language];
    return (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none z-[5000] flex flex-col justify-end pb-safe">
            <div className="absolute top-4 left-4 right-4 pointer-events-auto">
                <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-4 text-white shadow-2xl animate-slide-down border border-white/10 flex items-start">
                    <div className="mr-4 mt-1">
                        <NavIcon size={32} className="text-white transform rotate-45" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">In 200m {language === 'de' ? 'rechts' : 'right'}</p>
                        <h2 className="text-xl font-bold leading-tight">Leopoldstraße</h2>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-900 pointer-events-auto rounded-t-3xl shadow-2xl p-6 pb-8 animate-slide-up border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-baseline">
                            {routeInfo ? routeInfo.duration : '--'} <span className="text-base font-medium text-gray-500 ml-1">{t.min}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="font-semibold text-green-500">{routeInfo ? routeInfo.distance : '--'} km</span>
                            <span>•</span>
                            <span>{t.arrival} {new Date(Date.now() + (routeInfo?.duration || 0) * 60000).toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                        <Car className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onStop}
                        className="flex-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/40"
                    >
                        <X size={20} className="mr-2" />
                        {t.cancel}
                    </button>
                    <button 
                        onClick={onScan}
                        className="flex-[1.5] bg-green-500 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center hover:bg-green-600 shadow-lg shadow-green-500/20"
                    >
                        <QrCode size={20} className="mr-2" />
                        {t.scanToCharge}
                    </button>
                </div>
            </div>
        </div>
    );
};
