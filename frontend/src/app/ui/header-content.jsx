import clsx from 'clsx';
import { Flame, Gauge, Heart, Shield } from 'lucide-react';

export default function HeaderContent() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white flex flex-col px-3 py-4 md:static md:h-full md:w-auto md:px-2">
      <div
        className={clsx(
          'flex h-[48px] grow items-center justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3',
        )}
      >
        <div className="flex items-center gap-2">
          <Heart size={24} />
          <p>5</p>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={24} />
          <p>3</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={24} />
          <p>300xp</p>
        </div>
        <div className="flex items-center gap-2">
          <Gauge size={24} />
          <p>75%</p>
        </div>
      </div>
    </div>
  );
}
