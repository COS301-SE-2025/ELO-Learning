import { getCookie } from '@/app/lib/authCookie';
import GameClient from '@/app/ui/game/game-client';

export default async function GameMatch({ params }) {
  try {
    const { game } = await params;
    const authCookie = await getCookie();

    // Add some fallback values and error checking
    if (!authCookie || !authCookie.user) {
      console.error('No auth cookie or user data found');
      // You might want to redirect to login here
      return <div>Authentication error. Please log in again.</div>;
    }

    const level = authCookie.user.currentLevel || 5; // Default level if not set

    console.log('Game page rendering with:', {
      game,
      level,
      user: authCookie.user.username,
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
