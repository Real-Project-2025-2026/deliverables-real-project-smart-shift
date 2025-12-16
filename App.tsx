import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Components
import { Navigation } from './components/Navigation';
import { StationOverlay } from './components/StationOverlay';
import { StationList } from './components/StationList';
import { QRCodeScanner } from './components/QRCodeScanner';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { ReservationsView } from './components/ReservationsView';
import { ReviewModal } from './components/ReviewModal';
import { ChargingView } from './components/charging/ChargingView';
import { NavigationActiveOverlay } from './components/navigation/NavigationActiveOverlay';
import { ActiveSessionBanner } from './components/overlays/ActiveSessionBanner';
import { ActiveReservationBanner } from './components/overlays/ActiveReservationBanner';
import { MapController } from './components/map/MapController';
import { FilterModal, FilterOptions } from './components/FilterModal';

// Logic & Types
import { Station, ChargingSession, UserProfile, ActiveSession, Reservation } from './types';
import { MUNICH_CENTER, MUNICH_BOUNDS, INITIAL_VEHICLES, TRANSLATIONS, MOCK_STATIONS } from './constants';
import { searchLocations, getDistanceFromLatLonInKm } from './utils';
import { useAppEngine } from './hooks/useAppEngine.ts';
import { stationService } from './services/StationService.ts';

// Icons
import { Zap, Search, Crosshair, Map as MapIcon, LayoutList, Locate, Filter, Loader2, MapPin } from 'lucide-react';

