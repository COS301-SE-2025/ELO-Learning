import { getCookie } from '@/app/lib/authCookie';
import GameClient from '@/app/ui/game/game-client';
import { redirect } from 'next/navigation';
import { ReactElement } from 'react';

interface GameMatchProps {
  params: Promise<{
    game: string;
  }>;
}

export default async function GameMatch({
  params,
}: GameMatchProps): Promise<ReactElement> {
  const { game } = await params;
  const authCookie = await getCookie();

  if (!authCookie.user) {
    redirect('/login');
    return <></>;
  }

  const level = authCookie.user.currentLevel;

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <GameClient game={game} level={level} />
    </div>
  );
}
