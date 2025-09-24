// Lock indicator component for locked avatar items
'use client';

import { Lock } from 'lucide-react';

export function LockIndicator({
  isLocked = false,
  achievement = null,
  progress = 0,
  className = '',
  size = 'normal',
}) {
  if (!isLocked) return null;

  const sizeClasses = {
    small: 'w-4 h-4',
    normal: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg ${className}`}
    >
      <div className="flex flex-col items-center text-center p-2">
        <Lock className={`text-gray-300 mb-1 ${sizeClasses[size]}`} />
        {achievement && (
          <div className="text-xs text-gray-300">
            <div className="font-semibold truncate max-w-20">
              {achievement.name}
            </div>
            {progress > 0 && <div className="text-gray-400">{progress}%</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProgressIndicator({ progress = 0, className = '' }) {
  if (progress <= 0) return null;

  return (
    <div className={`absolute bottom-1 left-1 right-1 ${className}`}>
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
