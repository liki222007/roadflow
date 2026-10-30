/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserLocation, TrafficIncident, TrafficRadiusData, RouteOption, UserProfile } from './types/traffic';
import { generateSurroundingTraffic, calculateHeading, calculateDistanceKm } from './utils/geo';
import { TrafficMap } from './components/TrafficMap';
import { TrafficControlPanel } from './components/TrafficControlPanel';
import { GpsPermissionModal } from './components/GpsPermissionModal';
import { LoginModal } from './components/LoginModal';
import { DirectionsModal } from './components/DirectionsModal';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { NavigationHud } from './components/NavigationHud';
import { TopHeader } from './components/TopHeader';
import { QuotaBanner } from './components/QuotaBanner';
import { ApkExportModal } from './components/ApkExportModal';

const MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyCsbv78PewxE1TGM3MJmMb4G4dOGVy2D48';

// Default initial location: San Francisco city center coordinates
const DEFAULT_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

export default function App() {
  // Current Live Location
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    heading: 45,
    speed: 0,
    accuracy: 10,
    timestamp: Date.now(),
    address: 'Determining live address...',
  });

  // Settings & Navigation States
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [followUser, setFollowUser] = useState<boolean>(true);
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [backgroundTracking, setBackgroundTracking] = useState<boolean>(true);

  // Permission & Modals
  const [gpsPermissionStatus, setGpsPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  // Traffic & Incidents
  const [trafficData, setTrafficData] = useState<TrafficRadiusData>(() =>
    generateSurroundingTraffic(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, 5)
  );
  const [selectedIncident, setSelectedIncident] = useState<TrafficIncident | null>(null);

  // Active Route & Turn-by-Turn
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Authenticated User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('trafficflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default logged-in profile matching user's email
    return {
      id: 'usr-default',
      email: 'deereshsrujan@gmail.com',
      displayName: 'Srujan Deeresh',
      provider: 'google',
      savedPlaces: [
        {
          id: 'p1',
          name: 'Home',
          category: 'home',
          address: 'Residence Highway Link',
          lat: DEFAULT_CENTER.lat - 0.015,
          lng: DEFAULT_CENTER.lng - 0.012,
        },
        {
          id: 'p2',
          name: 'Tech Office',
          category: 'work',
          address: 'Financial District, Pier 1',
          lat: DEFAULT_CENTER.lat + 0.02,
          lng: DEFAULT_CENTER.lng + 0.025,
        },
      ],
      alertRadiusKm: 5,
      soundAlerts: true,
      backgroundTracking: true,
    };
  });

  const watchIdRef = useRef<number | null>(null);
  const prevPosRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  // Check stored permission preference
  useEffect(() => {
    const storedPerm = localStorage.getItem('trafficflow_gps_permission');
    if (storedPerm === 'granted') {
      setGpsPermissionStatus('granted');
      startLiveGpsTracking();
    } else if (storedPerm === 'denied') {
      setGpsPermissionStatus('denied');
    } else {
      setShowPermissionModal(true);
    }
  }, []);

  // Update surrounding traffic data whenever location or radius changes
  useEffect(() => {
    const updated = generateSurroundingTraffic(userLocation.lat, userLocation.lng, radiusKm);
    setTrafficData(updated);
  }, [userLocation.lat, userLocation.lng, radiusKm]);

  // Save current user to localStorage
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('trafficflow_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trafficflow_user');
  };

  // Start real device GPS tracking
  const startLiveGpsTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsPermissionStatus('denied');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed, accuracy, altitude } = pos.coords;
        let calculatedHeading = heading;
        let calculatedSpeed = speed;

        if (prevPosRef.current) {
          const dt = (Date.now() - prevPosRef.current.time) / 1000;
          if (dt > 0.5) {
            const dist = calculateDistanceKm(
              prevPosRef.current.lat,
              prevPosRef.current.lng,
              latitude,
              longitude
            );
            if (dist > 0.002) {
              calculatedHeading = calculateHeading(
                prevPosRef.current.lat,
                prevPosRef.current.lng,
                latitude,
                longitude
              );
              calculatedSpeed = (dist * 1000) / dt; // m/s
            }
          }
        }

        prevPosRef.current = { lat: latitude, lng: longitude, time: Date.now() };

        setUserLocation({
          lat: latitude,
          lng: longitude,
          heading: calculatedHeading ?? 0,
          speed: calculatedSpeed ?? 0,
          accuracy: accuracy || 8,
          altitude,
          timestamp: Date.now(),
          address: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });

        setGpsPermissionStatus('granted');
        localStorage.setItem('trafficflow_gps_permission', 'granted');
      },
      (err) => {
        console.warn('Geolocation access fallback or error:', err.message);
        if (gpsPermissionStatus === 'prompt') {
          setGpsPermissionStatus('denied');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );
  }, [gpsPermissionStatus]);

  // Handle Permission Granted / Denied from Modal
  const handleGrantPermission = (mode: 'precise' | 'background') => {
    setShowPermissionModal(false);
    setGpsPermissionStatus('granted');
    setBackgroundTracking(mode === 'background');
    localStorage.setItem('trafficflow_gps_permission', 'granted');
    startLiveGpsTracking();
  };

  const handleDenyPermission = () => {
    setShowPermissionModal(false);
    setGpsPermissionStatus('denied');
    localStorage.setItem('trafficflow_gps_permission', 'denied');
  };

  // Recenter Map on user location
  const handleRecenter = () => {
    setUserLocation((prev) => ({ ...prev }));
    setFollowUser(true);
  };

  // Start Navigation
  const handleStartNavigation = (
    route: RouteOption,
    dest: { lat: number; lng: number; name: string }
  ) => {
    setActiveRoute(route);
    setDestination(dest);
    setIsNavigating(true);
    setFollowUser(true);
  };

  const handleExitNavigation = () => {
    setIsNavigating(false);
    setActiveRoute(null);
    setDestination(null);
  };

  // Handle reporting incident
  const handleReportIncident = (newInc: TrafficIncident) => {
    setTrafficData((prev) => ({
      ...prev,
      incidents: [newInc, ...prev.incidents],
      incidentsCount: prev.incidentsCount + 1,
      totalDelayMinutes: prev.totalDelayMinutes + newInc.delayMinutes,
    }));
    setSelectedIncident(newInc);
  };

  // Upvote an existing incident
  const handleVoteIncident = (id: string) => {
    setTrafficData((prev) => ({
      ...prev,
      incidents: prev.incidents.map((i) =>
        i.id === id ? { ...i, votes: i.votes + 1, verified: true } : i
      ),
    }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Google Maps Quota Defense Banner (Tier 2 in-app sticky warning) */}
      <QuotaBanner />

      {/* Top Mobile Header & Background Tracking Widget */}
      {!isNavigating && (
        <TopHeader
          currentUser={currentUser}
          onOpenLogin={() => setShowLoginModal(true)}
          gpsPermissionStatus={gpsPermissionStatus}
          onOpenPermissionModal={() => setShowPermissionModal(true)}
          onOpenApkModal={() => setShowApkModal(true)}
          userLocation={userLocation}
          radiusKm={radiusKm}
          backgroundTracking={backgroundTracking}
        />
      )}

      {/* Main Fullscreen Google Map with Live Traffic Flow Layer */}
      <TrafficMap
        apiKey={MAPS_API_KEY}
        userLocation={userLocation}
        radiusKm={radiusKm}
        congestionScore={trafficData.congestionScore}
        incidents={trafficData.incidents}
        selectedIncident={selectedIncident}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        activeRoute={activeRoute}
        destinationLocation={destination}
        onRecenter={handleRecenter}
        followUser={followUser}
        onToggleFollow={() => setFollowUser(!followUser)}
        showTrafficLayer={showTrafficLayer}
        onToggleTrafficLayer={() => setShowTrafficLayer(!showTrafficLayer)}
      />

      {/* Selected Incident Pop-up Detail Card */}
      {selectedIncident && !isNavigating && (
        <div className="fixed top-24 left-4 right-4 max-w-sm mx-auto z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {selectedIncident.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                  +{selectedIncident.delayMinutes}m delay
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-1">
                {selectedIncident.roadName}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {selectedIncident.description}
              </div>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">
              Reported {selectedIncident.reportedAgo} • {selectedIncident.votes} confirmations
            </span>
            <button
              onClick={() => handleVoteIncident(selectedIncident.id)}
              className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-semibold"
            >
              Confirm Still There (+1)
            </button>
          </div>
        </div>
      )}

      {/* Bottom Traffic Control Drawer */}
      <TrafficControlPanel
        radiusData={trafficData}
        selectedRadius={radiusKm}
        onChangeRadius={(r) => setRadiusKm(r)}
        onOpenDirections={() => setShowDirectionsModal(true)}
        onOpenReportIncident={() => setShowReportModal(true)}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        userAddress={userLocation.address}
        isNavigationActive={isNavigating}
      />

      {/* Turn-by-Turn Navigation HUD (Active when route navigation started) */}
      {isNavigating && activeRoute && destination && (
        <NavigationHud
          route={activeRoute}
          destinationName={destination.name}
          userLocation={userLocation}
          onExitNavigation={handleExitNavigation}
        />
      )}

      {/* Native GPS Permission Modal */}
      <GpsPermissionModal
        isOpen={showPermissionModal}
        onGrantPermission={handleGrantPermission}
        onDenyPermission={handleDenyPermission}
      />

      {/* Gmail / Google Login & User Account Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        defaultEmail="deereshsrujan@gmail.com"
      />

      {/* Route Directions & Alternatives Modal */}
      <DirectionsModal
        isOpen={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
        userLocation={userLocation}
        onStartNavigation={handleStartNavigation}
      />

      {/* Crowdsourced Hazard / Incident Report Modal */}
      <ReportIncidentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userLocation={userLocation}
        onReport={handleReportIncident}
      />

      {/* Android APK & Mobile Installation Modal */}
      <ApkExportModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        appUrl={typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-zyvez3j2hz7bbolddcmy4g-45043452819.asia-east1.run.app'}
      />
    </div>
  );
}
