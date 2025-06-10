import clsx from 'clsx';
import { Flame, Gauge, Heart, Shield } from 'lucide-react';

export default function HeaderContent() {
  return (
    <div className="w-full md:w-auto">
      <div
        className={clsx(
          'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto',
        )}
      >
        <div className="flex items-center gap-2">
          <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
          <p>5</p>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={24} fill="#FF8000" stroke="#FF8000" />
          <p>3</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={24} fill="#4D5DED" stroke="#4D5DED" />
          <p>300xp</p>
        </div>
        <div className="flex items-center gap-2">
          <Gauge size={24} stroke="#309F04" />
          <p>75%</p>
        </div>
      </div>
    </div>
  );
}
