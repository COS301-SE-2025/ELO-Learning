'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function LandingHeader() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // PWA detection for button display
    const checkIfRunningAsPWA = () => {
      const isStandalone =
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = navigator.standalone === true;

      if (isStandalone || isIOSStandalone) {
        setIsAppInstalled(true);
        return true;
      } else {
        setIsAppInstalled(false);
        return false;
      }
    };

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const appInstalledHandler = () => {
      setIsAppInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    const currentlyInPWA = checkIfRunningAsPWA();

    if (!currentlyInPWA) {
      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('appinstalled', appInstalledHandler);

      // Show install button after delay if no prompt received
      setTimeout(() => {
        const stillInBrowser =
          !window.matchMedia ||
          !window.matchMedia('(display-mode: standalone)').matches;
        const stillNotIOS = navigator.standalone !== true;

        if (stillInBrowser && stillNotIOS) {
          setShowInstallButton(true);
        }
      }, 1000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      const result = await deferredPrompt.prompt();
      setDeferredPrompt(null);
      setShowInstallButton(false);

      if (result.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
    } else {
      alert(
        'To install the app, look for the install icon in your browser address bar or check your browser menu for "Install" options.',
      );
    }
  };

  const handleOpenApp = () => {
    window.location.href = '/login-landing';
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <Image
            src="/ELO-Learning-Mascot.png"
            width={60}
            height={40}
            className="hidden md:block"
            alt="ELO Learning Mascot"
            priority
          />
          <Image
            src="/ELO-Learning-Mascot.png"
            width={50}
            height={50}
            className="block md:hidden"
            alt="ELO Learning Mascot"
            priority
          />
        </div>
        <div>
          {isAppInstalled ? (
            // Show "Open App" when running as PWA
            <button
              className="header-button"
              onClick={handleOpenApp}
              title="Open ELO Learning App"
            >
              <span className="hidden sm:inline">Open App</span>
              <span className="sm:hidden">Open</span>
            </button>
          ) : (
            // Show "Install" when in browser mode
            <button
              className="header-button"
              onClick={handleInstall}
              title="Install ELO Learning App"
            >
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">Install</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
