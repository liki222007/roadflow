import React, { useState } from 'react';
import { TrafficRadiusData, TrafficIncident } from '../types/traffic';
import {
  Activity,
  Gauge,
  AlertTriangle,
  Clock,
  Car,
  ChevronUp,
  ChevronDown,
  Navigation2,
  PlusCircle,
  Flame,
  HardHat,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Radio,
} from 'lucide-react';

interface TrafficControlPanelProps {
  radiusData: TrafficRadiusData;
  selectedRadius: number;
  onChangeRadius: (radius: number) => void;
  onOpenDirections: () => void;
  onOpenReportIncident: () => void;
  onSelectIncident: (inc: TrafficIncident) => void;
  userAddress?: string;
  isNavigationActive: boolean;
}

export const TrafficControlPanel: React.FC<TrafficControlPanelProps> = ({
  radiusData,
  selectedRadius,
  onChangeRadius,
  onOpenDirections,
  onOpenReportIncident,
  onSelectIncident,
  userAddress,
  isNavigationActive,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'roads' | 'incidents'>('overview');

  const radiusOptions = [1, 3, 5, 10, 25];

  const getFlowBadge = (level: TrafficRadiusData['flowLevel']) => {
    switch (level) {
      case 'Fluid':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Fluid Traffic Flow',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          label: 'Moderate Slowdown',
        };
      case 'Heavy':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
          dot: 'bg-orange-400',
          label: 'Heavy Congestion',
        };
      case 'Gridlock':
      default:
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          label: 'Gridlock Warning',
        };
    }
  };

  const badge = getFlowBadge(radiusData.flowLevel);

  if (isNavigationActive) {
    return null; // Turn-by-turn navigation HUD takes priority on mobile
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none px-3 pb-3">
      {/* Floating Action Controls Bar (Above Bottom Drawer) */}
      <div className="w-full max-w-lg mb-2.5 flex items-center justify-between gap-3 pointer-events-auto">
        {/* Quick Report Hazard/Traffic Button */}
        <button
          onClick={onOpenReportIncident}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 backdrop-blur-md shadow-xl transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Report Road Hazard</span>
        </button>

        {/* Directions / Navigate Button */}
        <button
          onClick={onOpenDirections}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/40 hover:brightness-110 active:scale-95 transition-all"
        >
          <Navigation2 className="w-4 h-4 fill-white" />
          <span>Get Directions</span>
        </button>
      </div>

      {/* Main Bottom Sheet Container */}
      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out">
        {/* Drag Handle & Quick Status Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3.5 pb-2 cursor-pointer select-none hover:bg-slate-800/40 transition-colors"
        >
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Live Traffic Monitor</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
                    {badge.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                  {userAddress || `Scanning within ${selectedRadius} km radius`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs font-bold text-white">
                  {radiusData.avgSpeedKmh} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {radiusData.incidentsCount} incidents
                </div>
              </div>
              <button
                className="p-1 rounded-full text-slate-400 hover:text-white"
                aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
              >
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Radius Distance Filter Pill Tabs */}
        <div className="px-3.5 py-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            Radius:
          </div>
          <div className="flex items-center gap-1">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => onChangeRadius(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedRadius === r
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Expanded View Content */}
        {isExpanded && (
          <div className="px-3.5 pb-4 pt-1 max-h-[60vh] overflow-y-auto space-y-3.5 animate-in fade-in duration-200">
            {/* View Tabs */}
            <div className="flex rounded-xl bg-slate-800/60 p-1 border border-slate-700/60 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('roads')}
                className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                  activeTab === 'roads'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Corridors ({radiusData.roadSegments.length})
              </button>
              <button
                onClick={() => setActiveTab('incidents')}
                className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                  activeTab === 'incidents'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Incidents ({radiusData.incidentsCount})
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Congestion Metrics Card */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                    <div className="text-[10px] text-slate-400 font-medium mb-1">
                      Congestion
                    </div>
                    <div className="text-lg font-black text-white">
                      {radiusData.congestionScore}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Index score
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                    <div className="text-[10px] text-slate-400 font-medium mb-1">
                      Avg Speed
                    </div>
                    <div className="text-lg font-black text-emerald-400">
                      {radiusData.avgSpeedKmh} <span className="text-xs font-normal">km/h</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Free: {radiusData.freeFlowAvgKmh} km/h
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                    <div className="text-[10px] text-slate-400 font-medium mb-1">
                      Total Delay
                    </div>
                    <div className="text-lg font-black text-amber-400">
                      +{radiusData.totalDelayMinutes} <span className="text-xs font-normal">min</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Across {selectedRadius} km
                    </div>
                  </div>
                </div>

                {/* Top Congested Corridors Quick Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Nearby Arterial Routes</span>
                    <button
                      onClick={() => setActiveTab('roads')}
                      className="text-blue-400 text-[11px] hover:underline"
                    >
                      See All
                    </button>
                  </div>
                  {radiusData.roadSegments.slice(0, 3).map((seg) => (
                    <div
                      key={seg.id}
                      className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{seg.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{seg.distanceKm} km away</span>
                          <span>•</span>
                          <span>Limit: {seg.freeFlowSpeedKmh} km/h</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            seg.status === 'smooth'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : seg.status === 'slow'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {seg.currentSpeedKmh} km/h
                        </span>
                        {seg.delayMinutes > 0 && (
                          <div className="text-[10px] text-amber-400 font-medium mt-0.5">
                            +{seg.delayMinutes}m delay
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: ROADS & CORRIDORS */}
            {activeTab === 'roads' && (
              <div className="space-y-2">
                {radiusData.roadSegments.map((seg) => (
                  <div
                    key={seg.id}
                    className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm">{seg.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>Distance: {seg.distanceKm} km</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {seg.trend === 'improving' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          {seg.trend}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {seg.currentSpeedKmh}{' '}
                        <span className="text-[10px] font-normal text-slate-400">/ {seg.freeFlowSpeedKmh} km/h</span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                          seg.status === 'smooth'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : seg.status === 'slow'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {seg.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: INCIDENTS */}
            {activeTab === 'incidents' && (
              <div className="space-y-2">
                {radiusData.incidents.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No active accidents or hazards reported within {selectedRadius} km.
                  </div>
                ) : (
                  radiusData.incidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 mt-0.5">
                            {inc.type === 'accident' && <Flame className="w-4 h-4 text-rose-400" />}
                            {inc.type === 'construction' && <HardHat className="w-4 h-4 text-amber-400" />}
                            {inc.type === 'police' && <ShieldAlert className="w-4 h-4 text-blue-400" />}
                            {inc.type === 'jam' && <Car className="w-4 h-4 text-orange-400" />}
                            {inc.type === 'hazard' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{inc.title}</div>
                            <div className="text-[11px] text-slate-300 mt-0.5">
                              {inc.roadName}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {inc.description}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            +{inc.delayMinutes}m
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {inc.distanceKm} km away
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
