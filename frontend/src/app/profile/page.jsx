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
  const match = document.cookie.match(/user=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export default function Page() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUserFromCookie());
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
