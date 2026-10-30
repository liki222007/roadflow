import React, { useState, useEffect } from 'react';
import { RouteOption, UserLocation } from '../types/traffic';
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  Gauge,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

interface NavigationHudProps {
  route: RouteOption;
  destinationName: string;
  userLocation: UserLocation;
  onExitNavigation: () => void;
}

export const NavigationHud: React.FC<NavigationHudProps> = ({
  route,
  destinationName,
  userLocation,
  onExitNavigation,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const step = route.steps[currentStepIndex] || route.steps[0];
  const speedKmh = Math.round((userLocation.speed || 0) * 3.6);
  const speedLimit = 60;

  // Speak instruction when step changes
  useEffect(() => {
    if (!soundEnabled || !step) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(step.instruction);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStepIndex, soundEnabled, step]);

  // Maneuver icon selector
  const renderManeuverIcon = (maneuver?: string) => {
    if (maneuver?.includes('right')) {
      return <ArrowUpRight className="w-8 h-8 text-white" strokeWidth={2.5} />;
    }
    if (maneuver?.includes('left')) {
      return <ArrowUpLeft className="w-8 h-8 text-white" strokeWidth={2.5} />;
    }
    if (maneuver?.includes('arrival')) {
      return <CheckCircle2 className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />;
    }
    return <ArrowUp className="w-8 h-8 text-white" strokeWidth={2.5} />;
  };

  const handleNextStep = () => {
    if (currentStepIndex < route.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onExitNavigation();
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 pointer-events-none z-40 flex flex-col justify-between p-3.5 pt-12 pb-5">
      {/* TOP TURN-BY-TURN GUIDANCE BANNER */}
      <div className="w-full max-w-lg mx-auto bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 shrink-0">
            {renderManeuverIcon(step.maneuver)}
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {step.distance} • Next Maneuver
            </div>
            <div className="text-base sm:text-lg font-bold leading-tight mt-0.5">
              {step.instruction}
            </div>
            {step.roadName && (
              <div className="text-xs text-slate-400 mt-1">
                Onto: <span className="text-slate-200">{step.roadName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Advance / Mute controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title={soundEnabled ? 'Mute Voice' : 'Unmute Voice'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={handleNextStep}
            className="p-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            title="Advance Maneuver"
          >
            Next
          </button>
        </div>
      </div>

      {/* BOTTOM SPEEDOMETER & TRIP STATS */}
      <div className="w-full max-w-lg mx-auto bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl pointer-events-auto flex items-center justify-between text-white">
        {/* Speedometer */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700">
            <span className="text-xl font-black text-white leading-none">
              {speedKmh}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">
              km/h
            </span>
          </div>

          {/* Speed Limit Sign */}
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full border-4 border-rose-500 bg-white text-slate-900 font-black text-xs">
            {speedLimit}
          </div>
        </div>

        {/* ETA & Distance */}
        <div className="text-center">
          <div className="text-2xl font-black text-emerald-400 leading-none">
            {route.durationInTrafficMinutes}{' '}
            <span className="text-xs font-normal text-slate-300">min</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {route.distanceKm} km • {destinationName}
          </div>
        </div>

        {/* End Navigation Button */}
        <button
          onClick={onExitNavigation}
          className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600 hover:text-white transition-all active:scale-95 flex items-center justify-center"
          title="Exit Navigation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
