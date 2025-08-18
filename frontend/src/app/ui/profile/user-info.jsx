import { Gem, Trophy, Zap } from 'lucide-react';
export default function UserInfo({ elo, xp, ranking }) {
  return (
    <div className="flex flex-row items-center justify-between m-10 md:mx-50">
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-bold">ELO Rating</h4>
        <Trophy size={34} stroke="#FF8000" fill="#FF8000" className="m-2" />
        <p>{elo}</p>
      </div>
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-bold">League</h4>
        <Gem size={34} stroke="#201F1F" fill="#50EEFF" className="m-2" />
        <p>{ranking}</p>
      </div>
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-bold">Total XP</h4>
        <Zap size={34} stroke="#FFCE0C" fill="#FFCE0C" className="m-2" />
        <p>{xp} xp</p>
      </div>
    </div>
  );
}
