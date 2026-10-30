import React from 'react';
import { Navigation, ShieldCheck, MapPin, Radio, BellRing, Smartphone } from 'lucide-react';

interface GpsPermissionModalProps {
  isOpen: boolean;
  onGrantPermission: (mode: 'precise' | 'background') => void;
  onDenyPermission: () => void;
}

export const GpsPermissionModal: React.FC<GpsPermissionModalProps> = ({
  isOpen,
  onGrantPermission,
  onDenyPermission,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow accent */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header icon with radar pulses */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Navigation className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Location &amp; Traffic Access
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            Allow "TrafficFlow" to access this device's location?
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            TrafficFlow requires precise GPS coordinates to map your live position, scan traffic congestion in your immediate radius, and deliver turn-by-turn routing alerts.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60 space-y-2.5 mb-5 text-xs">
          <div className="flex items-start gap-2.5 text-slate-300">
            <div className="p-1 rounded bg-blue-500/20 text-blue-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">Live GPS tracking</span>:
              Pinpoints exact road position and calculates vehicle speed &amp; heading.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">Surrounding Traffic Flow</span>:
              Monitors road congestion &amp; incidents in real-time within your radius.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">Background Safety Alerts</span>:
              Detects upcoming bottlenecks and offers proactive rerouting.
            </div>
          </div>
        </div>

        {/* Action buttons mimicking mobile system prompt */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onGrantPermission('background')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            While Using the App &amp; Background
          </button>

          <button
            onClick={() => onGrantPermission('precise')}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Only While Using the App
          </button>

          <button
            onClick={onDenyPermission}
            className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors text-center"
          >
            Don't Allow (Use Default Location)
          </button>
        </div>
      </div>
    </div>
  );
};
