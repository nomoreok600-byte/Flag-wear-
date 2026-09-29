import React from 'react';
import { X, Tv, Monitor, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RdpObsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RdpObsGuideModal: React.FC<RdpObsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                How to Setup 24/7 YouTube Live Stream on RDP & OBS
              </h2>
              <p className="text-xs text-slate-400">
                Complete guide to run this automated game 24/7 on a Windows VPS/RDP with OBS Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Monitor className="w-4 h-4" />
              <span>Step 1: Open Game on Your RDP / VPS</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              1. Connect to your Windows RDP via Remote Desktop Connection.<br />
              2. Open <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> and navigate to this game's URL.<br />
              3. Click <strong>"OBS VIEW"</strong> in the top header. This hides controls and maximizes the battle grid, live scoreboard, and announcer ticker for broadcast.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Tv className="w-4 h-4" />
              <span>Step 2: Add Game into OBS Studio</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Method A (Recommended - Window Capture):</strong><br />
              • In OBS Studio under <em>Sources</em>, click <strong>+ → Window Capture</strong>.<br />
              • Select Chrome/Edge running Flag Wars.<br />
              • In Capture Method, choose <em>Windows 10 (1903 and up)</em>.<br />
              • Right-click the source in OBS → <em>Transform → Fit to Screen</em>.<br /><br />
              <strong>Method B (OBS Browser Source):</strong><br />
              • Click <strong>+ → Browser</strong>, paste this application URL.<br />
              • Set Width: <strong>1920</strong>, Height: <strong>1080</strong>, and check <em>"Control audio via OBS"</em>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Volume2 className="w-4 h-4" />
              <span>Step 3: Route Audio & Live AI Commentary</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              • Ensure <strong>SFX</strong> and <strong>AI Announcer Voice</strong> are turned ON.<br />
              • In OBS under <em>Audio Mixer</em>, ensure <strong>Desktop Audio</strong> (or the Browser Source audio) is capturing sound meters moving when balls conquer tiles or the commentator speaks.<br />
              • Tip: If your RDP has no physical audio device, install <strong>VB-Audio Virtual Cable</strong> (free) on the RDP so Windows audio routes straight into OBS.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Step 4: Recommended 24/7 Stream Output Settings</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mt-1">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Resolution</span>
                <span className="text-white font-bold">1920×1080 (1080p)</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Framerate</span>
                <span className="text-white font-bold">60 FPS</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Bitrate</span>
                <span className="text-white font-bold">4500–6000 Kbps</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Keyframe</span>
                <span className="text-white font-bold">2.0 seconds</span>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Step 5: Disconnect Without Stopping the Stream</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When closing your Remote Desktop connection on your personal PC, <strong>do not sign out or shut down the RDP</strong>.<br />
              Simply click the <strong>X</strong> on the Remote Desktop blue bar at the top. The VPS session stays active, OBS keeps streaming to YouTube, and Flag Wars auto-loops 24/7!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