const createMarkerIcon = (color: string) => L.divIcon({
    className: 'custom-marker',
    html: `<div class="leaflet-interactive" style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const GreenIcon = createMarkerIcon('#10b981'); 
const RedIcon = createMarkerIcon('#ef4444');   
const GrayIcon = createMarkerIcon('#94a3b8');  

const App: React.FC = () => {
  const { state, actions } = useAppEngine();
  const t = TRANSLATIONS[state.language];

  // Local UI State (Not persisted/global)
  const [showList, setShowList] = useState(false);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
      onlyAvailable: false,
      minPower: 0,
      type: 'all'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [reviewingSessionId, setReviewingSessionId] = useState<string | null>(null);
  const [scanningReservationId, setScanningReservationId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.isAuthenticated) actions.locateUser();
  }, [state.isAuthenticated, actions]);

  useEffect(() => {
      // Setup Themes
      if (state.theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  }, [state.theme]);

  // FOLLOW USER LOGIC: Update map center when user moves AND following is enabled
  useEffect(() => {
      if (state.isFollowingUser && state.userPosition) {
          actions.setMapCenter([state.userPosition.lat, state.userPosition.lng]);
          // Optional: Force zoom level if needed, or let user control zoom
          // actions.setMapZoom(18); 
      }
  }, [state.userPosition, state.isFollowingUser, actions]);

  // Search Logic
  useEffect(() => {
      if (searchQuery.trim().length === 0) {
          setSearchSuggestions([]);
          setIsSearching(false);
          return;
      }
      setIsSearching(true);
      const delayDebounceFn = setTimeout(async () => {
        try {
            const results = await searchLocations(searchQuery);
            setSearchSuggestions(results);
        } catch (error) { console.error(error); } 
        finally { setIsSearching(false); }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAuthLogin = useCallback((isDemo = false, newProfile?: UserProfile) => {
      if (newProfile) {
          actions.registerUser(newProfile);
          actions.setVehicles([]);
          actions.setCurrentView('onboarding');
      } else if(isDemo) {
         if(state.vehicles.length === 0) actions.setVehicles(INITIAL_VEHICLES);
         
         // Generate random history if empty for demo users to make it look alive
         if (state.chargingHistory.length === 0) {
             const randomHistory: ChargingSession[] = [];
             // Increased number of sessions for better demo experience
             const numSessions = Math.floor(Math.random() * 13) + 12; // 12 to 25 sessions
             
             for(let i=0; i<numSessions; i++) {
                 const station = MOCK_STATIONS[Math.floor(Math.random() * MOCK_STATIONS.length)];
                 const duration = Math.floor(Math.random() * 120) + 30; // 30-150 mins
                 const kwh = parseFloat(((duration / 60) * station.power * 0.8).toFixed(1)); // approximate realistic usage
                 // Price: One-time parking fee + Energy cost
                 const price = parseFloat((station.parkingFee + (kwh * (station.price/100))).toFixed(2));
                 
                 const date = new Date();
                 // Spread dates over last 90 days
                 date.setDate(date.getDate() - Math.floor(Math.random() * 90) - 1);
                 // Random time between 07:00 and 22:00
                 date.setHours(Math.floor(Math.random() * 15) + 7, Math.floor(Math.random() * 60));
                 
                 randomHistory.push({
                     id: Math.random().toString(36).substr(2, 9),
                     stationName: station.name,
                     address: station.address,
                     date: date.toISOString(),
                     durationMinutes: duration,
                     kwh: kwh,
                     totalPrice: price,
                     rating: Math.random() > 0.4 ? Math.floor(Math.random() * 2) + 4 : undefined,
                     feedback: Math.random() > 0.8 ? "Alles super!" : undefined
                 });
             }
             // Sort by date desc
             randomHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             actions.setChargingHistory(randomHistory);
         }
      }
      actions.setIsAuthenticated(true);
  }, [actions, state.vehicles.length, state.chargingHistory.length]);

  const handleStopCharging = useCallback(() => {
    if (!state.activeSession) return;
    const session = state.activeSession;
    const bookedDurationMinutes = session.durationMinutes;
    const hours = Math.max(0, bookedDurationMinutes - 5) / 60;
    const kwh = hours * session.power;
    const price = kwh * (session.pricePerKwh / 100);

    const completedSession: ChargingSession = {
        id: session.id,
        stationName: session.stationName,
        address: session.address,
        date: new Date(session.startTime).toISOString(),
        durationMinutes: bookedDurationMinutes,
        kwh: parseFloat(kwh.toFixed(2)),
        totalPrice: parseFloat(price.toFixed(2))
    };

    actions.setChargingHistory([completedSession, ...state.chargingHistory]);
    actions.setActiveSession(null);
    
    // Stop navigation if active
    actions.setIsNavigating(false);
    actions.setNavigationPath(null);
    actions.setIsFollowingUser(false);

    setReviewingSessionId(completedSession.id);
    actions.setCurrentView('history');
  }, [state.activeSession, state.chargingHistory, actions]);

  const handleScanSuccess = useCallback(() => {
    // Check if there is a pending reservation match
    let res: Reservation | undefined = scanningReservationId ? state.reservations.find(r => r.id === scanningReservationId) : undefined;
    
    // Fallback: Pick nearest future reservation
    if (!res && state.reservations.length > 0) {
        res = state.activeReservation || undefined;
    }

    if (res) {
        const station = MOCK_STATIONS.find(s => s.id === res!.stationId);
        const [year, month, day] = res.date.split('-').map(Number);
        const [hour, minute] = res.startTime.split(':').map(Number);
        const resStart = new Date(year, month - 1, day, hour, minute);
        const resEnd = new Date(resStart);
        resEnd.setMinutes(resEnd.getMinutes() + res.durationMinutes);

        const newActive: ActiveSession = {
            id: Math.random().toString(36).substr(2, 9),
            stationId: res.stationId,
            stationName: res.stationName,
            address: `Station ID: ${res.stationId}`,
            startTime: Date.now(),
            endTime: resEnd.getTime(),
            durationMinutes: res.durationMinutes,
            power: station ? station.power : 11,
            pricePerKwh: station ? station.price : 45
        };
        actions.setActiveSession(newActive);
        actions.setReservations(state.reservations.filter(r => r.id !== res!.id));
        
        // Stop navigation when charging starts (user arrived)
        actions.setIsNavigating(false);
        actions.setNavigationPath(null);
        actions.setIsFollowingUser(false);

        actions.setCurrentView('charging');
    } else {
        alert(t.noReservationsFound);
        actions.setCurrentView('map');
    }
    setScanningReservationId(null);
  }, [scanningReservationId, state.reservations, state.activeReservation, actions, t.noReservationsFound]);

  const routeInfo = useMemo(() => {
    if(!state.selectedStation || !state.userPosition) return null;
    if(state.navigationInfo) return { distance: state.navigationInfo.distance, time: state.navigationInfo.duration };
    const dist = getDistanceFromLatLonInKm(state.userPosition.lat, state.userPosition.lng, state.selectedStation.lat, state.selectedStation.lng);
    return { distance: dist.toFixed(1), time: Math.round((dist / 30) * 60) };
  }, [state.selectedStation, state.userPosition, state.navigationInfo]);

  // Apply filters to stations
  const filteredStations = useMemo(() => {
      return stationService.filterStations(MOCK_STATIONS, filters);
  }, [filters]);

  const nearbyStations = useMemo(() => stationService.getNearestStations(state.mapCenter[0], state.mapCenter[1]), [state.mapCenter]);

  // Check if any filter is active for styling
  const isFilterActive = filters.onlyAvailable || filters.minPower > 0 || filters.type !== 'all';

  // --- Views ---
  if (!state.isAuthenticated) return <AuthView onLogin={handleAuthLogin} onValidateCredentials={actions.validateCredentials} language={state.language} onSetLanguage={actions.setLanguage} />;
  
  if (state.currentView === 'charging' && state.activeSession) {
      return <ChargingView session={state.activeSession} onStop={handleStopCharging} onBack={() => actions.setCurrentView('map')} language={state.language} />;
  }

  // Updated 'isSettingsView' to include 'contact' and 'history' explicitly
  const isSettingsView = ['settings', 'vehicle_edit', 'profile_edit', 'payment', 'language_select', 'faq', 'terms', 'privacy', 'host_apply', 'history', 'contact', 'onboarding', 'vehicle_edit_onboarding'].includes(state.currentView);
  const isOnboardingFlow = state.currentView === 'onboarding' || state.currentView === 'vehicle_edit_onboarding';

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden animate-fade-in transition-colors duration-500">
      
      <ReviewModal 
        isOpen={!!reviewingSessionId} 
        onClose={() => {
            setReviewingSessionId(null);
            actions.setCurrentView('map'); // Redirect to map after closing/skipping
        }}
        onSubmit={(rating, feedback) => {
            if(reviewingSessionId) {
                actions.setChargingHistory(state.chargingHistory.map(s => s.id === reviewingSessionId ? { ...s, rating, feedback } : s));
                setReviewingSessionId(null);
                actions.setCurrentView('map'); // Redirect to map after submitting
            }
        }}
        language={state.language}
      />

      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={filters}
        onApply={setFilters}
        language={state.language}
      />

      <main className="flex-1 relative h-full">
        {/* Map Layer */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${state.currentView === 'map' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
             {!state.isNavigating && (
                 <div className="absolute top-0 left-0 right-0 z-[2000] p-4 pt-6 flex flex-col gap-3 pointer-events-none items-center">
                    <div ref={searchContainerRef} className="w-full max-w-md pointer-events-auto flex flex-col">
                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full shadow-lg flex items-center p-3.5 border border-white/40 dark:border-gray-700/50">
                            <Search className="text-gray-400 ml-2" size={20} />
                            <input 
                                ref={searchInputRef}
                                type="text"
                                placeholder={t.searchPlaceholder}
                                className="flex-1 ml-3 outline-none text-gray-700 dark:text-gray-200 bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                aria-label="Suche Ladestation"
                            />
                            {isSearching ? <Loader2 size={16} className="text-green-500 animate-spin mr-1" /> : searchQuery && (
                                <button onClick={() => { setSearchQuery(''); actions.setSelectedStation(null); }} className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full" aria-label="Suche löschen">
                                    <Crosshair size={16} className="text-gray-600 dark:text-gray-300" />
                                </button>
                            )}
                        </div>
                        {showSuggestions && (
                            <div className="mt-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden animate-slide-up origin-top max-h-[60vh] overflow-y-auto no-scrollbar">
                                {searchQuery.length === 0 && nearbyStations.map(station => (
                                    <button key={station.id} onClick={() => {
                                        actions.setSelectedStation(station);
                                        actions.setMapCenter([station.lat, station.lng]);
                                        actions.setMapZoom(15);
                                        setShowSuggestions(false);
                                        setSearchQuery(station.name);
                                        actions.setIsFollowingUser(false); // Stop following on manual selection
                                    }} className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-between group transition-colors">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><Zap size={16} className="text-green-600" /></div>
                                            <div className="min-w-0 flex-1"><div className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{station.name}</div></div>
                                        </div>
                                    </button>
                                ))}
                                {searchSuggestions.map((item, idx) => (
                                    <button key={idx} onClick={() => {
                                        actions.setMapCenter([item.lat, item.lng]);
                                        actions.setMapZoom(15);
                                        if (item.type === 'station') actions.setSelectedStation(item.data);
                                        setSearchQuery(item.label);
                                        setShowSuggestions(false);
                                        actions.setIsFollowingUser(false); // Stop following on manual search
                                    }} className="w-full text-left p-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-700/30">
                                        <div className="flex items-center space-x-3"><MapPin size={16} /><span className="font-semibold">{item.label}</span></div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>
             )}
             
             <MapContainer 
                center={MUNICH_CENTER} 
                zoom={13} 
                minZoom={10}
                maxBounds={MUNICH_BOUNDS}
                style={{ height: '100%', width: '100%' }} 
                zoomControl={false}
             >
                <MapController 
                    center={state.mapCenter} 
                    zoom={state.mapZoom} 
                    onUserInteraction={() => {
                        // If map is dragged, stop following user
                        if (state.isFollowingUser) {
                            actions.setIsFollowingUser(false);
                        }
                    }}
                />
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                
                {filteredStations.map(station => (
                    <Marker 
                        key={station.id} 
                        position={[station.lat, station.lng]}
                        icon={station.status === 'available' ? GreenIcon : (station.status === 'busy' ? RedIcon : GrayIcon)}
                        eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e.originalEvent); actions.setSelectedStation(station); if(state.isNavigating) actions.setIsNavigating(false); actions.setIsFollowingUser(false); }}}
                    />
                ))}
                
                {state.userPosition && <CircleMarker center={[state.userPosition.lat, state.userPosition.lng]} radius={8} pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }} />}
                {state.navigationPath && <Polyline positions={state.navigationPath} pathOptions={{ color: '#3b82f6', weight: 8, opacity: 0.8 }} />}
            </MapContainer>

            {/* Map UI Overlays */}
            {showList && !state.isNavigating && (
                <StationList 
                    stations={filteredStations} 
                    onSelect={(s) => { actions.setSelectedStation(s); actions.setMapCenter([s.lat, s.lng]); actions.setMapZoom(16); setShowList(false); actions.setIsFollowingUser(false); }}
                    language={state.language}
                />
            )}
            
            {!state.isNavigating && (
                <div className="absolute bottom-28 right-4 z-[1000] flex flex-col space-y-3 pointer-events-none">
                     <button onClick={() => {
                        const nearest = stationService.findNearestAvailable(state.mapCenter[0], state.mapCenter[1]);
                        if(nearest) { actions.setSelectedStation(nearest); actions.setMapCenter([nearest.lat, nearest.lng]); actions.setMapZoom(16); actions.setIsFollowingUser(false); }
                     }} className="pointer-events-auto bg-green-500 p-3.5 rounded-full shadow-lg text-white hover:bg-green-600 border border-green-400/50 transition-transform active:scale-90 flex items-center justify-center backdrop-blur-sm" aria-label="Nächste Ladestation finden"><Zap size={24} fill="currentColor" /></button>
                     <button onClick={() => setIsFilterOpen(true)} className={`pointer-events-auto p-3.5 rounded-full shadow-lg transition-transform active:scale-90 relative backdrop-blur-md ${isFilterActive ? 'bg-green-500 border-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white'}`} aria-label="Filter öffnen">
                         <Filter size={24} />
                         {isFilterActive && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white"></div>}
                     </button>
                     <button onClick={() => setShowList(!showList)} className="pointer-events-auto bg-white/90 dark:bg-gray-800/90 p-3.5 rounded-full shadow-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-transform active:scale-90 backdrop-blur-md" aria-label={showList ? "Liste schließen" : "Liste öffnen"}>{showList ? <MapIcon size={24} className="text-green-600" /> : <LayoutList size={24} />}</button>
                     <button onClick={() => {
                         if (state.userPosition) {
                             actions.setMapCenter([state.userPosition.lat, state.userPosition.lng]);
                             actions.setIsFollowingUser(true); // Re-enable following on click
                         } else {
                             actions.locateUser();
                         }
                     }} className={`pointer-events-auto bg-white/90 dark:bg-gray-800/90 p-3.5 rounded-full shadow-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-90 backdrop-blur-md ${state.isFollowingUser ? 'text-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`} aria-label="Eigenen Standort lokalisieren"><Locate size={24} className={state.userPosition && !state.isFollowingUser ? 'text-blue-500' : ''} /></button>
                </div>
            )}
        </div>

        {/* Station Detail Overlay */}
        {!state.isNavigating && state.currentView === 'map' && (
            <StationOverlay 
                station={state.selectedStation} 
                userVehicle={state.vehicles[0]}
                isFavorite={state.selectedStation ? state.favorites.includes(state.selectedStation.id) : false}
                onToggleFavorite={() => {}} // simplified
                routeInfo={routeInfo}
                language={state.language}
                onClose={() => actions.setSelectedStation(null)} 
                onScan={() => {
                    const res = state.reservations.find(r => r.stationId === state.selectedStation?.id);
                    if(res) setScanningReservationId(res.id);
                    actions.setSelectedStation(null);
                    actions.setCurrentView('scanner');
                }}
                onReserve={(res) => actions.setReservations([...state.reservations, res])}
                activeReservation={state.activeReservation}
                hasActiveBooking={!!state.activeSession || state.reservations.length > 0}
                onStartNavigation={actions.handleStartNavigation} 
            />
        )}

        {/* Full Screen Views */}
        {isSettingsView && (
            <div className="absolute inset-0 z-[50] bg-gray-50 dark:bg-gray-900 overflow-y-auto animate-fade-in">
                <SettingsView 
                    onNavigate={(view) => actions.setCurrentView(view === 'language' ? 'language_select' : view)}
                    onLogout={() => { actions.setIsAuthenticated(false); actions.setCurrentView('map'); }}
                    subView={state.currentView === 'language_select' ? 'language' : state.currentView === 'settings' ? 'main' : state.currentView === 'vehicle_edit_onboarding' ? 'vehicle_edit' : state.currentView as any}
                    vehicles={state.vehicles}
                    onUpdateVehicles={actions.setVehicles}
                    userProfile={state.userProfile}
                    onUpdateProfile={actions.setUserProfile}
                    theme={state.theme}
                    onToggleTheme={actions.toggleTheme}
                    language={state.language}
                    onSetLanguage={actions.setLanguage}
                    paymentMethods={state.paymentMethods}
                    onUpdatePaymentMethods={actions.setPaymentMethods}
                    isOnboarding={isOnboardingFlow}
                    chargingHistory={state.chargingHistory}
                    onRateSession={(id) => setReviewingSessionId(id)}
                />
            </div>
        )}

        {state.currentView === 'reservations' && (
            <div className="absolute inset-0 z-[50] bg-gray-50 dark:bg-gray-900 overflow-y-auto animate-fade-in">
                <ReservationsView 
                    reservations={state.reservations}
                    onCancel={(id) => actions.setReservations(state.reservations.filter(r => r.id !== id))}
                    onScanStart={(id) => { setScanningReservationId(id); actions.setCurrentView('scanner'); }}
                    onStartNavigation={(sid) => {
                         const s = MOCK_STATIONS.find(st => st.id === sid);
                         if(s) { actions.setSelectedStation(s); actions.setMapCenter([s.lat, s.lng]); actions.setMapZoom(16); actions.handleStartNavigation(); }
                    }}
                    onNavigate={actions.setCurrentView}
                    language={state.language}
                />
            </div>
        )}

        {/* HUD Elements */}
        {state.isNavigating && (
            <NavigationActiveOverlay 
                routeInfo={state.navigationInfo}
                onStop={() => { actions.setIsNavigating(false); actions.setNavigationPath(null); actions.setIsFollowingUser(false); }}
                onScan={() => { actions.setIsNavigating(false); actions.setCurrentView('scanner'); }}
                language={state.language}
            />
        )}

        {/* Status Banners */}
        {state.activeSession && state.currentView !== 'charging' && (
            <div className="absolute top-24 left-0 right-0 z-[60] px-4 pointer-events-none">
                <div className="pointer-events-auto"><ActiveSessionBanner session={state.activeSession} onOpen={() => actions.setCurrentView('charging')} language={state.language} /></div>
            </div>
        )}

        {!state.activeSession && state.activeReservation && !state.isNavigating && state.currentView === 'map' && (
            <div className="absolute top-24 left-0 right-0 z-[60] px-4 pointer-events-none">
                <div className="pointer-events-auto"><ActiveReservationBanner reservation={state.activeReservation} onOpen={() => actions.setCurrentView('reservations')} language={state.language} /></div>
            </div>
        )}

        {state.currentView === 'scanner' && (
            <QRCodeScanner 
                onClose={() => actions.setCurrentView('map')}
                onScanSuccess={handleScanSuccess}
                targetStationName={scanningReservationId ? state.reservations.find(r => r.id === scanningReservationId)?.stationName : undefined}
                language={state.language}
            />
        )}

      </main>

      {!state.isNavigating && !isOnboardingFlow && (
          <Navigation currentView={state.currentView} onNavigate={(view) => {
              if (view === 'scanner' && state.activeReservation) setScanningReservationId(state.activeReservation.id);
              actions.setCurrentView(view);
              if(view === 'map') setShowList(false);
          }} language={state.language} />
      )}
    </div>
  );
};

export default App;