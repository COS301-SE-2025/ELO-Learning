// app/achievements/[id]/page.jsx
'use client';
import { fetchUserAchievementsWithStatus } from '@/services/api';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import AchievementBadge from '../../ui/achievements/achievement-badge';

function getUserFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/user=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export default function AchievementDetailPage({ params }) {
  const [achievement, setAchievement] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    const userData = getUserFromCookie();
    setUser(userData);

    if (userData?.id) {
      fetchUserAchievementsWithStatus(userData.id)
        .then((data) => {
          const foundAchievement = data.find((a) => a.id === parseInt(id));
          setAchievement(foundAchievement);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch achievement:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getProgressText = () => {
    if (achievement.unlocked) {
      return achievement.description;
    }

    return achievement.description; // Show the actual requirement description
  };

  if (loading) {
    return (
      <div
        className="h-screen text-white flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div>Loading achievement...</div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div
        className="h-screen text-white flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div>Achievement not found</div>
      </div>
    );
  }

  return (
    <div
      className="h-screen text-white overflow-y-auto"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4"
        style={{ background: 'var(--background)' }}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <X size={24} />
          </button>
          <h1 className="text-lg font-semibold">
            {achievement.unlocked ? 'Achievement' : 'Achievement Not Received'}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12 text-center flex flex-col items-center justify-center min-h-[80vh]">
        {/* Large achievement badge */}
        <div className="mb-8">
          <div className="w-32 h-40">
            <AchievementBadge
              achievement={achievement}
              unlocked={achievement.unlocked}
              progress={achievement.current_progress}
              size="large"
            />
          </div>
        </div>

        {/* Achievement details */}
        <div className="space-y-6 max-w-sm">
          {achievement.unlocked && formatDate(achievement.unlocked_at) && (
            <div className="text-gray-300 text-base">
              {formatDate(achievement.unlocked_at)}
            </div>
          )}

          <div className="text-center">
            <p className="text-white text-lg leading-relaxed">
              {getProgressText()}
            </p>
          </div>

          {/* Progress bar for locked achievements */}
          {!achievement.unlocked && achievement.current_progress >= 0 && (
            <div className="w-full space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (achievement.current_progress /
                        achievement.condition_value) *
                        100,
                    )}%`,
                    background: 'var(--radical-rose)',
                  }}
                />
              </div>
              <div className="text-right text-sm text-gray-400">
                {achievement.current_progress}/{achievement.condition_value}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
