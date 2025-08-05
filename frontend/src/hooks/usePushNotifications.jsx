// hooks/usePushNotifications.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  onMessageListener,
  registerFCMToken,
  removeFCMToken,
} from '../services/firebase.js';

export const usePushNotifications = (userId) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationPermission, setNotificationPermission] =
    useState('default');
  const [foregroundMessage, setForegroundMessage] = useState(null);

  // Initialize push notifications
  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      initializePushNotifications();
    }
  }, [userId]);

  // Listen for foreground messages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      onMessageListener()
        .then((payload) => {
          console.log('Foreground message received:', payload);
          setForegroundMessage(payload);

          // Show browser notification for foreground messages
          if (Notification.permission === 'granted') {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: payload.notification.icon || '/ELO-Logo-Horizontal.png',
              tag: payload.data?.type || 'foreground',
            });
          }
        })
        .catch((err) =>
          console.log('Failed to receive foreground message:', err),
        );
    }
  }, []);

  const initializePushNotifications = async () => {
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
        const registered = await registerFCMToken(userId, token);
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
  };

  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission();

      if (token) {
        setFcmToken(token);
        setNotificationPermission('granted');

        if (userId) {
          await registerFCMToken(userId, token);
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
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
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
