import Picture from '@/app/ui/profile/picture-block';
import { Cog } from 'lucide-react';
import Achievements from '../ui/profile/achievements';
import MatchStats from '../ui/profile/match-stats';
import UserInfo from '../ui/profile/user-info';
import UsernameBlock from '../ui/profile/username-block';

export default function Page() {
  return (
    <div>
      <div className="bg-[#FF6E99] flex items-center justify-between px-4">
        <div className="flex-1"></div>
        <div className="flex-1 flex justify-center">
          <Picture />
        </div>
        <div className="flex-1 flex justify-end mr-10 md:mr-20">
          <Cog stroke="black" size={40} />
        </div>
      </div>
      <div>
        <UsernameBlock
          username="Lady Yapsalot"
          name="Saskia"
          surname="Steyn"
          date_joined="6 August 1998"
        />
      </div>
      <div>
        <UserInfo ranking="1st" xp={1000} />
        <MatchStats />
        <Achievements />
      </div>
    </div>
  );
}
