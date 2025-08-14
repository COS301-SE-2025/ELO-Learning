// FIXED header-content.jsx
'use client';

import clsx from 'clsx';
import { Shield } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useSession } from 'next-auth/react'; // ← CHANGED: Use NextAuth directly

const HeaderContent = memo(function HeaderContent() {
  const { data: session, status } = useSession(); // ← SIMPLIFIED: Just use NextAuth

  // Memoize user data processing
  const userData = useMemo(() => {
    if (status !== 'authenticated' || !session?.user) {
      return null;
    }

    return {
      username: session.user.username || session.user.name || session.user.email?.split('@')[0] || 'User',
      xp: Math.round(session.user.xp || 0),
    };
  }, [session, status]);

  // Show loading state while session is being loaded
  if (status === 'loading') {
    return (
      <div className="w-full md:w-auto">
        <div
          className={clsx(
            'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={24} fill="#4D5DED" stroke="#4D5DED" />
            <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (status !== 'authenticated' || !userData) {
    return null;
  }

  return (
    <div className="w-full md:w-auto">
      <div
        className={clsx(
          'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto',
        )}
      >
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold">{userData.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={24} fill="#4D5DED" stroke="#4D5DED" />
          <p>{userData.xp}xp</p>
        </div>
      </div>
    </div>
  );
});

export default HeaderContent;