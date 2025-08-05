// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

// Function to request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.warn('Firebase messaging not available (likely SSR)');
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Function to listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.warn('Firebase messaging not available');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

// Function to register FCM token with your backend
export const registerFCMToken = async (userId, token) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/register-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Adjust based on your auth system
        },
        body: JSON.stringify({
          userId,
          fcmToken: token,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to register FCM token');
    }

    console.log('FCM token registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};

// Function to remove FCM token (on logout)
export const removeFCMToken = async (userId) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/remove-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ userId }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to remove FCM token');
    }

    console.log('FCM token removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing FCM token:', error);
    return false;
  }
};

export { messaging };
export default app;
