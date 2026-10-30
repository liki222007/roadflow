export interface UserLocation {
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null; // in m/s
  accuracy?: number;
  altitude?: number | null;
  timestamp: number;
  address?: string;
}

export type IncidentType = 'jam' | 'accident' | 'construction' | 'police' | 'hazard' | 'closure';

export interface TrafficIncident {
  id: string;
  type: IncidentType;
  title: string;
  roadName: string;
  description: string;
  lat: number;
  lng: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  delayMinutes: number;
  distanceKm: number;
  reportedAgo: string;
  votes: number;
  verified: boolean;
}

export interface RoadTrafficSegment {
  id: string;
  name: string;
  status: 'smooth' | 'slow' | 'heavy' | 'standstill';
  currentSpeedKmh: number;
  freeFlowSpeedKmh: number;
  distanceKm: number;
  delayMinutes: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface TrafficRadiusData {
  radiusKm: number;
  congestionScore: number; // 0 - 100 (0 = clear, 100 = gridlock)
  avgSpeedKmh: number;
  freeFlowAvgKmh: number;
  flowLevel: 'Fluid' | 'Moderate' | 'Heavy' | 'Gridlock';
  incidentsCount: number;
  totalDelayMinutes: number;
  roadSegments: RoadTrafficSegment[];
  incidents: TrafficIncident[];
}

export interface SavedPlace {
  id: string;
  name: string;
  category: 'home' | 'work' | 'favorite' | 'recent';
  address: string;
  lat: number;
  lng: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'email' | 'guest';
  savedPlaces: SavedPlace[];
  alertRadiusKm: number;
  soundAlerts: boolean;
  backgroundTracking: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  summary: string;
  distanceKm: number;
  durationMinutes: number;
  durationInTrafficMinutes: number;
  trafficCondition: 'clear' | 'moderate' | 'heavy';
  tolls: boolean;
  highways: boolean;
  points: { lat: number; lng: number }[];
  steps: {
    instruction: string;
    distance: string;
    duration: string;
    maneuver?: string;
    roadName?: string;
  }[];
}
