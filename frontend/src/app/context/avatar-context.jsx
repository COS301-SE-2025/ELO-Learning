'use client';

import { updateUserAvatar } from '@/services/api';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { BackgroundTypes } from '../ui/avatar/background';
import { BodyShapes } from '../ui/avatar/body-shape';
import { AvatarColors } from '../ui/avatar/color';
import { EyeTypes } from '../ui/avatar/eyes';
import { MouthTypes } from '../ui/avatar/mouth';
const AvatarContext = createContext();

const DEFAULT_AVATAR = {
  bodyShape: BodyShapes.CIRCLE,
  color: AvatarColors.BRIGHT_RED,
  eyes: EyeTypes.EYE_1,
  mouth: MouthTypes.MOUTH_1,
  background: BackgroundTypes.SOLID_PINK,
};

export function AvatarProvider({ children }) {
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const { data: session, status, update } = useSession();

  // Update avatar when session changes
  useEffect(() => {
    console.log('Session changed:', session);
    if (session?.user?.avatar) {
      console.log('Loading avatar from session:', session.user.avatar);
      setAvatar(session.user.avatar);
    }
  }, [session]);

  // Save avatar to localStorage whenever it changes
  const updateAvatar = async (userID, newAvatar) => {
    setAvatar(newAvatar);
    localStorage.setItem('userAvatar', JSON.stringify(newAvatar));

    const res = await updateUserAvatar(userID, newAvatar);
    console.log('Updating session with new avatar');
    update({
      user: {
        ...session.user,
        avatar: newAvatar,
      },
    });
  };

  // const resetAvatar = () => {
  //   setAvatar(DEFAULT_AVATAR);
  //   localStorage.removeItem('userAvatar');
  // };

  return (
    <AvatarContext.Provider
      value={{
        avatar,
        updateAvatar,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
}
