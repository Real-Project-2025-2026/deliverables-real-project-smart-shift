
import React, { useEffect } from 'react';
import { Reservation, Language } from '../types';
import { Calendar, Clock, MapPin, XCircle, QrCode, ArrowLeft, Navigation } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ReservationsViewProps {
  reservations: Reservation[];
  onCancel: (id: string) => void;
  onScanStart: (reservationId: string) => void;
  onStartNavigation: (stationId: string) => void;
  onNavigate: (view: any) => void;
  language: Language;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({ reservations, onCancel, onScanStart, onStartNavigation, onNavigate, language }) => {
  const t = TRANSLATIONS[language];

  // Redirect to map if no reservations exist (effectively "removing" the empty page)
  useEffect(() => {
    if (reservations.length === 0) {
      onNavigate('map');
    }
  }, [reservations, onNavigate]);

  if (reservations.length === 0) {
    return null;
  }

  // Sort reservations by date/time (newest first for now, or closest)
  const sortedReservations = [...reservations].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime(); // Nearest first
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in transition-colors">
       {/* Header */}
       <div className="bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm sticky top-0 z-10 pt-safe">
            <button onClick={() => onNavigate('settings')} className="mr-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.myReservations}</h1>
        </div>

       <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-32">
           {sortedReservations.map(res => (
               <div key={res.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 animate-slide-up transition-colors">
                    <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{res.stationName}</h3>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <MapPin size={12} className="mr-1" />
                                Station ID: {res.stationId}
                            </div>
                         </div>
                         <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded">
                             {res.status.toUpperCase()}
                         </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                            <Calendar size={18} className="text-green-500" />
                            <span className="font-medium">{new Date(res.date).toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                            <Clock size={18} className="text-green-500" />
                            <span className="font-medium">{res.startTime} Uhr ({res.durationMinutes}m)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                         <button 
                            onClick={() => onCancel(res.id)}
                            className="col-span-1 py-3 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center active:scale-95"
                            title={t.cancelReservation}
                         >
                            <XCircle size={20} />
                         </button>

                         <button 
                            onClick={() => onStartNavigation(res.stationId)}
                            className="col-span-1 py-3 bg-blue-50 dark:bg-blue-900/10 text-blue-500 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center active:scale-95"
                            title="Navigation starten"
                         >
                            <Navigation size={20} fill="currentColor" />
                         </button>

                         <button 
                            onClick={() => onScanStart(res.id)}
                            className="col-span-2 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 active:scale-95 shadow-green-500/20"
                         >
                            <QrCode size={18} />
                            <span>{t.startCharging}</span>
                         </button>
                    </div>
               </div>
           ))}
       </div>
    </div>
  );
};
