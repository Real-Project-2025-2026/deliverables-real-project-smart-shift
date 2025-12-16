
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Zap, Clock, AlertTriangle, StopCircle } from 'lucide-react';
import { ActiveSession, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface ChargingViewProps {
  session: ActiveSession;
  onStop: () => void;
  onBack: () => void;
  language: Language;
}

export const ChargingView: React.FC<ChargingViewProps> = ({ session, onStop, onBack, language }) => {
    const [now, setNow] = useState(Date.now());
    const [isConfirming, setIsConfirming] = useState(false);
    const t = TRANSLATIONS[language];

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const totalDuration = session.endTime - session.startTime;
    const elapsed = now - session.startTime;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    const formatTime = (ms: number) => {
        const totalSecs = Math.floor(ms / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const endTimeString = new Date(session.endTime).toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    const handleStopClick = () => {
        if (isConfirming) {
            onStop();
        } else {
            setIsConfirming(true);
            setTimeout(() => setIsConfirming(false), 3000);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-white animate-fade-in relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 right-0 p-6 z-20 pt-safe flex items-center">
                <button onClick={onBack} className="w-10 h-10 bg-[#1E293B] rounded-full flex items-center justify-center hover:bg-[#334155] transition-colors shadow-lg border border-gray-700/50">
                    <ChevronLeft size={20} className="text-gray-300" />
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 mt-[-40px]">
                <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-80">{t.activeCharging}</h2>
                <h1 className="text-2xl font-bold text-center leading-tight mb-2 tracking-tight">{session.stationName}</h1>
                <p className="text-gray-500 text-xs mb-10 font-medium tracking-wide">Station ID: {session.stationId}</p>
                <div className="relative w-72 h-72 flex items-center justify-center mb-8">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                        <circle cx="128" cy="128" r="110" stroke="#1E293B" strokeWidth="8" fill="none" />
                        <circle cx="128" cy="128" r="110" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray={2 * Math.PI * 110} strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <Zap size={36} className="text-green-500 mb-3 fill-green-500 animate-pulse" />
                         <span className="text-6xl font-mono font-bold tracking-tighter text-white tabular-nums">{formatTime(elapsed)}</span>
                         <span className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-[0.2em]">{t.runtime}</span>
                    </div>
                </div>
                <div className="bg-[#1E293B]/80 backdrop-blur-md p-5 rounded-2xl w-full max-w-sm flex items-center justify-between mb-8 border border-white/5 shadow-xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 bg-[#334155]/50 rounded-xl flex items-center justify-center text-orange-400 border border-white/5"><Clock size={22} /></div>
                        <div><span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t.departure}</span><span className="font-bold text-white text-lg tracking-tight">{endTimeString} {language === 'de' ? 'Uhr' : ''}</span></div>
                    </div>
                    <div className="text-right"><span className="block text-[10px] text-gray-400 mb-0.5 tracking-wide">{t.booked}</span><span className="font-bold text-white text-lg tracking-tight">{session.durationMinutes} {t.min}</span></div>
                </div>
                <button onClick={handleStopClick} className={`w-full max-w-sm font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98] border ${isConfirming ? 'bg-red-500/90 text-white border-red-500 shadow-lg shadow-red-500/30' : 'bg-transparent hover:bg-red-500/10 text-[#FF5555] border-[#FF5555]/30 hover:border-[#FF5555]'}`}>
                    {isConfirming ? <><AlertTriangle size={20} /><span>{t.confirmStop}</span></> : <><StopCircle size={20} /><span>{t.stopCharging}</span></>}
                </button>
            </div>
        </div>
    );
};
