'use client';
import ClickableAvatar from '@/app/ui/profile/clickable-avatar';
import { Cog } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useAvatar } from '../context/avatar-context';
import { BackgroundTypes } from '../ui/avatar/background';
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

  // Convert background type to actual style
  const getBackgroundStyle = (backgroundType) => {
    const backgroundStyles = {
      [BackgroundTypes.SOLID_PINK]: { backgroundColor: '#FFB6C1' },
      [BackgroundTypes.SOLID_BLUE]: { backgroundColor: '#87CEEB' },
      [BackgroundTypes.SOLID_GREEN]: { backgroundColor: '#98FB98' },
      [BackgroundTypes.SOLID_PURPLE]: { backgroundColor: '#DDA0DD' },
      [BackgroundTypes.GRADIENT_SUNSET]: {
        background:
          'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      },
      [BackgroundTypes.GRADIENT_OCEAN]: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      [BackgroundTypes.GRADIENT_FOREST]: {
        background: 'linear-gradient(135deg, #c3ec52 0%, #0ba360 100%)',
      },
      [BackgroundTypes.GRADIENT_PURPLE]: {
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      },
    };

    return backgroundStyles[backgroundType] || { backgroundColor: '#FF6E99' };
  };

  return (
    <div className="h-full">
      <div
        className="flex items-center justify-between px-4"
        style={getBackgroundStyle(avatar?.background)}
      >
        <div className="flex-1"></div>
        <div className="flex-2 flex justify-center">
          <ClickableAvatar avatar={avatar} />
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
