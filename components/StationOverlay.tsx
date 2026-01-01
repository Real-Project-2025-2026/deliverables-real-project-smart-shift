
import React, { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Navigation as NavIcon, Star, Car, Navigation, Calendar, ChevronLeft, CheckCircle, ArrowRight, AlertTriangle, ScanLine, Info, Zap, ParkingSquare } from 'lucide-react';
import { Station, Vehicle, Language, Reservation } from '../types';
import { TRANSLATIONS } from '../constants';

interface StationOverlayProps {
  station: Station | null;
  userVehicle?: Vehicle;
  onClose: () => void;
  onScan: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  routeInfo?: { distance: string; time: number } | null;
  language: Language;
  onReserve: (reservation: Reservation) => void;
  activeReservation?: Reservation | null;
  hasActiveBooking?: boolean;
  onStartNavigation?: () => void;
}

export const StationOverlay: React.FC<StationOverlayProps> = ({ station, userVehicle, onClose, onScan, isFavorite, onToggleFavorite, routeInfo, language, onReserve, activeReservation, hasActiveBooking = false, onStartNavigation }) => {
  const [view, setView] = useState<'details' | 'confirm' | 'success'>('details');
  const [reservationDate, setReservationDate] = useState(new Date().toISOString().slice(0, 10));
  const [reservationTime, setReservationTime] = useState('');
  const [duration, setDuration] = useState(60); // Default to 60 minutes
  
  // New State for Date Selection Tabs
  const [selectedDateIndex, setSelectedDateIndex] = useState(0); // 0 = Today, 1 = Tomorrow, 2 = Day After

  const t = TRANSLATIONS[language];

  // Helper to generate date options
  const dateOptions = useMemo(() => {
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 3; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          let label = '';
          if (i === 0) label = t.today;
          else if (i === 1) label = t.tomorrow;
          else label = d.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { weekday: 'short', day: '2-digit' });
          
          dates.push({
              index: i,
              label: label,
              value: d.toISOString().slice(0, 10),
              dateObj: d
          });
      }
      return dates;
  }, [language, t.today, t.tomorrow]);

  // Update reservationDate when tab changes
  useEffect(() => {
      setReservationDate(dateOptions[selectedDateIndex].value);
      // Reset time selection when date changes to prevent invalid states
      setReservationTime('');
  }, [selectedDateIndex, dateOptions]);

  // Generate 30-minute slots and check validity based on DURATION
  const timeSlots30Min = useMemo(() => {
      if (!station) return [];
      
      const slots = [];
      const today = new Date();
      const isToday = selectedDateIndex === 0;
      
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const currentSlotIndexNow = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);

      const requiredChunks = duration / 30;
      const openingHour = 6; 

      for (let i = 0; i < 48; i++) {
          const hour = Math.floor(i / 2);
          const minute = (i % 2) * 30;
          const slotStartTime = hour + (minute / 60);
          
          if (hour < openingHour) continue;
          if (slotStartTime > 22) continue;

          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          if (isToday) {
              if (i <= currentSlotIndexNow) {
                  continue; 
              }
          }

          const dayShift = selectedDateIndex * 6; 

          let isFit = true;
          let reason = '';
          
          if (i + requiredChunks > 48) {
              isFit = false;
              reason = t.tooShort;
          } else {
              for(let k = 0; k < requiredChunks; k++) {
                  const checkIndex = (i + k + dayShift) % 48; 
                  const status = station.availability[checkIndex] ?? 2; 
                  if (status !== 2) {
                      isFit = false;
                      reason = t.occupied;
                      break;
                  }
              }
          }

          slots.push({
              time: timeString,
              status: isFit ? 2 : 1, 
              reason: reason,
              price: station.price
          });
      }
      return slots;
  }, [station, selectedDateIndex, duration, t.tooShort, t.occupied]);

  useEffect(() => {
      if (station) {
          setView('details');
          setReservationTime(''); 
      }
  }, [station]); 

  if (!station) return null;

  const parkingCost = station.parkingFee;
  const effectiveChargingMinutes = Math.max(0, duration - 5);
  const energyCost = (station.power * (effectiveChargingMinutes / 60) * (station.price / 100)); 

  const estimatedPriceValue = parkingCost + energyCost;
  const reservationCost = estimatedPriceValue.toFixed(2);
  const parkingCostStr = parkingCost.toFixed(2);
  const energyCostStr = energyCost.toFixed(2);

  const handleFinalizeReservation = () => {
      const newReservation: Reservation = {
          id: Math.random().toString(36).substr(2, 9),
          stationId: station.id,
          stationName: station.name,
          date: reservationDate,
          startTime: reservationTime,
          durationMinutes: duration,
          estimatedPrice: estimatedPriceValue,
          status: 'active'
      };
      onReserve(newReservation);
      setView('success');
  };

  const handleSlotClick = (slot: { time: string, status: number }) => {
      if (slot.status === 2 && !hasActiveBooking) { 
          setReservationTime(slot.time);
      }
  };

  const durationOptions = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];

  return (
    <div className="fixed inset-0 z-[5000] flex items-end md:items-center md:justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300 animate-fade-in" 
        onClick={onClose} 
      />

      <div className="pointer-events-auto bg-white dark:bg-gray-900 w-full md:w-[480px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh] transition-transform duration-300 animate-slide-up overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10 flex-shrink-0">
             {view === 'details' ? (
                <div className="flex-1 min-w-0 pr-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate tracking-tight">{station.name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{station.address}</p>
                </div>
             ) : (
                 <div className="flex items-center">
                    <button onClick={() => setView('details')} className="mr-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ChevronLeft size={24} className="text-gray-700 dark:text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{view === 'success' ? t.reservationSuccess : t.summary}</h2>
                 </div>
             )}

             <div className="flex items-center space-x-2 ml-auto flex-shrink-0">
                {view === 'details' && (
                    <button 
                        onClick={onStartNavigation} 
                        className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg shadow-blue-500/30 active:scale-90 transition-all"
                        title={t.startNavigation}
                    >
                        <Navigation size={20} fill="currentColor" />
                    </button>
                )}
                <button onClick={onClose} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 active:scale-90 transition-transform">
                    <X size={20} />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
            
            {view === 'success' && (
                <div className="flex flex-col items-center justify-center py-8 animate-fade-in h-full">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-lg shadow-green-500/20">
                        <CheckCircle size={56} className="animate-float" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs">{t.reservationSuccessSub}</p>
                </div>
            )}

            {view === 'details' && (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {routeInfo && (
                            <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg text-xs font-bold">
                                <Car size={14} className="mr-1.5" />
                                <span>~{routeInfo.time} {t.min} ({routeInfo.distance} km)</span>
                            </div>
                        )}
                        <div className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center">
                            {station.locationType === 'garage' ? <ParkingSquare size={14} className="mr-1.5" /> : <MapPin size={14} className="mr-1.5" />}
                            {station.locationType === 'garage' ? t.garage : t.outdoor}
                        </div>
                        <div className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300">
                            {station.type} • {station.power} kW
                        </div>
                        <div className="px-2.5 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs font-bold text-yellow-700 dark:text-yellow-500 flex items-center">
                            <Star size={12} fill="currentColor" className="mr-1" /> {station.rating}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">{t.priceBreakdown}</h3>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <ParkingSquare size={16} className="text-blue-500 mr-2" />
                                <span className="text-sm text-gray-700 dark:text-gray-200">{t.parkingFee}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{station.parkingFee.toFixed(2)} € ({t.oneTime})</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <Zap size={16} className="text-yellow-500 mr-2" />
                                <span className="text-sm text-gray-700 dark:text-gray-200">{t.energyCost}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{(station.price / 100).toFixed(2)} € / kWh</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{t.chargingDuration}</h3>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                                {t.total}: ~ {reservationCost} €
                            </span>
                        </div>
                        
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/10 p-2.5 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-start">
                             <Info size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                             <p className="text-xs text-blue-700 dark:text-blue-300 leading-tight font-medium">
                                {t.priceInfoBuffer}
                             </p>
                        </div>

                        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                            {durationOptions.map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setDuration(mins)}
                                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border relative overflow-hidden ${
                                        duration === mins
                                        ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg transform scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    {mins < 60 ? `${mins} ${t.min}` : `${(mins/60).toString().replace('.', ',')} ${t.hours}`}
                                    {duration === mins && (
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-bl-md" title="5 min buffer included"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="text-[10px] text-gray-400 text-right mt-1 flex items-center justify-end">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></div>
                            + 5 min Puffer
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <div className="flex">
                            {dateOptions.map((opt) => (
                                <button
                                    key={opt.index}
                                    onClick={() => setSelectedDateIndex(opt.index)}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                        selectedDateIndex === opt.index
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm scale-[1.02]'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                         <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">{t.timeSlots}</h3>
                         <div className="grid grid-cols-4 gap-3">
                            {timeSlots30Min.map((slot, idx) => {
                                const isSelected = reservationTime === slot.time;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSlotClick(slot)}
                                        disabled={slot.status !== 2 || hasActiveBooking}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 relative overflow-hidden border flex flex-col items-center justify-center ${
                                            slot.status === 2
                                            ? isSelected 
                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-[1.03] z-10'
                                                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                            : 'bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 cursor-not-allowed border-transparent'
                                        }`}
                                    >
                                        <span className={slot.status !== 2 ? 'line-through decoration-gray-300 dark:decoration-gray-600' : ''}>{slot.time}</span>
                                        {slot.status !== 2 && (
                                            <span className="text-[9px] uppercase font-bold text-gray-400 mt-0.5">{slot.reason}</span>
                                        )}
                                    </button>
                                );
                            })}
                            {timeSlots30Min.length === 0 && (
                                <div className="col-span-4 py-8 text-center text-sm text-gray-400 font-medium">
                                    {t.noSlots}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'confirm' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{station.name}</h3>
                         
                         <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                             <span className="text-gray-500">{t.date}</span>
                             <span className="font-bold text-gray-900 dark:text-white">{new Date(reservationDate).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}</span>
                         </div>
                         
                         <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                             <span className="text-gray-500">{t.startTime}</span>
                             <span className="font-bold text-gray-900 dark:text-white">{reservationTime}</span>
                         </div>

                         <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                             <span className="text-gray-500">{t.duration}</span>
                             <span className="font-bold text-gray-900 dark:text-white block">{duration} {t.min}</span>
                         </div>

                         <div className="py-2 space-y-2">
                             <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                                 <span>{t.parkingFee} ({t.oneTime})</span>
                                 <span>{parkingCostStr} €</span>
                             </div>
                             <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                                 <span>{t.energyEstimated}</span>
                                 <span>{energyCostStr} €</span>
                             </div>
                         </div>

                         <div className="flex justify-between items-center py-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                             <span className="text-gray-900 dark:text-white font-bold">{t.totalPrice}</span>
                             <span className="font-extrabold text-emerald-500 text-xl">{reservationCost} €</span>
                         </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl flex items-start border border-emerald-100 dark:border-emerald-900/30">
                        <AlertTriangle className="text-emerald-500 mr-2 flex-shrink-0" size={18} />
                        <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                            {t.confirmBindingSub}
                        </p>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 pb-safe z-10 flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            {view === 'success' ? (
                 <div className="flex flex-col space-y-3">
                     <button 
                        onClick={() => {
                            if (onStartNavigation) onStartNavigation();
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    >
                        <NavIcon size={20} className="mr-2" />
                        <span>{t.startNavigation}</span>
                    </button>
                </div>
            ) : view === 'confirm' ? (
                 <button 
                    onClick={handleFinalizeReservation}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                    <span>{t.confirmBinding}</span>
                    <ArrowRight size={20} className="ml-2" />
                </button>
            ) : (
                <div className="flex space-x-3">
                     <button 
                        onClick={() => setView('confirm')}
                        disabled={!reservationTime || hasActiveBooking}
                        className={`flex-[2] py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
                            !reservationTime || hasActiveBooking
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 active:scale-[0.98]'
                        }`}
                    >
                        <Calendar size={18} />
                        <span>{t.reserve}</span>
                    </button>

                    <button 
                        onClick={onScan}
                        disabled={hasActiveBooking && !activeReservation}
                        className={`flex-1 bg-[#1c1c1e] dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl shadow-lg transition-transform flex items-center justify-center space-x-2 ${
                            hasActiveBooking && !activeReservation ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98] hover:bg-gray-900 dark:hover:bg-gray-100'
                        }`}
                    >
                        <ScanLine size={18} />
                        <span>QR</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
