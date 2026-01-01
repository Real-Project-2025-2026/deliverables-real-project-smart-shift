export interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  power: number; // in kW
  price: number; // Energy price in ct/kWh (fixed at 30ct in new model)
  parkingFee: number; // New: Parking fee in Euro/hour (1.65 or 2.24)
  locationType: 'outdoor' | 'garage'; // To distinguish pricing models
  status: 'available' | 'busy' | 'closed';
  rating: number;
  owner: string;
  availability: number[]; // 48 slots for 00:00-23:30 (0=closed, 1=busy, 2=free)
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  color: string;
  batterySize: number;
  country: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // stored for demo purposes only
  avatar: string; // Emoji character acting as avatar
  birthDate?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChargingSession {
  id: string;
  stationName: string;
  address: string;
  date: string; // ISO String
  durationMinutes: number;
  kwh: number;
  totalPrice: number; // in Euro
  rating?: number; // 1-5 stars, optional
  feedback?: string; // Optional text feedback
}

export interface Reservation {
  id: string;
  stationId: string;
  stationName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  estimatedPrice: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ActiveSession {
  id: string;
  stationId: string;
  stationName: string;
  address: string;
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  durationMinutes: number;
  power: number; // kW used for simulation
  pricePerKwh: number;
}

export interface SearchResult {
  type: 'station' | 'district' | 'street' | 'plz' | 'train_station';
  label: string;
  subLabel: string;
  lat: number;
  lng: number;
  data?: any;
  score?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'paypal' | 'credit_card';
  label: string; // "user@paypal.com" or "**** 1234"
  expiry?: string; // MM/YY for cards
  isDefault: boolean;
}

export type Language = 'de' | 'en';

export type ViewState = 'map' | 'history' | 'settings' | 'scanner' | 'vehicle_edit' | 'profile_edit' | 'payment' | 'language_select' | 'faq' | 'terms' | 'privacy' | 'host_apply' | 'charging' | 'onboarding' | 'vehicle_edit_onboarding' | 'reservations';
