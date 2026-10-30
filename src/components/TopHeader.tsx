import React from 'react';
import { UserProfile, UserLocation } from '../types/traffic';
import {
  Radio,
  User,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  Compass,
  Bell,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

interface TopHeaderProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  gpsPermissionStatus: 'granted' | 'denied' | 'prompt';
  onOpenPermissionModal: () => void;
  onOpenApkModal: () => void;
  userLocation: UserLocation;
  radiusKm: number;
  backgroundTracking: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onOpenLogin,
  gpsPermissionStatus,
  onOpenPermissionModal,
  onOpenApkModal,
  userLocation,
  radiusKm,
  backgroundTracking,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-3 flex flex-col gap-2">
      {/* Top Navbar Card */}
      <div className="w-full max-w-lg mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl p-2.5 px-3 flex items-center justify-between pointer-events-auto">
        {/* App Title and GPS Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-tight">
                TrafficFlow
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                GPS
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    gpsPermissionStatus === 'granted'
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                {gpsPermissionStatus === 'granted'
                  ? 'Live GPS Active'
                  : 'Location Default'}
              </span>
              <span>•</span>
              <span className="text-slate-300 font-mono font-medium">
                {radiusKm} km radius
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons: APK Install, Permission status & User Account */}
        <div className="flex items-center gap-1.5">
          {/* APK Install Button */}
          <button
            onClick={onOpenApkModal}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Download APK / Install Android App"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>APK</span>
          </button>

          {/* Permission Button */}
          {gpsPermissionStatus !== 'granted' && (
            <button
              onClick={onOpenPermissionModal}
              className="px-2 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 hover:bg-amber-500/30"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Allow GPS</span>
            </button>
          )}

          {/* User Profile / Gmail button */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-xs"
            title={currentUser ? currentUser.displayName : 'Sign In'}
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-6 h-6 rounded-lg object-cover"
              />
            ) : currentUser ? (
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-[11px] text-white">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="font-semibold text-slate-200 max-w-[80px] truncate">
              {currentUser ? currentUser.displayName.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>

      {/* Background GPS Notification (Mobile OS banner replica) */}
      {backgroundTracking && (
        <div className="w-full max-w-lg mx-auto bg-slate-900/95 border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-md pointer-events-auto flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">
              TrafficFlow background service active
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Scanning traffic flow</span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            {Math.round(userLocation.lat * 1000) / 1000}, {Math.round(userLocation.lng * 1000) / 1000}
          </span>
        </div>
      )}
    </div>
  );
};
