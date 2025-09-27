'use client';
import { fetchUserAchievementsWithStatus } from '@/services/api';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AchievementBadge from '../achievements/achievement-badge';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]); // Always start with empty array
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for session to load
    }

    if (status === 'authenticated' && session?.user?.id) {
      //  USE THE WORKING API FUNCTION
      fetchUserAchievementsWithStatus(session.user.id)
        .then((data) => {
          console.log('✅ Raw achievements data received:', data, typeof data);

          //  ROBUST DATA HANDLING: Always ensure we have an array
          let achievementsArray = [];

          if (Array.isArray(data)) {
            achievementsArray = data;
          } else if (data && Array.isArray(data.achievements)) {
            achievementsArray = data.achievements;
          } else if (data && typeof data === 'object') {
            // If data is an object but not an array, convert to empty array
            console.warn('⚠️ Achievements data is not an array:', data);
            achievementsArray = [];
          } else {
            // If data is null, undefined, or any other type
            console.warn('⚠️ No valid achievements data received:', data);
            achievementsArray = [];
          }

          console.log('✅ Setting achievements array:', achievementsArray);
          setAchievements(achievementsArray);
          setLoading(false);
        })
        .catch((error) => {
          console.error('❌ Failed to fetch achievements:', error);
          setAchievements([]); //  Always set empty array on error
          setLoading(false);
        });
    } else {
      console.log('ℹ️ No authenticated session, setting empty achievements');
      setAchievements([]); //  Always set empty array when not authenticated
      setLoading(false);
    }
  }, [session, status]);

  if (loading || status === 'loading') {
    return (
      <div className="m-4">
        <h3 className="text-xl uppercase font-bold">Achievements</h3>
        <div className="text-gray-400">Loading achievements...</div>
      </div>
    );
  }

  //  SAFETY CHECK: Ensure achievements is always an array before using .slice()
  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  console.log('✅ Safe achievements for rendering:', safeAchievements);

  //  FILTER FOR UNLOCKED ACHIEVEMENTS ONLY
  const unlockedAchievements = safeAchievements.filter(
    (achievement) => achievement.unlocked === true,
  );
  console.log('🏆 Unlocked achievements only:', unlockedAchievements);

  const displayAchievements = unlockedAchievements.slice(0, 3); // ✅ Show only unlocked
  const hasMoreAchievements = unlockedAchievements.length > 3;

  return (
    <div className="p-4 my-2" data-cy="achievements-section">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-2xl uppercase font-bold"
          data-cy="achievements-title"
        >
          ACHIEVEMENTS
        </h3>
        <Link
          href="/achievements"
          className="text-lg font-bold uppercase"
          style={{ color: '#FF6E99' }}
          data-cy="view-all-achievements"
        >
          VIEW ALL
        </Link>
      </div>

      {unlockedAchievements.length === 0 ? (
        <div className="rounded-xl p-4">
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 opacity-50">
                <svg viewBox="0 0 100 120" className="w-full h-full">
                  <path
                    d="M50 5 L20 20 L20 70 Q20 85 50 110 Q80 85 80 70 L80 20 Z"
                    fill="#4A5568"
                    stroke="#2D3748"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No achievements yet</p>
              <p className="text-gray-500 text-base">
                Start playing to earn badges!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="">
          <div
            className="grid grid-cols-3 gap-0 border border-gray-500 rounded-xl overflow-hidden"
            data-cy="achievement-progress"
          >
            {displayAchievements.map((achievement, index) => (
              <div
                className={`flex flex-col items-center py-6${
                  index < 2 ? ' border-r border-gray-500' : ''
                }`}
                key={achievement.id || index}
              >
                <AchievementBadge
                  achievement={achievement}
                  unlocked={achievement.unlocked}
                  size="large"
                  data-cy={`achievement-badge-${achievement.id || index}`}
                />
              </div>
            ))}
            {hasMoreAchievements && (
              <Link
                href="/achievements"
                className="flex flex-col items-center py-6"
                data-cy="more-achievements"
              ></Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
