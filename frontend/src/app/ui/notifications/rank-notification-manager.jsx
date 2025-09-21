'use client';
import { useEffect, useState } from 'react';
import RankNotification from './rank-notification';

export default function RankNotificationManager() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Register global function for showing rank notifications
    if (typeof window !== 'undefined') {
      window.showRankNotification = (rankChange) => {
        console.log(
          '🏆 RankNotificationManager: Showing rank notification:',
          rankChange,
        );

        if (!rankChange) {
          console.warn('⚠️ No rank change data provided');
          return;
        }

        const notification = {
          id: Date.now() + Math.random(), // Unique ID for each notification
          ...rankChange,
          show: true,
        };

        setNotifications((prev) => [...prev, notification]);
      };

      // Optional: Function to show multiple rank notifications (for future use)
      window.showMultipleRankNotifications = (rankChanges) => {
        console.log(
          '🏆 RankNotificationManager: Showing multiple rank notifications:',
          rankChanges,
        );

        if (!Array.isArray(rankChanges) || rankChanges.length === 0) {
          console.warn('⚠️ No rank changes provided or invalid format');
          return;
        }

        rankChanges.forEach((rankChange, index) => {
          setTimeout(() => {
            if (window.showRankNotification) {
              window.showRankNotification(rankChange);
            }
          }, index * 1500); // Stagger notifications by 1.5 seconds
        });
      };

      console.log('🏆 RankNotificationManager: Global functions registered');
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        delete window.showRankNotification;
        delete window.showMultipleRankNotifications;
      }
    };
  }, []);

  const hideNotification = (notificationId) => {
    console.log(
      '🏆 RankNotificationManager: Hiding notification:',
      notificationId,
    );
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId),
    );
  };

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{
            marginTop: `${index * 120}px`, // Stack notifications vertically
          }}
        >
          <RankNotification
            rankChange={{
              oldRank: notification.oldRank,
              newRank: notification.newRank,
              isPromotion: notification.isPromotion,
            }}
            show={notification.show}
            onClose={() => hideNotification(notification.id)}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
}
