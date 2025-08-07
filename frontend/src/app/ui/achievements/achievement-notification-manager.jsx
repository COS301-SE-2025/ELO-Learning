// app/ui/achievements/achievement-notification-manager.jsx
'use client';
import { useCallback, useEffect, useState } from 'react';
import AchievementNotification from './achievement-notification';

export default function AchievementNotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const showAchievement = useCallback((achievement) => {
    console.log('🔔 showAchievement called:', achievement.name);
    const id = Date.now() + Math.random(); // Unique ID
    const newNotification = { ...achievement, id, show: true };

    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const hideAchievement = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const showMultipleAchievements = useCallback(
    (achievements) => {
      if (!achievements || achievements.length === 0) {
        console.log('🔔 showMultipleAchievements: No achievements to show');
        return;
      }

      console.log('🔔 showMultipleAchievements called with:', achievements.length, 'achievements');

      // Show achievements one by one with staggered timing
      achievements.forEach((achievement, index) => {
        setTimeout(() => {
          showAchievement(achievement);
        }, index * 1000); // 1 second delay between each
      });
    },
    [showAchievement],
  );

  // Set up global functions with retry mechanism for better reliability
  useEffect(() => {
    const setupGlobalFunctions = () => {
      if (typeof window !== 'undefined') {
        window.showAchievement = showAchievement;
        window.showMultipleAchievements = showMultipleAchievements;
        setIsReady(true);
        console.log('✅ Achievement notification system initialized');
        
        // Also provide debug info
        window.debugAchievementSystem = () => {
          console.log('Achievement System Debug Info:');
          console.log('- showAchievement available:', typeof window.showAchievement === 'function');
          console.log('- showMultipleAchievements available:', typeof window.showMultipleAchievements === 'function');
          console.log('- Current notifications:', notifications.length);
          console.log('- System ready:', isReady);
        };
        
        // Dispatch a custom event to signal the system is ready
        window.dispatchEvent(new CustomEvent('achievementSystemReady'));
      }
    };

    // Initial setup
    setupGlobalFunctions();

    // Retry setup after a short delay to ensure it's always available
    const retryTimer = setTimeout(setupGlobalFunctions, 100);
    
    // Additional retry for slower environments
    const laterRetryTimer = setTimeout(setupGlobalFunctions, 500);

    return () => {
      clearTimeout(retryTimer);
      clearTimeout(laterRetryTimer);
    };
  }, [showAchievement, showMultipleAchievements, notifications.length, isReady]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete window.showAchievement;
        delete window.showMultipleAchievements;
        delete window.debugAchievementSystem;
      }
    };
  }, []);

  return (
    <div className="achievement-notifications">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 100}px`, // Stack notifications vertically
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000 + index,
          }}
        >
          <AchievementNotification
            achievement={notification}
            show={notification.show}
            onClose={() => hideAchievement(notification.id)}
            duration={4000}
          />
        </div>
      ))}
    </div>
  );
}
