import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ViewState, Station, UserProfile, Vehicle, ChargingSession, Reservation, ActiveSession, PaymentMethod, Language } from '../types';
import { storageService } from '../services/StorageService.ts';
import { stationService } from '../services/StationService.ts';
import { INITIAL_USER_PROFILE, INITIAL_VEHICLES, INITIAL_PAYMENT_METHODS } from '../constants';
import { simpleEncrypt, simpleDecrypt } from '../utils';

// GPS Configuration for maximum stability
const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: true, // Forces GPS over WiFi/Cell (prevents jumping)
    timeout: 20000,           // Allow more time for a satellite fix
    maximumAge: 0             // Never accept cached/old positions
};

export const useAppEngine = () => {
  // --- Persistent State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storageService.getItem('smartshift_theme', 'light'));
  const [language, setLanguage] = useState<Language>(() => storageService.getItem('smartshift_language', 'de'));
  
  // Registered Users (Encrypted List)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const encrypted = storageService.getItem('smartshift_users_db', '');
    if (!encrypted) return [INITIAL_USER_PROFILE];
    return simpleDecrypt<UserProfile[]>(encrypted) || [INITIAL_USER_PROFILE];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getItem('smartshift_profile', INITIAL_USER_PROFILE));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => storageService.getItem('smartshift_vehicles', INITIAL_VEHICLES));
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => storageService.getItem('smartshift_payment_methods', INITIAL_PAYMENT_METHODS));
  const [favorites, setFavorites] = useState<string[]>(() => storageService.getItem('smartshift_favorites', []));
  const [reservations, setReservations] = useState<Reservation[]>(() => storageService.getItem('smartshift_reservations', []));
  const [chargingHistory, setChargingHistory] = useState<ChargingSession[]>(() => storageService.getItem('smartshift_charging_history', []));
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => storageService.getItem('smartshift_active_session', null));

  // --- UI State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('map');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.137154, 11.576124]);
  const [mapZoom, setMapZoom] = useState(13);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationPath, setNavigationPath] = useState<[number, number][] | null>(null);
  const [navigationInfo, setNavigationInfo] = useState<{distance: string, duration: number} | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // New state to control if map follows the user
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  
  // Ref for watchId to clean up GPS listener
  const watchIdRef = useRef<number | null>(null);

  // --- Effects for Persistence ---
  useEffect(() => storageService.setItem('smartshift_theme', theme), [theme]);
  useEffect(() => storageService.setItem('smartshift_language', language), [language]);
  useEffect(() => storageService.setItem('smartshift_profile', userProfile), [userProfile]);
  useEffect(() => storageService.setItem('smartshift_vehicles', vehicles), [vehicles]);
  useEffect(() => storageService.setItem('smartshift_reservations', reservations), [reservations]);
  useEffect(() => storageService.setItem('smartshift_charging_history', chargingHistory), [chargingHistory]);
  useEffect(() => {
    if (activeSession) storageService.setItem('smartshift_active_session', activeSession);
    else storageService.removeItem('smartshift_active_session');
  }, [activeSession]);

  // Persist Registered Users (Encrypted)
  useEffect(() => {
      const encrypted = simpleEncrypt(registeredUsers);
      storageService.setItem('smartshift_users_db', encrypted);
  }, [registeredUsers]);

  // --- GPS Tracking Effect ---
  useEffect(() => {
    // We start the watcher if the user wants to be located OR is navigating
    const shouldTrack = isFollowingUser || isNavigating;

    if (shouldTrack && 'geolocation' in navigator) {
        // cleanup old watcher first
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                
                // Update User Marker Position
                setUserPosition({ lat: latitude, lng: longitude, accuracy });
                
                // Move Map ONLY if we are in "Following Mode"
                if (isFollowingUser) {
                    setMapCenter([latitude, longitude]);
                    // Only zoom in if we are zoomed out too far, otherwise respect user zoom
                    setMapZoom(prev => prev < 15 ? 16 : prev);
                }
                
                // Loading finished
                setIsLocating(false);
            },
            (err) => {
                console.warn("GPS Tracking Error:", err.message);
                // On critical errors (permission denied), stop following
                if (err.code === 1) { 
                    setIsFollowingUser(false);
                    setIsLocating(false);
                }
                // On timeout/unavailable, we keep trying (watchPosition retries automatically)
            },
            GEOLOCATION_OPTIONS
        );
    } else if (!shouldTrack) {
        // Stop tracking if logic dictates (e.g. user panned away)
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }

    // Cleanup on unmount
    return () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isFollowingUser, isNavigating]);

  // --- Helper Logic (Memoized Actions) ---
  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), []);
  
  // SIMPLIFIED LOCATE USER: Just turn on the flag, let the Effect handle the API call.
  // This prevents race conditions between getCurrentPosition and watchPosition.
  const locateUser = useCallback(() => {
    if ('geolocation' in navigator) {
        setIsLocating(true);
        setIsFollowingUser(true); // This triggers the useEffect above
    } else {
        alert("Geolokalisation wird von diesem Browser nicht unterstützt.");
    }
  }, []);

  const handleStartNavigation = useCallback(async () => {
    if (selectedStation && userPosition) {
        setIsNavigating(true);
        setIsFollowingUser(true); // Enable follow mode
        
        const route = await stationService.calculateRoute(userPosition.lat, userPosition.lng, selectedStation.lat, selectedStation.lng);
        if (route) {
            setNavigationPath(route.path);
            setNavigationInfo({ distance: route.distance, duration: route.duration });
        }
        setCurrentView('map');
        
        // Center map on user immediately
        setMapCenter([userPosition.lat, userPosition.lng]);
        setMapZoom(18); // Zoom in for navigation
    }
  }, [selectedStation, userPosition]);

  const registerUser = useCallback((newProfile: UserProfile) => {
      setRegisteredUsers(prevUsers => {
          const exists = prevUsers.some(u => u.email.toLowerCase() === newProfile.email.toLowerCase());
          if (exists) {
              return prevUsers.map(u => u.email.toLowerCase() === newProfile.email.toLowerCase() ? newProfile : u);
          } else {
              return [...prevUsers, newProfile];
          }
      });
      setUserProfile(newProfile);
  }, []);

  const validateCredentials = useCallback((email: string, password: string): boolean => {
      // 1. Check current active profile (legacy/fast check)
      if (userProfile.email.toLowerCase() === email.toLowerCase() && userProfile.password === password) return true;
      
      // 2. Check registered DB
      const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
          setUserProfile(user); // Switch active profile
          return true;
      }
      return false;
  }, [userProfile, registeredUsers]);

  const activeReservation = useMemo(() => {
    if (reservations.length === 0) return null;
    return [...reservations].sort((a, b) => {
        return new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime();
    })[0];
  }, [reservations]);

  const state = useMemo(() => ({
      theme, language, userProfile, vehicles, paymentMethods, favorites,
      reservations, chargingHistory, activeSession, isAuthenticated,
      currentView, selectedStation, mapCenter, mapZoom, isNavigating,
      navigationPath, navigationInfo, userPosition, isLocating, activeReservation,
      isFollowingUser
  }), [
      theme, language, userProfile, vehicles, paymentMethods, favorites,
      reservations, chargingHistory, activeSession, isAuthenticated,
      currentView, selectedStation, mapCenter, mapZoom, isNavigating,
      navigationPath, navigationInfo, userPosition, isLocating, activeReservation,
      isFollowingUser
  ]);

  const actions = useMemo(() => ({
      setTheme, setLanguage, setUserProfile, setVehicles, setPaymentMethods,
      setFavorites, setReservations, setChargingHistory, setActiveSession,
      setIsAuthenticated, setCurrentView, setSelectedStation, setMapCenter,
      setMapZoom, setIsNavigating, setNavigationPath, setNavigationInfo,
      toggleTheme, locateUser, handleStartNavigation,
      registerUser, validateCredentials, setIsFollowingUser
  }), [
      toggleTheme, locateUser, handleStartNavigation, registerUser, validateCredentials
  ]);

  return useMemo(() => ({ state, actions }), [state, actions]);
};