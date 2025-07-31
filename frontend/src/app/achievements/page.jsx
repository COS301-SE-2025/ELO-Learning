'use client';
import { fetchUserAchievementsWithStatus } from '@/services/api';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AchievementBadge from '../ui/achievements/achievement-badge';

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
export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const router = useRouter();

  useEffect(() => {
    const userData = getUserFromCookie();
    setUser(userData);

    if (userData?.id) {
      fetchUserAchievementsWithStatus(userData.id)
        .then((data) => {
          // Group achievements by category
          const grouped = data.reduce((acc, achievement) => {
            const category = achievement.AchievementCategories?.name || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(achievement);
            return acc;
          }, {});
          setAchievements(grouped);
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

  const handleAchievementClick = (achievement) => {
    router.push(`/achievements/${achievement.id}`);
  };

  const closeModal = () => {
    setSelectedAchievement(null);
  };

  const getFilteredAchievements = (categoryAchievements) => {
    if (filter === 'unlocked')
      return categoryAchievements.filter((a) => a.unlocked);
    if (filter === 'locked')
      return categoryAchievements.filter((a) => !a.unlocked);
    return categoryAchievements;
  };

  if (loading) {
    return (
      <div
        className="h-screen text-white flex items-center justify-center"
        style={{ background: 'var(--background)' }}
      >
        <div>Loading achievements...</div>
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
        className="sticky top-0 z-10 px-4 py-4 border-b border-gray-700"
        style={{ background: 'var(--background)' }}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Achievements</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mt-4">
          {['all', 'unlocked', 'locked'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${
                filter === filterType
                  ? 'bg-[#FF6E99] text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold mb-6 uppercase">Awards</h2>

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
                    <h3 className="text-lg font-semibold mb-4 text-gray-300 uppercase">
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
