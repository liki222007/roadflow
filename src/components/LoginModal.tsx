import React, { useState } from 'react';
import { UserProfile } from '../types/traffic';
import { X, Mail, Lock, User, CheckCircle2, MapPin, Sparkles, LogOut, Settings, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  defaultEmail?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  defaultEmail = 'deereshsrujan@gmail.com',
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [nameInput, setNameInput] = useState('Srujan Deeresh');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Google OAuth / 1-click Sign-in
  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const googleUser: UserProfile = {
        id: 'usr-google-' + Date.now(),
        email: emailInput.includes('@') ? emailInput : defaultEmail,
        displayName: nameInput || 'Google Navigator',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        provider: 'google',
        savedPlaces: [
          {
            id: 'place-home',
            name: 'Home',
            category: 'home',
            address: 'Residence & Downtown Parkway',
            lat: 37.7749,
            lng: -122.4194,
          },
          {
            id: 'place-work',
            name: 'Tech Campus / Office',
            category: 'work',
            address: 'Innovation Way, Sector 4',
            lat: 37.7891,
            lng: -122.4014,
          },
        ],
        alertRadiusKm: 5,
        soundAlerts: true,
        backgroundTracking: true,
      };
      onLogin(googleUser);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const emailUser: UserProfile = {
        id: 'usr-email-' + Date.now(),
        email: emailInput,
        displayName: nameInput || emailInput.split('@')[0],
        provider: 'email',
        savedPlaces: [
          {
            id: 'place-home',
            name: 'Home',
            category: 'home',
            address: 'Primary Location',
            lat: 37.7749,
            lng: -122.4194,
          },
        ],
        alertRadiusKm: 5,
        soundAlerts: true,
        backgroundTracking: true,
      };
      onLogin(emailUser);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleGuestSignIn = () => {
    const guestUser: UserProfile = {
      id: 'guest-' + Date.now(),
      email: 'guest@trafficflow.app',
      displayName: 'Guest Driver',
      provider: 'guest',
      savedPlaces: [],
      alertRadiusKm: 3,
      soundAlerts: true,
      backgroundTracking: false,
    };
    onLogin(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          // Logged in user profile state
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-bold text-white truncate">
                    {currentUser.displayName}
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-mono font-semibold">
                    {currentUser.provider}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {currentUser.email}
                </p>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live GPS Traffic Sync Active
                </p>
              </div>
            </div>

            {/* Saved Quick Places */}
            <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Saved GPS Locations
                </span>
                <span className="text-slate-400">{currentUser.savedPlaces.length} locations</span>
              </div>
              <div className="space-y-1.5">
                {currentUser.savedPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{place.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {place.address}
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      Quick Route
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Preferences */}
            <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Traffic Alert Radius
                </span>
                <span className="font-semibold text-blue-400">{currentUser.alertRadiusKm} km</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Background GPS Tracking
                </span>
                <span className="text-emerald-400 font-medium">Enabled</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onLogout}
                className="flex-1 py-2.5 px-4 rounded-xl font-medium text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all"
              >
                Back to Map
              </button>
            </div>
          </div>
        ) : (
          // Login Form
          <div>
            <div className="text-center mb-5">
              <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-2">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                TrafficFlow Account
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Sync saved routes, customized traffic alerts, and crowd-sourced incident reports
              </p>
            </div>

            {/* Official Google / Gmail One-Tap Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.98] mb-4 border border-slate-200"
            >
              {/* Google official SVG logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.87c2.27-2.09 3.67-5.17 3.67-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.04c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.13C3.25 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.62H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.38l4.01-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.26 6.62l4.01 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Continue with Google (Gmail)</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">
                Or use email
              </span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30 mt-2"
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs mt-3 text-slate-400">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="hover:text-blue-400 transition-colors"
              >
                {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                className="text-slate-400 hover:text-white underline"
              >
                Skip as Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
