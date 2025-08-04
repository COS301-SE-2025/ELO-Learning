'use client';
import Picture from '@/app/ui/profile/picture-block';
import { Cog } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Achievements from '../ui/profile/achievements';
import MatchStats from '../ui/profile/match-stats';
import UserInfo from '../ui/profile/user-info';
import UsernameBlock from '../ui/profile/username-block';

export default function Page() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated')
    return <div>Please sign in to view your profile.</div>;
  if (!session?.user) return <div>No user data available.</div>;

  const user = session.user;

  return (
    <div className="h-full">
      <div className="bg-[#FF6E99] flex items-center justify-between px-4">
        <div className="flex-1"></div>
        <div className="flex-2 flex justify-center">
          <Picture src={user.pfpURL || '/user.svg'} />
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
          date_joined={
            user.joinDate
              ? new Date(user.joinDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'N/A'
          }
        />
      </div>
      <div className="flex flex-col justify-between">
        <UserInfo ranking="1st" xp={user.xp || 0} />
        <MatchStats />
        <Achievements />
      </div>
    </div>
  );
}
