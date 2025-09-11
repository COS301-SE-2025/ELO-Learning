'use client';
import { fetchUserAchievementsWithStatus } from '@/services/api';
import {
  initializeAchievementTracking,
  preventLoginNotifications,
} from '@/utils/gameplayAchievementHandler';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Back from '../ui/back';

import AchievementBadge from '../ui/achievements/achievement-badge';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for session to load
    }

    if (status === 'authenticated' && session?.user?.id) {
      // Initialize achievement tracking for this user (no notifications)
      initializeAchievementTracking(session.user.id);

      fetchUserAchievementsWithStatus(session.user.id)
        .then((data) => {
          console.log('✅ Fetched achievements data for viewing');

          // Prevent any existing achievements from showing notifications
          preventLoginNotifications(data, session.user.id);

          // Group achievements by category
          const grouped = data.reduce((acc, achievement) => {
            const category = achievement.AchievementCategories?.name || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(achievement);
            return acc;
          }, {});

          setAchievements(grouped);
          setLoading(false);

          // NOTE: No notifications on achievements page - this is for viewing only
          // Notifications only appear during gameplay when achievements are earned
        })
        .catch((error) => {
          console.error('Failed to fetch achievements:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session, status]);

  const handleAchievementClick = (achievement) => {
    router.push(`/achievements/${achievement.id}`);
  };

  const getFilteredAchievements = (categoryAchievements) => {
    if (filter === 'unlocked')
      return categoryAchievements.filter((a) => a.unlocked);
    if (filter === 'locked')
      return categoryAchievements.filter((a) => !a.unlocked);
    return categoryAchievements;
  };

  if (loading || status === 'loading') {
    return (
      <div
        className="h-screen text-[var(--color-foreground)] flex items-center justify-center"
        style={{ background: 'var(--color-background)' }}
      >
        <div>Loading achievements...</div>
      </div>
    );
  }

  return (
    <div
      className="h-screen text-[var(--color-foreground)] overflow-y-auto"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4 border-b border-gray-700"
        style={{ background: 'var(--color-background)' }}
      >
        <Back pagename="Achievements" />

        {/* Filter buttons */}
        <div className="flex gap-2 mt-4">
          {['all', 'unlocked', 'locked'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${
                filter === filterType
                  ? 'bg-[var(--radical-rose)] text-[var(--color-foreground)]'
                  : 'bg-[var(--vector-violet-light)] text-black'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold mb-6 uppercase text-center">
          Awards
        </h2>

        {Object.keys(achievements).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400">No achievements found</div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(achievements).map(
              ([category, categoryAchievements]) => {
                const filteredAchievements =
                  getFilteredAchievements(categoryAchievements);

                if (filteredAchievements.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-lg font-bold mb-4 text-[var(--color-foreground)] text-center">
                      {category}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {filteredAchievements.map((achievement) => (
                        <AchievementBadge
                          key={achievement.id}
                          achievement={achievement}
                          unlocked={achievement.unlocked}
                          progress={achievement.current_progress}
                          showProgress={!achievement.unlocked}
                          onClick={() => handleAchievementClick(achievement)}
                        />
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}
