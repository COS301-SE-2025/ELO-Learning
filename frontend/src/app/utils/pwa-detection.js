/**
 * Enhanced PWA detection utilities
 */

export const PWADetection = {
  /**
   * Check if the app is currently running as a PWA
   */
  isRunningAsPWA: () => {
    // Check for standalone display mode
    if (
      window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return true;
    }

    // Check for iOS standalone mode
    if (navigator.standalone === true) {
      return true;
    }

    return false;
  },

  /**
   * Check if the PWA is installed (but not necessarily running as PWA)
   */
  isPWAInstalled: async () => {
    // Method 1: Currently running as PWA
    if (PWADetection.isRunningAsPWA()) {
      return true;
    }

    // Method 2: Use getInstalledRelatedApps API (Chrome/Edge)
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        if (relatedApps && relatedApps.length > 0) {
          return true;
        }
      } catch (error) {
        console.log('getInstalledRelatedApps error:', error);
      }
    }

    // Method 3: Check localStorage tracking (most reliable)
    const installationTracked = localStorage.getItem('pwa-installed');
    if (installationTracked === 'true') {
      return true;
    }

    // Method 4: Check session storage if install prompt was received this session
    const promptReceived = sessionStorage.getItem(
      'beforeinstallprompt-received',
    );
    if (promptReceived === 'true') {
      // If we received the prompt this session, app is definitely not installed
      return false;
    }

    // Method 5: Check if we've seen an install prompt before in localStorage
    const hasSeenPrompt = localStorage.getItem('has-seen-install-prompt');
    if (hasSeenPrompt === 'true') {
      // If we've seen a prompt before but no longer seeing it and not explicitly installed,
      // assume it's not installed
      return false;
    }

    // Default: assume not installed unless we have explicit evidence
    return false;
  },

  /**
   * Track that the user has visited the site
   */
  trackVisit: () => {
    localStorage.setItem('has-visited-before', 'true');
    if (!localStorage.getItem('first-visit-time')) {
      localStorage.setItem('first-visit-time', Date.now().toString());
    }
  },

  /**
   * Track that beforeinstallprompt was received
   */
  trackInstallPromptReceived: () => {
    sessionStorage.setItem('beforeinstallprompt-received', 'true');
    localStorage.setItem('has-seen-install-prompt', 'true');
  },

  /**
   * Track that the PWA was installed
   */
  trackInstallation: () => {
    localStorage.setItem('pwa-installed', 'true');
  },

  /**
   * Reset installation tracking (for testing or if app is uninstalled)
   */
  resetInstallationTracking: () => {
    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('has-seen-install-prompt');
    sessionStorage.removeItem('beforeinstallprompt-received');
  },

  /**
   * Get the appropriate button text and action based on installation status
   */
  getInstallButtonState: async () => {
    const isInstalled = await PWADetection.isPWAInstalled();
    const isRunningAsPWA = PWADetection.isRunningAsPWA();

    return {
      isInstalled,
      isRunningAsPWA,
      buttonText: isInstalled || isRunningAsPWA ? 'Open App' : 'Install App',
      shortButtonText: isInstalled || isRunningAsPWA ? 'Open' : 'Install',
      action: isInstalled || isRunningAsPWA ? 'open' : 'install',
    };
  },

  /**
   * Debug method to check all installation indicators
   */
  debugInstallationStatus: async () => {
    const isRunningAsPWA = PWADetection.isRunningAsPWA();
    const installationTracked = localStorage.getItem('pwa-installed');
    const promptReceived = sessionStorage.getItem(
      'beforeinstallprompt-received',
    );
    const hasSeenPrompt = localStorage.getItem('has-seen-install-prompt');
    const hasVisitedBefore = localStorage.getItem('has-visited-before');

    let relatedApps = null;
    if ('getInstalledRelatedApps' in navigator) {
      try {
        relatedApps = await navigator.getInstalledRelatedApps();
      } catch (error) {
        relatedApps = 'Error: ' + error.message;
      }
    }

    const finalResult = await PWADetection.isPWAInstalled();

    console.log('PWA Installation Debug Status:', {
      isRunningAsPWA,
      installationTracked,
      promptReceived,
      hasSeenPrompt,
      hasVisitedBefore,
      relatedApps,
      finalResult,
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia('(display-mode: standalone)').matches
        ? 'standalone'
        : 'browser',
      navigatorStandalone: navigator.standalone,
    });

    return {
      isRunningAsPWA,
      installationTracked,
      promptReceived,
      hasSeenPrompt,
      hasVisitedBefore,
      relatedApps,
      finalResult,
    };
  },
};
