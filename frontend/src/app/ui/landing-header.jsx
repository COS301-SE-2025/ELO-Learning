'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PWADetection } from '../utils/pwa-detection';

export default function LandingHeader() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [buttonState, setButtonState] = useState({
    isInstalled: false,
    isRunningAsPWA: false,
    buttonText: 'Install App',
    shortButtonText: 'Install',
    action: 'install',
  });

  useEffect(() => {
    let mounted = true;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);

      // Track that the install prompt was received
      PWADetection.trackInstallPromptReceived();

      // If prompt fires, app is definitely not installed
      if (mounted) {
        setButtonState({
          isInstalled: false,
          isRunningAsPWA: false,
          buttonText: 'Install App',
          shortButtonText: 'Install',
          action: 'install',
        });
      }
    };

    const appInstalledHandler = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      PWADetection.trackInstallation();

      // Update button state to show "Open App"
      if (mounted) {
        setButtonState({
          isInstalled: true,
          isRunningAsPWA: false,
          buttonText: 'Open App',
          shortButtonText: 'Open',
          action: 'open',
        });
        // Show the button again as "Open App"
        setShowInstallButton(true);
      }
    };

    const updateButtonState = async () => {
      if (!mounted) return;

      const state = await PWADetection.getInstallButtonState();
      setButtonState(state);

      // Only show install button if app is not installed AND not running as PWA
      if (!state.isInstalled && !state.isRunningAsPWA) {
        // For the install button to be shown, we need either:
        // 1. A deferred prompt is available, OR
        // 2. We haven't seen an install prompt yet (first time visitors)
        const hasSeenPrompt = localStorage.getItem('has-seen-install-prompt');
        if (deferredPrompt || !hasSeenPrompt) {
          setShowInstallButton(true);
        } else {
          setShowInstallButton(false);
        }
      } else {
        // App is installed or running as PWA, show the button as "Open"
        setShowInstallButton(true);
      }
    };

    // Track this visit
    PWADetection.trackVisit();

    // Set up event listeners first
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', appInstalledHandler);

    // Then check installation status
    updateButtonState();

    return () => {
      mounted = false;
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  // Re-check button state when deferredPrompt changes
  useEffect(() => {
    const updateButtonState = async () => {
      const state = await PWADetection.getInstallButtonState();
      setButtonState(state);

      if (!state.isInstalled && !state.isRunningAsPWA) {
        const hasSeenPrompt = localStorage.getItem('has-seen-install-prompt');
        if (deferredPrompt || !hasSeenPrompt) {
          setShowInstallButton(true);
        } else {
          setShowInstallButton(false);
        }
      } else {
        setShowInstallButton(true);
      }
    };

    updateButtonState();
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (buttonState.action === 'open') {
      handleOpenApp();
      return;
    }

    if (deferredPrompt) {
      try {
        const result = await deferredPrompt.prompt();
        setDeferredPrompt(null);
        setShowInstallButton(false);

        if (result.outcome === 'accepted') {
          PWADetection.trackInstallation();
          // Update button state
          const newState = await PWADetection.getInstallButtonState();
          setButtonState(newState);
        }
      } catch (error) {
        console.log('Install prompt error:', error);
      }
    } else {
      alert(
        'To install the app, look for the install icon in your browser address bar or check your browser menu for "Install" options.',
      );
    }
  };

  const handleOpenApp = () => {
    // Check if we're currently running as a PWA
    if (PWADetection.isRunningAsPWA()) {
      // Already in PWA mode, just navigate
      window.location.href = '/login-landing';
      return;
    }

    // If we're in the browser but app is installed, show instructions
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Show instructions for mobile users to launch from home screen
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const instructions = isIOS
        ? 'To use the app, tap the ELO Learning icon on your home screen. This will launch the full app experience!'
        : 'To use the app, tap the ELO Learning icon on your home screen or app drawer. This will launch the full app experience!';

      if (
        confirm(
          instructions +
            '\n\nWould you like to continue in the browser for now?',
        )
      ) {
        window.location.href = '/login-landing';
      }
    } else {
      // On desktop, try to open in app mode or navigate normally
      window.location.href = '/login-landing';
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-between p-4 shadow-sm">
        <div className="flex items-center">
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
          <button
            className="header-button"
            onClick={handleInstall}
            title={
              buttonState.action === 'open'
                ? 'Open ELO Learning App'
                : 'Install ELO Learning App'
            }
          >
            <span className="hidden sm:inline">{buttonState.buttonText}</span>
            <span className="sm:hidden">{buttonState.shortButtonText}</span>
          </button>
        </div>
      </div>
    </>
  );
}
