import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { UserLocation, TrafficIncident, RouteOption } from '../types/traffic';
import {
  AlertTriangle,
  Flame,
  HardHat,
  ShieldAlert,
  Car,
  Ban,
  Navigation,
  Compass,
  Layers,
  LocateFixed,
  Eye,
  EyeOff,
  Flag,
} from 'lucide-react';

interface TrafficMapProps {
  apiKey: string;
  userLocation: UserLocation;
  radiusKm: number;
  congestionScore: number;
  incidents: TrafficIncident[];
  selectedIncident: TrafficIncident | null;
  onSelectIncident: (inc: TrafficIncident | null) => void;
  activeRoute: RouteOption | null;
  destinationLocation: { lat: number; lng: number; name: string } | null;
  onRecenter: () => void;
  followUser: boolean;
  onToggleFollow: () => void;
  showTrafficLayer: boolean;
  onToggleTrafficLayer: () => void;
}

// Subcomponent: Live Google Maps Traffic Layer
function TrafficLayerComponent({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map || typeof window.google === 'undefined' || !window.google.maps) return;

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }

    if (enabled) {
      trafficLayerRef.current.setMap(map);
    } else {
      trafficLayerRef.current.setMap(null);
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, enabled]);

  return null;
}

// Subcomponent: Visual Radius Ring around user location
function RadiusCircleComponent({
  center,
  radiusKm,
  congestionScore,
}: {
  center: { lat: number; lng: number };
  radiusKm: number;
  congestionScore: number;
}) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || typeof window.google === 'undefined' || !window.google.maps) return;

    const strokeColor =
      congestionScore > 65 ? '#ef4444' : congestionScore > 35 ? '#f59e0b' : '#3b82f6';

    if (!circleRef.current) {
      circleRef.current = new window.google.maps.Circle({
        strokeColor,
        strokeOpacity: 0.65,
        strokeWeight: 2,
        fillColor: strokeColor,
        fillOpacity: 0.08,
        map,
        center,
        radius: radiusKm * 1000,
        clickable: false,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusKm * 1000);
      circleRef.current.setOptions({
        strokeColor,
        fillColor: strokeColor,
      });
      circleRef.current.setMap(map);
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center, radiusKm, congestionScore]);

  return null;
}

// Subcomponent: Navigation Polyline with exact road tracing & bounds framing
function RoutePolylineComponent({
  route,
}: {
  route: RouteOption | null;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const borderPolylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || typeof window.google === 'undefined' || !window.google.maps) return;

    if (!route || !route.points || route.points.length === 0) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (borderPolylineRef.current) {
        borderPolylineRef.current.setMap(null);
        borderPolylineRef.current = null;
      }
      return;
    }

    const strokeColor =
      route.trafficCondition === 'heavy'
        ? '#ef4444'
        : route.trafficCondition === 'moderate'
        ? '#f59e0b'
        : '#3b82f6';

    const borderColor =
      route.trafficCondition === 'heavy'
        ? '#991b1b'
        : route.trafficCondition === 'moderate'
        ? '#b45309'
        : '#1d4ed8';

    // Outer border casing for crisp road visibility
    if (!borderPolylineRef.current) {
      borderPolylineRef.current = new window.google.maps.Polyline({
        path: route.points,
        geodesic: true,
        strokeColor: borderColor,
        strokeOpacity: 0.95,
        strokeWeight: 8,
        map,
        zIndex: 49,
      });
    } else {
      borderPolylineRef.current.setPath(route.points);
      borderPolylineRef.current.setOptions({ strokeColor: borderColor });
      borderPolylineRef.current.setMap(map);
    }

    // Inner vibrant route line
    if (!polylineRef.current) {
      polylineRef.current = new window.google.maps.Polyline({
        path: route.points,
        geodesic: true,
        strokeColor,
        strokeOpacity: 1,
        strokeWeight: 5,
        map,
        zIndex: 50,
      });
    } else {
      polylineRef.current.setPath(route.points);
      polylineRef.current.setOptions({ strokeColor });
      polylineRef.current.setMap(map);
    }

    // Frame the complete road path on viewport
    if (route.points.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      route.points.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 120, right: 50, bottom: 220, left: 50 });
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (borderPolylineRef.current) {
        borderPolylineRef.current.setMap(null);
        borderPolylineRef.current = null;
      }
    };
  }, [map, route]);

  return null;
}

