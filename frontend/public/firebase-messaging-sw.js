// Firebase messaging service worker for background notifications
importScripts(
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js',
);

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAnGOykakk17pXJcCmYxzEGQcGdFncJivU',
  authDomain: 'capstone-41923.firebaseapp.com',
  projectId: 'capstone-41923',
  storageBucket: 'capstone-41923.firebasestorage.app',
  messagingSenderId: '222381780803',
  appId: '1:222381780803:web:af7a2ba3859fcc403289f6',
  measurementId: 'G-08BB298H86',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/ELO-Logo-Horizontal.png',
    badge: '/ELO-Logo-Horizontal.png',
    tag: payload.data?.type || 'default',
    data: {
      url: payload.notification.click_action || '/',
      ...payload.data,
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Handle the click action
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
