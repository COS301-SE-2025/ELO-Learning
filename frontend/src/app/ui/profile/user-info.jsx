import { Gem, Trophy, Zap, Flame } from 'lucide-react';
export default function UserInfo({ elo, xp, ranking, streak }) {
  return (
    <div className="flex flex-row items-center justify-between my-10 mx-10 md:mx-50">
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-bold">ELO</h4>
        <Trophy size={34} stroke="#FF8000" fill="#FF8000" className="m-2" />
        <p>{elo}</p>
      </div>
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-bold">League</h4>
        <Gem size={34} stroke="#201F1F" fill="#50EEFF" className="m-2" />
        <p>{ranking}</p>
      </div>
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-bold">XP</h4>
        <Zap size={34} stroke="#FFCE0C" fill="#FFCE0C" className="m-2" />
        <p>{xp} xp</p>
      </div>
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-bold">Streak</h4>
        <Flame size={34} stroke="#FF4500" fill="#FF4500" className="m-2" />
        <p>{streak} days</p>
      </div>
    </div>
  );
}
