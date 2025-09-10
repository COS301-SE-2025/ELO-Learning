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

    // Method 3: Check localStorage tracking
    const installationTracked = localStorage.getItem('pwa-installed');
    if (installationTracked === 'true') {
      return true;
    }

    // Method 4: Check session storage if install prompt was received this session
    const promptReceived = sessionStorage.getItem(
      'beforeinstallprompt-received',
    );
    if (promptReceived === 'true') {
      // If we received the prompt this session, app is not installed
      return false;
    }

    // Method 5: For mobile devices, assume installed if no install prompt after reasonable time
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasVisitedBefore = localStorage.getItem('has-visited-before');

    if (isMobile && hasVisitedBefore) {
      // On mobile, if user has visited before and no install prompt in this session,
      // it's likely the app is installed
      return true;
    }

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
};
