import React, { useState } from 'react';
import { IncidentType, TrafficIncident, UserLocation } from '../types/traffic';
import {
  X,
  Flame,
  HardHat,
  ShieldAlert,
  Car,
  Ban,
  AlertTriangle,
  MapPin,
  Check,
} from 'lucide-react';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onReport: (incident: TrafficIncident) => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onReport,
}) => {
  const [selectedType, setSelectedType] = useState<IncidentType>('jam');
  const [roadName, setRoadName] = useState('Current GPS Highway/Avenue');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState<TrafficIncident['severity']>('moderate');

  if (!isOpen) return null;

  const incidentOptions: Array<{
    type: IncidentType;
    label: string;
    icon: React.ReactNode;
    color: string;
    delay: number;
  }> = [
    {
      type: 'jam',
      label: 'Traffic Jam',
      icon: <Car className="w-5 h-5" />,
      color: 'bg-orange-600',
      delay: 8,
    },
    {
      type: 'accident',
      label: 'Crash',
      icon: <Flame className="w-5 h-5" />,
      color: 'bg-rose-600',
      delay: 15,
    },
    {
      type: 'hazard',
      label: 'Hazard',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-amber-600',
      delay: 4,
    },
    {
      type: 'police',
      label: 'Police Trap',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'bg-blue-600',
      delay: 2,
    },
    {
      type: 'construction',
      label: 'Roadworks',
      icon: <HardHat className="w-5 h-5" />,
      color: 'bg-yellow-600',
      delay: 6,
    },
    {
      type: 'closure',
      label: 'Closure',
      icon: <Ban className="w-5 h-5" />,
      color: 'bg-red-700',
      delay: 20,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = incidentOptions.find((o) => o.type === selectedType) || incidentOptions[0];

    const newIncident: TrafficIncident = {
      id: `usr-report-${Date.now()}`,
      type: selectedType,
      title: `User Report: ${chosen.label}`,
      roadName: roadName || 'Current Location',
      description: notes || `Reported ${chosen.label} by driver on this sector`,
      lat: userLocation.lat + (Math.random() - 0.5) * 0.002,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.002,
      severity,
      delayMinutes: chosen.delay,
      distanceKm: 0.1,
      reportedAgo: 'Just now',
      votes: 1,
      verified: true,
    };

    onReport(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-5 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Report Traffic Event</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Incident Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Select Incident Type:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {incidentOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setSelectedType(opt.type)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    selectedType === opt.type
                      ? 'border-blue-500 bg-blue-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl text-white ${opt.color}`}>
                    {opt.icon}
                  </div>
                  <span className="text-[11px] font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Road / Location Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Location / Road Name:
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Details / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Additional Details (optional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Left 2 lanes blocked, towing truck arrived"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
          >
            <Check className="w-4 h-4" />
            Submit Live Report to Map
          </button>
        </form>
      </div>
    </div>
  );
};
