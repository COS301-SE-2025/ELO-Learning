'use client';
import ClickableAvatar from '@/app/ui/profile/clickable-avatar';
import { Cog } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useAvatar } from '../context/avatar-context';
import { gradients } from '../ui/avatar/avatar-colors';
import { AvatarColors } from '../ui/avatar/color';
import Achievements from '../ui/profile/achievements';
import MatchStats from '../ui/profile/match-stats';
import UserInfo from '../ui/profile/user-info';
import UsernameBlock from '../ui/profile/username-block';

export default function Page() {
  const { data: session, status } = useSession();
  const { avatar } = useAvatar();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated')
    return <div>Please sign in to view your profile.</div>;
  if (!session?.user) return <div>No user data available.</div>;

  const user = session.user;

  const getBackgroundStyle = (backgroundType) => {
    let style = { backgroundColor: '#421e68' };
    if (backgroundType && backgroundType.startsWith('solid-')) {
      const idx = parseInt(backgroundType.split('-')[1], 10);
      style = { backgroundColor: AvatarColors[idx] || '#421e68' };
    } else if (backgroundType && backgroundType.startsWith('gradient-')) {
      const idx = parseInt(backgroundType.split('-')[1], 10);
      const g = gradients[idx];
      if (g) {
        style = {
          background: `linear-gradient(135deg, ${g.colors.join(', ')})`,
        };
      }
    }
    return style;
  };

  return (
    <div className="h-full">
      <div
        className="flex items-center justify-between px-4"
        style={getBackgroundStyle(avatar?.background)}
      >
        <div className="flex-1"></div>
        <div className="flex-2 flex justify-center">
          <ClickableAvatar avatar={{ ...avatar, background: 'transparent' }} />
        </div>
        <div className="flex-1 flex justify-center">
          <Link
            href="settings"
            className="transition-transform hover:scale-105 active:scale-95"
          >
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
