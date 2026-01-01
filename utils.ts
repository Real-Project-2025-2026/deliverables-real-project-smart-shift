import { Station } from './types';
import { MOCK_STATIONS } from './constants';

export interface SearchResult {
  type: 'station' | 'district' | 'street' | 'plz' | 'train_station';
  label: string;
  subLabel: string;
  lat: number;
  lng: number;
  data?: unknown; // Safer than any
  score?: number; // Lower is better (0 = exact match)
}

interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    address: {
        road?: string;
        suburb?: string;
        city_district?: string;
        city?: string;
        town?: string;
        postcode?: string;
        country?: string;
        [key: string]: string | undefined;
    };
    category?: string;
    addresstype?: string;
    name?: string;
}

// Simple Encryption/Decryption Helpers
export const simpleEncrypt = <T>(data: T): string => {
  try {
    const json = JSON.stringify(data);
    // Simple Base64 encoding with URI component handling for UTF-8 support
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (e) {
    console.error("Encryption failed", e);
    return "";
  }
};

export const simpleDecrypt = <T>(cipher: string): T | null => {
  try {
    const json = decodeURIComponent(atob(cipher).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json) as T;
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};

// Detailed Password Requirements
export const getPasswordRequirements = (password: string) => {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    numberOrSpecial: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

// Password Strength Analyzer (Legacy/Simple score)
export const checkPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (!password) return { score: 0, label: '', color: 'bg-gray-200' };

  const reqs = getPasswordRequirements(password);
  
  if (reqs.length) score += 1;
  if (reqs.upper) score += 1;
  if (reqs.lower) score += 1;
  if (reqs.numberOrSpecial) score += 1;

  switch (score) {
    case 0: return { score: 0, label: 'Sehr schwach', color: 'bg-gray-200' };
    case 1: return { score: 1, label: 'Schwach', color: 'bg-red-500' };
    case 2: return { score: 2, label: 'Mittel', color: 'bg-orange-500' };
    case 3: return { score: 3, label: 'Gut', color: 'bg-yellow-400' };
    case 4: return { score: 4, label: 'Sehr sicher', color: 'bg-green-500' };
    default: return { score: 0, label: '', color: 'bg-gray-200' };
  }
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Calculate distance between two points in km (Haversine formula)
export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

// Fetch Driving Route from OSRM (Open Source Routing Machine)
export const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    try {
        // OSRM expects "lng,lat"
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Route fetch failed');
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            
            // Swap coordinates from [lng, lat] (GeoJSON) to [lat, lng] (Leaflet)
            const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            
            return {
                path: coordinates,
                distance: (route.distance / 1000).toFixed(1), // km
                duration: Math.round(route.duration / 60) // minutes
            };
        }
        return null;
    } catch (error) {
        console.error("Routing Error:", error);
        return null;
    }
};

// Levenshtein Distance Algorithm for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

export const searchLocations = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // 1. Priority: Search local mocked Stations (Exact & Fuzzy)
  // We keep this local because these stations don't exist in the real world map data
  MOCK_STATIONS.forEach(s => {
    const nameDist = levenshteinDistance(lowerQuery, s.name.toLowerCase());
    const addressDist = levenshteinDistance(lowerQuery, s.address.toLowerCase());
    
    // Direct Match or very close match
    if (s.name.toLowerCase().includes(lowerQuery) || s.address.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'station', label: s.name, subLabel: s.address, lat: s.lat, lng: s.lng, data: s, score: 0 });
    } else if (nameDist <= 3 || addressDist <= 3) {
        results.push({ type: 'station', label: s.name, subLabel: 'Meinten Sie diese Station?', lat: s.lat, lng: s.lng, data: s, score: Math.min(nameDist, addressDist) });
    }
  });

  // 2. Real World Search: OpenStreetMap Nominatim API
  try {
      // Bounding box for Munich and surrounding area
      const munichViewbox = "11.36,48.25,11.79,48.06";
      
      const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${munichViewbox}&bounded=1&limit=5&addressdetails=1&accept-language=de`,
          {
             headers: {
                 'Accept': 'application/json'
             }
          }
      );
      
      if (response.ok) {
          const data: NominatimResult[] = await response.json();
          
          data.forEach((item) => {
              // Map OSM type to our types
              let type: 'street' | 'district' | 'plz' | 'train_station' = 'street';
              
              if (item.type === 'station' || item.category === 'railway') type = 'train_station';
              else if (item.addresstype === 'postcode') type = 'plz';
              else if (item.addresstype === 'suburb' || item.addresstype === 'city_district') type = 'district';
              
              // Simplify the label
              let subLabel = 'München';
              if (item.address) {
                  if (item.address.postcode) subLabel = `${item.address.postcode} ${item.address.city || item.address.town || 'München'}`;
                  else if (item.address.suburb) subLabel = item.address.suburb;
                  else if (item.address.city_district) subLabel = item.address.city_district;
              }

              results.push({
                  type: type,
                  label: item.name || item.address.road || item.display_name.split(',')[0],
                  subLabel: subLabel,
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon),
                  score: 1 // Slightly lower priority than direct station matches
              });
          });
      }
  } catch (error) {
      console.error("OSM Search failed", error);
  }

  // Sort: Exact station matches first, then based on score (API results have score 1)
  return results.sort((a, b) => (a.score || 0) - (b.score || 0));
};