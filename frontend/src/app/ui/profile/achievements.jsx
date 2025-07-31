// app/ui/profile/achievements.jsx
'use client';
import { fetchUserAchievements } from '@/services/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AchievementBadge from '../achievements/achievement-badge';

function getUserFromCookie() {
  if (typeof document === 'undefined') return null;

  // FIRST: Check localStorage (where API updates go)
  try {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      const parsedUser = JSON.parse(localUser);
      console.log('📱 Found user in localStorage:', parsedUser);
      return parsedUser;
    }
  } catch (e) {
    console.error('Error parsing localStorage user:', e);
  }

  // FALLBACK: Check cookies
  const match = document.cookie.match(/user=([^;]+)/);
  if (!match) {
    console.log('❌ No user found in cookies or localStorage');
    return null;
  }

  try {
    const cookieUser = JSON.parse(decodeURIComponent(match[1]));
    console.log('🍪 Found user in cookies:', cookieUser);
    return cookieUser;
  } catch {
    console.log('❌ Error parsing cookie user data');
    return null;
  }
}

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = getUserFromCookie();
    setUser(userData);

    if (userData?.id) {
      fetchUserAchievements(userData.id)
        .then((data) => {
          setAchievements(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch achievements:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="m-4">
        <h3 className="text-xl uppercase font-bold">Achievements</h3>
        <div className="text-gray-400">Loading achievements...</div>
      </div>
    );
  }

  const displayAchievements = achievements.slice(0, 3); // Show only first 3 in profile
  const hasMoreAchievements = achievements.length > 3;

  return (
    <div className="m-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl uppercase font-bold">Achievements</h3>
        <Link
          href="/achievements"
          className="text-sm font-medium uppercase"
          style={{ color: '#FF6E99' }}
        >
          VIEW ALL
        </Link>
      </div>

      {achievements.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
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
              <p className="text-gray-400 text-sm">No achievements yet</p>
              <p className="text-gray-500 text-xs">
                Start playing to earn badges!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex gap-4 justify-center">
            {displayAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.achievement_id}
                achievement={achievement.Achievements}
                unlocked={true}
                size="small"
              />
            ))}
            {hasMoreAchievements && (
              <Link href="/achievements" className="flex items-center">
                <div className="w-16 h-20 flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg">
                  <span className="text-gray-400 text-xs">
                    +{achievements.length - 3}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
