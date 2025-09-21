'use client';
import GameClient from '@/app/ui/game/game-client';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function GameMatch() {
  const { game } = useParams();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    console.error('No session or user data found');
    redirect('/api/auth/signin');
  }

  const level = session.user.currentLevel || 5; // Default level if not set

  console.log('Game page rendering with:', {
    game,
    level,
    user: session.user.username,
  });

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <GameClient game={game} level={level} />
    </div>
  );
}
