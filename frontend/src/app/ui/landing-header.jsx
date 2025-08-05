'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import InstallInstructionsPopup from './install-instructions-popup';

export default function LandingHeader() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches
      ) {
        setIsAppInstalled(true);
        return;
      }

      if (navigator.standalone === true) {
        setIsAppInstalled(true);
        return;
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

    checkIfInstalled();
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If PWA install is not available, show the instructions popup
      setShowInstructionsPopup(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <>
      <div className="header-landing fixed top-0 left-0 w-full h-20 z-50 flex flex-row justify-between align-middle px-3 py-4 bg-[#202123] md:px-10">
        <div className="flex items-center justify-center">
          <Image
            src="/ELO-Logo-Horizontal.png"
            width={150}
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
            <button
              className="header-button opacity-75 cursor-default"
              disabled
              title="App is already installed"
            >
              <span className="hidden sm:inline">App Installed</span>
              <span className="sm:hidden">Installed</span>
            </button>
          ) : (
            <button
              className="header-button"
              onClick={handleInstall}
              title={
                showInstallButton ? 'Install ELO Learning App' : 'Download App'
              }
            >
              {showInstallButton ? (
                <>
                  <span className="hidden sm:inline">Install App</span>
                  <span className="sm:hidden">Install</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Install the app</span>
                  <span className="sm:hidden">Get App</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <InstallInstructionsPopup
        isOpen={showInstructionsPopup}
        onClose={() => setShowInstructionsPopup(false)}
        userAgent={typeof window !== 'undefined' ? navigator.userAgent : ''}
      />
    </>
  );
}