// Subcomponent: Pan map when user moves or recenters
function CameraSynchronizer({
  center,
  follow,
}: {
  center: { lat: number; lng: number };
  follow: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !follow) return;
    map.panTo(center);
  }, [map, center.lat, center.lng, follow]);

  return null;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({
  apiKey,
  userLocation,
  radiusKm,
  congestionScore,
  incidents,
  selectedIncident,
  onSelectIncident,
  activeRoute,
  destinationLocation,
  onRecenter,
  followUser,
  onToggleFollow,
  showTrafficLayer,
  onToggleTrafficLayer,
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  const getIncidentIcon = (type: TrafficIncident['type']) => {
    switch (type) {
      case 'accident':
        return <Flame className="w-4 h-4 text-white" />;
      case 'construction':
        return <HardHat className="w-4 h-4 text-white" />;
      case 'police':
        return <ShieldAlert className="w-4 h-4 text-white" />;
      case 'closure':
        return <Ban className="w-4 h-4 text-white" />;
      case 'hazard':
        return <AlertTriangle className="w-4 h-4 text-white" />;
      case 'jam':
      default:
        return <Car className="w-4 h-4 text-white" />;
    }
  };

  const getIncidentBg = (type: TrafficIncident['type']) => {
    switch (type) {
      case 'accident':
      case 'closure':
        return 'bg-rose-600 border-rose-400';
      case 'construction':
      case 'hazard':
        return 'bg-amber-500 border-amber-300';
      case 'police':
        return 'bg-blue-600 border-blue-400';
      case 'jam':
      default:
        return 'bg-orange-600 border-orange-400';
    }
  };

  const speedKmh = Math.round((userLocation.speed || 0) * 3.6);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <APIProvider apiKey={apiKey} solutionChannel="GMP_visgl_reactgooglemaps_v1.0.0">
        <Map
          defaultCenter={{ lat: userLocation.lat, lng: userLocation.lng }}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          mapTypeId={mapType}
          disableDefaultUI={true}
          gestureHandling="greedy"
          className="w-full h-full"
        >
          {/* Synchronize camera follow */}
          <CameraSynchronizer
            center={{ lat: userLocation.lat, lng: userLocation.lng }}
            follow={followUser}
          />

          {/* Traffic flow layer */}
          <TrafficLayerComponent enabled={showTrafficLayer} />

          {/* Radius scanning perimeter */}
          <RadiusCircleComponent
            center={{ lat: userLocation.lat, lng: userLocation.lng }}
            radiusKm={radiusKm}
            congestionScore={congestionScore}
          />

          {/* Route path polyline */}
          <RoutePolylineComponent route={activeRoute} />

          {/* User Live Location Marker (GPS Puck with Heading Arrow & Radar Aura) */}
          <AdvancedMarker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            zIndex={100}
            title="Your Live Location"
          >
            <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              {/* Radar pulse ripples */}
              <div className="absolute w-14 h-14 rounded-full bg-blue-500/25 animate-ping" />
              <div className="absolute w-20 h-20 rounded-full border border-blue-400/40 animate-pulse pointer-events-none" />

              {/* Puck core */}
              <div
                className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 p-1 shadow-xl shadow-blue-500/50 flex items-center justify-center transition-transform duration-300"
                style={{
                  transform: userLocation.heading ? `rotate(${userLocation.heading}deg)` : 'none',
                }}
              >
                <div className="w-full h-full rounded-full bg-slate-950/20 backdrop-blur-sm flex items-center justify-center">
                  <Navigation
                    className="w-5 h-5 text-white drop-shadow-md"
                    fill="currentColor"
                  />
                </div>
              </div>

              {/* Speed Tag Badge */}
              {speedKmh > 0 && (
                <div className="absolute -top-7 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                  {speedKmh} km/h
                </div>
              )}
            </div>
          </AdvancedMarker>

          {/* Destination Marker if active */}
          {destinationLocation && (
            <AdvancedMarker
              position={{ lat: destinationLocation.lat, lng: destinationLocation.lng }}
              zIndex={90}
            >
              <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer">
                <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/40 border-2 border-white">
                  <Flag className="w-5 h-5" fill="currentColor" />
                </div>
                <div className="w-2 h-2 rotate-45 bg-emerald-600 -mt-1" />
                <div className="bg-slate-900/90 text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg border border-slate-700 shadow mt-1 whitespace-nowrap">
                  {destinationLocation.name}
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Surrounding Incident Markers */}
          {incidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            return (
              <AdvancedMarker
                key={incident.id}
                position={{ lat: incident.lat, lng: incident.lng }}
                zIndex={isSelected ? 85 : 70}
                onClick={() => onSelectIncident(isSelected ? null : incident)}
              >
                <div className="relative flex flex-col items-center cursor-pointer group">
                  <div
                    className={`p-2 rounded-xl text-white shadow-lg border-2 transition-transform duration-200 ${getIncidentBg(
                      incident.type
                    )} ${isSelected ? 'scale-125 ring-4 ring-white/50' : 'group-hover:scale-110'}`}
                  >
                    {getIncidentIcon(incident.type)}
                  </div>
                  {/* Pin tail */}
                  <div className="w-1.5 h-1.5 rotate-45 bg-slate-800 -mt-1" />

                  {/* Delay pill */}
                  <div className="bg-slate-950/90 border border-slate-800 text-[9px] font-bold text-amber-400 px-1.5 py-0.5 rounded-md shadow mt-0.5 whitespace-nowrap">
                    +{incident.delayMinutes}m
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>

      {/* Floating GPS HUD Controls (Mobile-Friendly Right Bar) */}
      <div className="absolute right-3.5 top-20 z-20 flex flex-col gap-2.5">
        {/* Recenter & Lock to User Location */}
        <button
          onClick={() => {
            onRecenter();
            if (!followUser) onToggleFollow();
          }}
          className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all active:scale-95 border ${
            followUser
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-600/40 ring-2 ring-blue-400/50'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
          }`}
          title="Center on My Location"
          aria-label="Center on My Location"
        >
          <LocateFixed className="w-5 h-5" />
        </button>

        {/* Live Traffic Layer Toggle */}
        <button
          onClick={onToggleTrafficLayer}
          className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all active:scale-95 border ${
            showTrafficLayer
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/40'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Toggle Live Traffic Flow"
          aria-label="Toggle Live Traffic Flow"
        >
          {showTrafficLayer ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        {/* Map Type Switcher */}
        <button
          onClick={() => {
            setMapType((prev) => (prev === 'roadmap' ? 'hybrid' : 'roadmap'));
          }}
          className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl backdrop-blur-md transition-all active:scale-95"
          title="Switch Map Style (Street / Satellite)"
          aria-label="Switch Map Style"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
