'use client';

import clsx from 'clsx';
import { Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function HeaderContent() {
  const { data: session, status } = useSession();
  const [xp, setXp] = useState('0');
  const [username, setUsername] = useState('');

  useEffect(() => {
    console.log('Session data:', session);
    console.log('Status:', status);
    if (status === 'authenticated' && session?.user) {
      // Use session data from NextAuth, prioritizing username over name
      setUsername(
        session.user.username ||
          session.user.name ||
          session.user.email ||
          'User'
      );

      // Use XP from session data
      setXp(session.user.xp?.toString() || '0');
    } else if (status === 'unauthenticated') {
      // Reset values when not authenticated
      setUsername('');
      setXp('0');
    }
  }, [session, status]);

  // Show loading state while session is being loaded
  if (status === 'loading') {
    return (
      <div className="w-full md:w-auto">
        <div
          className={clsx(
            'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto'
          )}
        >
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-auto">
      <div
        className={clsx(
          'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto'
        )}
      >
        {/* <div className="flex items-center gap-2">
          <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
          <p>5</p>
        </div> */}
        {/* <div className="flex items-center gap-2">
          <Flame size={24} fill="#FF8000" stroke="#FF8000" />
          <p>3</p>
        </div> */}
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold">{username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={24} fill="#4D5DED" stroke="#4D5DED" />
          <p>{Math.round(xp)}xp</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <Gauge size={24} stroke="#309F04" />
          <p>75%</p>
        </div> */}
      </div>
    </div>
  );
}
