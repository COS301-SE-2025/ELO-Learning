import GameClient from '@/app/ui/game/game-client';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function GameMatch({ params }) {
  try {
    const { game } = await params;
    const session = await getServerSession(authOptions);

    // Add some fallback values and error checking
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
  } catch (error) {
    console.error('Error in game page:', error);
    return <div>Error loading game. Please try again.</div>;
  }
}
