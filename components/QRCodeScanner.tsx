
import React, { useEffect, useState } from 'react';
import { X, Camera, Zap } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface QRCodeScannerProps {
  onClose: () => void;
  onScanSuccess: () => void;
  targetStationName?: string;
  language: Language;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onClose, onScanSuccess, targetStationName, language }) => {
  const [loading, setLoading] = useState(true);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // Simulate camera initialization
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[6000] flex flex-col animate-fade-in">
      
      {/* 1. Layer: Camera Feed (Background) */}
      <div className="absolute inset-0 overflow-hidden">
        {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white/50">
                <Camera className="animate-pulse mb-4 opacity-50" size={48} />
                <p className="text-sm font-medium">{t.cameraStarting}</p>
            </div>
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="w-full h-full opacity-40 bg-[url('https://images.unsplash.com/photo-1635329383457-4b52b3145d8b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            </div>
        )}
      </div>

      {/* 2. Layer: UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
        
        {/* Top Header (Floating) */}
        <div className="flex justify-between items-start p-6 pt-12 md:pt-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
            <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white drop-shadow-md tracking-tight">
                    {targetStationName ? t.activateReservation : t.scanQRCode}
                </h2>
                {targetStationName && (
                    <p className="text-green-400 text-xs font-bold uppercase tracking-wider mt-1 flex items-center">
                        <Zap size={12} className="mr-1 fill-current" />
                        {targetStationName}
                    </p>
                )}
            </div>
            <button 
                onClick={onClose} 
                className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all active:scale-90 border border-white/10"
            >
                <X size={24} />
            </button>
        </div>

        {/* Center: Scan Frame */}
        <div className="flex-1 flex items-center justify-center relative">
            {!loading && (
                <div className={`relative w-72 h-72 rounded-3xl border-2 shadow-2xl overflow-hidden transition-colors ${targetStationName ? 'border-green-500/50 shadow-green-500/20' : 'border-white/20'}`}>
                     {/* Corners */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-green-500 rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-green-500 rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-green-500 rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-green-500 rounded-br-2xl"></div>
                    
                    {/* Scan beam */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-green-400/80 shadow-[0_0_20px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    
                    {/* Target Overlay Text */}
                    {targetStationName && (
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <span className="bg-black/60 text-white/90 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                                {t.searchingCode}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Bottom Footer (Gradient) */}
        <div className="p-8 pb-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center space-y-6 pointer-events-auto">
             <div className="bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                <p className="text-white/90 text-sm text-center max-w-xs leading-relaxed font-medium drop-shadow-sm">
                    {targetStationName 
                        ? (language === 'de' ? `Scannen Sie den QR-Code an "${targetStationName}", um das Laden zu starten.` : `Scan the QR code at "${targetStationName}" to start charging.`)
                        : t.scanInstruction}
                </p>
             </div>
             
             <button 
                onClick={onScanSuccess}
                className={`px-10 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all w-full max-w-xs flex items-center justify-center space-x-2 ${
                    targetStationName 
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
            >
                {targetStationName ? (
                    <>
                        <Zap size={20} fill="currentColor" />
                        <span>{t.startCharging}</span>
                    </>
                ) : (
                    <span>{t.simulateScan}</span>
                )}
            </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
