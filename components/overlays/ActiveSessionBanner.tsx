
import React, { useState, useEffect } from 'react';
import { Zap, Clock, Maximize2 } from 'lucide-react';
import { ActiveSession, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

export const ActiveSessionBanner: React.FC<{ session: ActiveSession, onOpen: () => void, language: Language }> = ({ session, onOpen, language }) => {
    const t = TRANSLATIONS[language];
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);
    const elapsed = now - session.startTime;
    const formatTime = (ms: number) => {
        const totalSecs = Math.floor(ms / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    return (
        <div onClick={onOpen} className="bg-white dark:bg-gray-800 rounded-2xl p-3 pr-4 w-full max-w-sm pointer-events-auto animate-slide-up transform transition-all duration-300 cursor-pointer shadow-2xl flex items-center justify-between group border border-gray-100 dark:border-gray-700 relative overflow-hidden mx-auto mb-4">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500 h-full"></div>
            <div className="flex items-center space-x-4 pl-4">
                <div className="relative">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-green-500 shadow-lg"><Zap size={24} fill="currentColor" className="animate-pulse" /></div>
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{t.activeCharging}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium mt-1"><Clock size={14} className="mr-1.5" /><span className="font-mono tracking-wide">{formatTime(elapsed)}</span></div>
                </div>
            </div>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors"><Maximize2 size={18} /></div>
        </div>
    );
};
