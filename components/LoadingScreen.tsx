
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] flex flex-col items-center justify-center animate-fade-in transition-colors duration-300">
      <div className="relative mb-8">
        <div className="w-48 h-48 flex items-center justify-center animate-bounce">
            <svg viewBox="0 0 24 24" className="w-full h-full text-green-600 dark:text-green-500 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" fill="currentColor" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-white dark:stroke-gray-900" />
            </svg>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/10 dark:bg-white/10 blur-xl rounded-full"></div>
      </div>
      <h1 className="text-4xl font-extrabold text-green-900 dark:text-white tracking-tighter uppercase mb-3">Smart Shift</h1>
      <p className="text-green-800 dark:text-green-400 font-bold tracking-[0.2em] text-xs uppercase">YOUR WALLBOX - THEIR JOURNEY</p>
    </div>
  );
};
