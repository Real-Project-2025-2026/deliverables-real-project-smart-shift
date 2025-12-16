
import React from 'react';
import { CalendarClock, ChevronLeft } from 'lucide-react';
import { Reservation, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

export const ActiveReservationBanner: React.FC<{ reservation: Reservation, onOpen: () => void, language: Language }> = ({ reservation, onOpen, language }) => {
    const t = TRANSLATIONS[language];
    return (
        <div onClick={onOpen} className="bg-white dark:bg-gray-800 rounded-2xl p-3 pr-4 w-full max-w-sm pointer-events-auto animate-slide-up transform transition-all duration-300 cursor-pointer shadow-2xl flex items-center justify-between group border border-gray-100 dark:border-gray-700 relative overflow-hidden mx-auto mb-4">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 h-full"></div>
            <div className="flex items-center space-x-4 pl-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm"><CalendarClock size={24} /></div>
                <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate pr-2">{t.activeReservation}</h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400 mr-1.5">{reservation.startTime} {language === 'de' ? 'Uhr' : ''}</span>
                        <span className="truncate max-w-[120px]">{reservation.stationName}</span>
                    </div>
                </div>
            </div>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors flex-shrink-0"><ChevronLeft className="rotate-180" size={20} /></div>
        </div>
    );
};
