import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install directly on Android:\n1. Open Chrome menu (three dots ⋮)\n2. Tap "Install App" or "Add to Home screen"\n3. Android automatically creates your native WebAPK app icon!'
      );
    }
  };

  const copyBuildCommand = () => {
    navigator.clipboard.writeText('npm run build && npx cap sync android && cd android && ./gradlew assembleDebug');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Android APK &amp; Mobile Install</h3>
              <p className="text-[11px] text-slate-400">Install directly on phone or build signed APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Options */}
        <div className="p-4 overflow-y-auto space-y-3.5">
          {/* Method 1: Instant 1-Tap Android Install (WebAPK) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-800/60 to-slate-800/40 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-white">
                  1-Tap Instant Android Install
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Recommended
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Android OS and Chrome automatically bundle this into a standalone native Android package (WebAPK) with home screen launcher icon, splash screen, and GPS background access.
            </p>
            <button
              onClick={handleInstallPwa}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'App Already Installed' : 'Install on Android Phone'}</span>
            </button>
          </div>

          {/* Method 2: Cloud 1-Click APK Generator (PWABuilder) */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Download className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-white">
                  Download .APK Package (PWABuilder)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Google &amp; Microsoft Tool
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use PWABuilder to instantly compile and package your live app URL into a signed <code>.apk</code> or <code>.aab</code> file ready for direct Android side-loading or Google Play Store distribution.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="/trafficflow.apk"
                download="TrafficFlow-GPS.apk"
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Direct Download APK</span>
              </a>
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl font-medium text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <span>PWABuilder Cloud APK</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Method 3: Native Capacitor Gradle Build (In-Repository) */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Terminal className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-white">
                  Native Android Studio / Gradle Project
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                /android
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The full Android native workspace has already been created in this repository with <code>AndroidManifest.xml</code>, GPS location permissions, and Gradle scripts.
            </p>

            <div className="relative">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all pr-16">
                npm run build && npx cap sync android && cd android && ./gradlew assembleDebug
              </div>
              <button
                onClick={copyBuildCommand}
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                title="Copy Gradle Build Command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Output APK file: <code>android/app/build/outputs/apk/debug/app-debug.apk</code></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Android 8.0 to Android 15+ compatible</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
