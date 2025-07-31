'use client';
import Picture from '@/app/ui/profile/picture-block';
import { Cog } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Achievements from '../ui/profile/achievements';
import MatchStats from '../ui/profile/match-stats';
import UserInfo from '../ui/profile/user-info';
import UsernameBlock from '../ui/profile/username-block';

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

export default function Page() {
  const [user, setUser] = useState(null);

  // In app/profile/page.jsx, update the useEffect:
  useEffect(() => {
    const loadUserData = () => {
      const userData = getUserFromCookie();
      setUser(userData);
    };

    // Load initially
    loadUserData();

    // Refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="h-full">
      <div className="bg-[#FF6E99] flex items-center justify-between px-4">
        <div className="flex-1"></div>
        <div className="flex-2 flex justify-center">
          <Picture src={user.pfpURL} />
        </div>
        <div className="flex-1 flex justify-center">
          <Link href="settings">
            <Cog stroke="black" size={40} />
          </Link>
        </div>
      </div>
      <div>
        <UsernameBlock
          username={user.username}
          name={user.name}
          surname={user.surname}
          date_joined={new Date(user.joinDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        />
      </div>
      <div className="flex flex-col justify-between">
        <UserInfo ranking="1st" xp={user.xp} />
        <MatchStats />
        <Achievements />
      </div>
    </div>
  );
}
