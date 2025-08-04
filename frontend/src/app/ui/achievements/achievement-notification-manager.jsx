// app/ui/achievements/achievement-notification-manager.jsx
'use client';
import { useState, useCallback } from 'react';
import AchievementNotification from './achievement-notification';

export default function AchievementNotificationManager() {
  const [notifications, setNotifications] = useState([]);

  const showAchievement = useCallback((achievement) => {
    const id = Date.now() + Math.random(); // Unique ID
    const newNotification = { ...achievement, id, show: true };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const hideAchievement = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showMultipleAchievements = useCallback((achievements) => {
    if (!achievements || achievements.length === 0) return;
    
    // Show achievements one by one with staggered timing
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        showAchievement(achievement);
      }, index * 1000); // 1 second delay between each
    });
  }, [showAchievement]);

  // Expose functions globally so they can be called from anywhere
  if (typeof window !== 'undefined') {
    window.showAchievement = showAchievement;
    window.showMultipleAchievements = showMultipleAchievements;
  }

  return (
    <div className="achievement-notifications">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            position: 'fixed',
            top: `${20 + (index * 100)}px`, // Stack notifications vertically
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