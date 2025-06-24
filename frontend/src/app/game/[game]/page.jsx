import { getCookie } from '@/app/lib/authCookie';
import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import GameClient from '@/app/ui/game/game-client';
export default async function GameMatch({ params }) {
  const { game } = await params;
  const authCookie = await getCookie();
  const level = authCookie.user.currentLevel;

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <GameClient game={game} level={level} />
    </div>
  );
}
