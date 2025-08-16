// app/ui/achievements/achievement-notification-manager.jsx
'use client';
import { useCallback, useEffect, useState } from 'react';
import AchievementNotification from './achievement-notification';

export default function AchievementNotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const showAchievement = useCallback((achievement) => {
    // Create truly unique IDs
    const uniqueId = `achievement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { 
      ...achievement, 
      id: uniqueId, // Use the unique ID instead of achievement.id
      show: true,
      timestamp: Date.now() // Add timestamp for additional uniqueness
    };

    console.log('🏆 Adding notification with unique ID:', uniqueId);
    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const hideAchievement = useCallback((id) => {
    console.log('🏆 Hiding notification with ID:', id);
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const showMultipleAchievements = useCallback(
    (achievements) => {
      if (!achievements || achievements.length === 0) {
        console.log('🏆 No achievements to show');
        return;
      }

      console.log(`🏆 Showing ${achievements.length} achievements with staggered timing`);
      
      // Show achievements one by one with staggered timing
      achievements.forEach((achievement, index) => {
        setTimeout(() => {
          showAchievement(achievement);
        }, index * 1500);
      });
    },
    [showAchievement],
  );

  // Set up global achievement functions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showAchievement = showAchievement;
      window.showMultipleAchievements = showMultipleAchievements;

      setIsReady(true);

      // Dispatch ready event
      const dispatchReady = () => {
        window.dispatchEvent(new CustomEvent('achievementSystemReady'));
      };

      dispatchReady();
      setTimeout(dispatchReady, 100);
      setTimeout(dispatchReady, 500);

      console.log('🏆 Achievement notification system ready');
    }
  }, [showAchievement, showMultipleAchievements]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete window.showAchievement;
        delete window.showMultipleAchievements;
        console.log('🏆 Achievement notification system cleaned up');
      }
    };
  }, []);

  return (
    <div className="achievement-notifications" role="region" aria-label="Achievement notifications">
      {notifications.map((notification, index) => (
        <div
          key={notification.id} // Now using truly unique IDs
          style={{
            position: 'fixed',
            top: `${20 + index * 120}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000 + index,
          }}
        >
          <AchievementNotification
            achievement={notification}
            show={notification.show}
            onClose={() => hideAchievement(notification.id)}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
}