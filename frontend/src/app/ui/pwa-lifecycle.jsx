'use client';
import { useEffect } from 'react';

export default function PWALifecycle() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      const promptNewVersionAvailable = (event) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        if (confirm('A newer version is available! Reload to update?')) {
          wb.addEventListener('controlling', (event) => {
            window.location.reload();
          });

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting();
        }
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);
      wb.addEventListener('externalwaiting', promptNewVersionAvailable);

      // Register the service worker after event listeners have been added.
      wb.register();
    }
  }, []);

  return null;
}
