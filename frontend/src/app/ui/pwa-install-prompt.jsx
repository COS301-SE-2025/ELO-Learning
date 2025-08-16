'use client';
import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setShowInstallPrompt(false);
    }
  }, []);

  if (!showInstallPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-[#BD86F8] to-[#FF6E99] text-white p-4 rounded-lg shadow-lg z-50 max-w-sm mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Download size={20} className="mr-2" />
            <h3 className="font-semibold text-sm">Install ELO Learning</h3>
          </div>
          <p className="text-xs mb-3 opacity-90">
            Install our app for a better experience with offline access!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-[#BD86F8] px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-white text-xs underline hover:no-underline"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-gray-200 transition-colors ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
