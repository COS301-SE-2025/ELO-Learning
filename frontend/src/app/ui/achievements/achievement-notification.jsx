// app/ui/achievements/achievement-notification.jsx
'use client';
import { useEffect, useState } from 'react';
import AchievementBadge from './achievement-badge';

export default function AchievementNotification({ 
  achievement, 
  show, 
  onClose,
  duration = 4000 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, achievement, duration, onClose]);

  if (!achievement || !show) return null;

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50
      transition-all duration-300 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
    `}>
      <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg border border-gray-700 min-w-[280px]">
        <div className="flex items-center gap-4">
          {/* Achievement badge */}
          <div className="flex-shrink-0">
            <AchievementBadge
              achievement={achievement}
              unlocked={true}
              size="small"
            />
          </div>
          
          {/* Achievement info */}
          <div className="flex-1">
            <div className="text-[#FF6E99] font-semibold text-sm uppercase">
              Achievement Unlocked!
            </div>
            <div className="font-bold text-white">
              {achievement.name}
            </div>
            <div className="text-gray-300 text-sm">
              {achievement.description}
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-3 w-full bg-gray-700 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-[#FF6E99] rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: isVisible ? '100%' : '0%',
              transitionDelay: '0.5s'
            }}
          />
        </div>
      </div>
    </div>
  );
}