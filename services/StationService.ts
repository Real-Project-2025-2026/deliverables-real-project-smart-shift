
import { Station } from '../types';
import { MOCK_STATIONS } from '../constants';
import { getDistanceFromLatLonInKm, fetchRoute } from '../utils';

export class StationService {
  private static instance: StationService;

  private constructor() {}

  public static getInstance(): StationService {
    if (!StationService.instance) {
      StationService.instance = new StationService();
    }
    return StationService.instance;
  }

  public filterStations(
    stations: Station[], 
    filters: { onlyAvailable: boolean; minPower: number; type: 'all' | 'Typ 2' | 'CCS' }
  ): Station[] {
    return stations.filter(s => {
      if (filters.onlyAvailable && s.status !== 'available') return false;
      if (s.power < filters.minPower) return false;
      if (filters.type !== 'all' && s.type !== filters.type) return false;
      return true;
    });
  }

  public findNearestAvailable(
    originLat: number, 
    originLng: number
  ): Station | null {
    const available = MOCK_STATIONS.filter(s => s.status === 'available');
    if (available.length === 0) return null;

    return available.reduce((prev, curr) => {
      const prevDist = getDistanceFromLatLonInKm(originLat, originLng, prev.lat, prev.lng);
      const currDist = getDistanceFromLatLonInKm(originLat, originLng, curr.lat, curr.lng);
      return (currDist < prevDist) ? curr : prev;
    });
  }

  public async calculateRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
    return await fetchRoute(startLat, startLng, endLat, endLng);
  }

  public getNearestStations(centerLat: number, centerLng: number, limit: number = 5): Station[] {
    return [...MOCK_STATIONS]
      .sort((a, b) => {
        const distA = getDistanceFromLatLonInKm(centerLat, centerLng, a.lat, a.lng);
        const distB = getDistanceFromLatLonInKm(centerLat, centerLng, b.lat, b.lng);
        return distA - distB;
      })
      .slice(0, limit);
  }
}

export const stationService = StationService.getInstance();
