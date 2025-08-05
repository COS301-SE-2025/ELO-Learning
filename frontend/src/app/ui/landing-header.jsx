'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import InstallInstructionsPopup from './install-instructions-popup';

export default function LandingHeader() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);

  // Add logging for state changes
  useEffect(() => {
    console.log('State changed - showInstallButton:', showInstallButton);
  }, [showInstallButton]);

  useEffect(() => {
    console.log('State changed - isAppInstalled:', isAppInstalled);
  }, [isAppInstalled]);

  useEffect(() => {
    console.log('State changed - deferredPrompt:', !!deferredPrompt);
  }, [deferredPrompt]);

  useEffect(() => {
    console.log(
      'State changed - showInstructionsPopup:',
      showInstructionsPopup,
    );
  }, [showInstructionsPopup]);

  useEffect(() => {
    console.log('LandingHeader useEffect running');

    // Check if app is currently running as installed PWA
    const checkIfRunningAsPWA = () => {
      console.log('Checking if running as PWA...');

      // Only check for actual standalone mode (currently running as PWA)
      if (
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches
      ) {
        console.log('Detected standalone mode - running as PWA');
        setIsAppInstalled(true);
        return;
      }

      // Check for iOS standalone mode (currently running as PWA)
      if (navigator.standalone === true) {
        console.log('Detected iOS standalone mode - running as PWA');
        setIsAppInstalled(true);
        return;
      }

      // If not running as PWA, clear any previous installation state
      console.log('Not running as PWA - clearing state');
      setIsAppInstalled(false);
      localStorage.removeItem('pwa-installed');
    };

    const handler = (e) => {
      console.log('beforeinstallprompt event fired!', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const appInstalledHandler = () => {
      console.log('appinstalled event fired!');
      setIsAppInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      // Store installation state
      localStorage.setItem('pwa-installed', 'true');
    };

    // Clear any existing event listeners first
    console.log('Clearing existing event listeners');
    window.removeEventListener('beforeinstallprompt', handler);
    window.removeEventListener('appinstalled', appInstalledHandler);

    // Check current state
    checkIfRunningAsPWA();

    // Small delay to ensure proper event listener setup
    setTimeout(() => {
      console.log('Setting up event listeners');
      // Always listen for install prompt when in browser mode
      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('appinstalled', appInstalledHandler);
    }, 100);

    // Always show install button after a delay if not running as PWA
    // This ensures the button is available even without beforeinstallprompt
    setTimeout(() => {
      console.log('Checking if we should show install button after timeout');
      const isStandalone =
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = navigator.standalone === true;
      console.log('Standalone checks:', { isStandalone, isIOSStandalone });

      if (!isStandalone && !isIOSStandalone) {
        console.log('Setting showInstallButton to true after timeout');
        setShowInstallButton(true);
      } else {
        console.log('App is running standalone, not showing install button');
      }
    }, 1000);

    return () => {
      console.log('Cleaning up event listeners');
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);
  const handleInstall = async () => {
    console.log('Install button clicked', {
      deferredPrompt,
      showInstallButton,
    });

    if (!deferredPrompt) {
      // If PWA install is not available, show the instructions popup
      console.log('No deferred prompt, showing instructions');
      setShowInstructionsPopup(true);
      return;
    }

    try {
      console.log('Prompting for install');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install outcome:', outcome);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallButton(false);
      }
    } catch (error) {
      console.log('Install prompt failed:', error);
      // Fallback to instructions popup
      setShowInstructionsPopup(true);
    }
  };

  const handleOpenApp = () => {
    // Try to open the PWA using the app's URL
    const appUrl = window.location.origin + '/login-landing';

    // For Android, try to use the PWA's intent URL
    if (navigator.userAgent.includes('Android')) {
      window.location.href = `intent://${window.location.host}/login-landing#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      // For other platforms, try to open the PWA directly
      window.open(appUrl, '_blank');
    }
  };

  return (
    <>
      {console.log('Rendering LandingHeader:', {
        isAppInstalled,
        showInstallButton,
        showInstructionsPopup,
      })}
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
          {console.log('Button render logic - isAppInstalled:', isAppInstalled)}
          {isAppInstalled ? (
            <button
              className="header-button"
              onClick={handleOpenApp}
              title="Open ELO Learning App"
            >
              {console.log('Rendering Open App button')}
              <span className="hidden sm:inline">Open App</span>
              <span className="sm:hidden">Open</span>
            </button>
          ) : (
            <button
              className="header-button"
              onClick={handleInstall}
              title={
                showInstallButton ? 'Install ELO Learning App' : 'Download App'
              }
            >
              {console.log(
                'Rendering Install button - showInstallButton:',
                showInstallButton,
              )}
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
