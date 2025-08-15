// hooks/usePushNotifications.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  onMessageListener,
  registerFCMToken,
  removeFCMToken,
} from '../services/firebase.js';

export const usePushNotifications = (userId, accessToken) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationPermission, setNotificationPermission] =
    useState('default');
  const [foregroundMessage, setForegroundMessage] = useState(null);

  // Initialize push notifications
  const initializePushNotifications = useCallback(async () => {
    try {
      // Check current permission status
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      // Request permission and get FCM token
      const token = await requestNotificationPermission();

      if (token) {
        setFcmToken(token);
        setNotificationPermission('granted');

        // Register token with backend
        const registered = await registerFCMToken(userId, token, accessToken);
        if (registered) {
          console.log('FCM token successfully registered with backend');
        }
      } else {
        setNotificationPermission('denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      setNotificationPermission('denied');
    }
  }, [userId, accessToken]);

  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      initializePushNotifications();
    }
  }, [userId, initializePushNotifications]);

  // Listen for foreground messages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      onMessageListener()
        .then((payload) => {
          console.log('Foreground message received:', payload);
          setForegroundMessage(payload);
        })
        .catch((err) =>
          console.log('Failed to receive foreground message:', err),
        );
    }
  }, []);

  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission();

      if (token) {
        setFcmToken(token);
        setNotificationPermission('granted');

        if (userId) {
          await registerFCMToken(userId, token, accessToken);
        }

        return true;
      } else {
        setNotificationPermission('denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setNotificationPermission('denied');
      return false;
    }
  };

  const clearToken = async () => {
    try {
      if (userId) {
        await removeFCMToken(userId);
      }
      setFcmToken(null);
      setNotificationPermission('default');
    } catch (error) {
      console.error('Error clearing FCM token:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/send-test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userId,
            title: '🧪 Test Notification',
            body: 'This is a test notification from ELO Learning!',
          }),
        },
      );

      if (response.ok) {
        console.log('Test notification sent successfully');
        return true;
      } else {
        console.error('Failed to send test notification');
        return false;
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };

  // Clear foreground message
  const clearForegroundMessage = () => {
    setForegroundMessage(null);
  };

  return {
    fcmToken,
    notificationPermission,
    foregroundMessage,
    requestPermission,
    clearToken,
    sendTestNotification,
    clearForegroundMessage,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  };
};
