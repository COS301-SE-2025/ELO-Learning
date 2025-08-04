'use client';

import clsx from 'clsx';
import { Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HeaderContent() {
  const [xp, setXp] = useState('0');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const getUserData = () => {
      try {
        // Try to get user data from cache first
        const cachedUser = cache.get(CACHE_KEYS.USER);
        if (cachedUser) {
          setXp(cachedUser.xp?.toString() || '0');
          setUsername(cachedUser.username || '');
          return;
        }

        // Fallback to cookie if cache misses
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };

        const encodedUserData = getCookie('userData') || getCookie('user');

        if (encodedUserData) {
          const decodedData = decodeURIComponent(encodedUserData);
          const userData = JSON.parse(decodedData);
          
          // Cache the user data for future use
          cache.set(CACHE_KEYS.USER, userData, CACHE_EXPIRY.LONG);
          
          setXp(userData.xp?.toString() || '0');
          setUsername(userData.username || '');
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        setXp('0');
      }
    };

    getUserData();
  }, []);

  return (
    <div className="w-full md:w-auto">
      <div
        className={clsx(
          'flex h-[48px] w-full items-start justify-center gap-6 rounded-md p-3 text-sm font-medium md:flex-col md:h-auto md:gap-4 md:justify-start md:p-2 md:px-5 md:w-auto',
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
          <p>{xp}xp</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <Gauge size={24} stroke="#309F04" />
          <p>75%</p>
        </div> */}
      </div>
    </div>
  );
}
