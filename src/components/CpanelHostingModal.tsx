import React from 'react';
import { X, Server, FolderUp, FileCode, CheckCircle2, Globe, ExternalLink } from 'lucide-react';

interface CpanelHostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CpanelHostingModal: React.FC<CpanelHostingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                How to Host Flag Wars on a cPanel Website
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step guide to export and deploy this React web application to your cPanel hosting
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

        {/* Steps */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <FolderUp className="w-4 h-4" />
              <span>Step 1: Build the Production Files</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In your project terminal or command line, run:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-emerald-400 text-xs border border-slate-800">
              npm run build
            </div>
            <p className="text-slate-400 text-[11px]">
              This compiles all React components, icons, audio, and styles into a clean static folder called <code>dist/</code> containing <code>index.html</code>, assets, and JS bundles.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Server className="w-4 h-4" />
              <span>Step 2: Upload Files to cPanel File Manager</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              1. Log into your <strong>cPanel</strong> dashboard.<br />
              2. Open <strong>File Manager</strong>.<br />
              3. Navigate to <code>public_html/</code> (or a subdomain folder like <code>public_html/flagwars/</code>).<br />
              4. Zip all the files <em>inside</em> the <code>dist/</code> folder into a <code>dist.zip</code>.<br />
              5. Click <strong>Upload</strong> in cPanel and upload <code>dist.zip</code>.<br />
              6. Right-click <code>dist.zip</code> in cPanel File Manager → click <strong>Extract</strong>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <FileCode className="w-4 h-4" />
              <span>Step 3: Create .htaccess for Smooth Web Routing (SPA)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Create a file named <code>.htaccess</code> inside your cPanel <code>public_html/</code> folder and paste this standard configuration:
            </p>
            <pre className="bg-slate-900 p-3 rounded-xl font-mono text-cyan-300 text-[11px] border border-slate-800 overflow-x-auto">
{`<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`}
            </pre>
            <p className="text-slate-400 text-[11px]">
              This ensures that any direct link or page reload serves the game seamlessly without 404 errors.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>Step 4: Launch and Use on YouTube 24/7 Stream</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Visit <code>https://yourdomain.com</code> (or your subdomain).<br />
              • The game runs 100% in client-side HTML5 canvas and Web Audio, with <strong>zero server load</strong>!<br />
              • You can now copy your website URL directly into OBS Studio on your RDP as a <strong>Browser Source</strong> (1920×1080) for continuous 24/7 live streaming!
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
