'use client';

import { updateUserAvatar } from '@/services/api';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { defaultColors } from '../ui/avatar/avatar-colors';
import { BodyShapes } from '../ui/avatar/body-shape';
import { EyeTypes } from '../ui/avatar/eyes';
import { GlassesTypes } from '../ui/avatar/glasses';
import { HatTypes } from '../ui/avatar/hats';
import { MoustacheTypes } from '../ui/avatar/moustache';
import { MouthTypes } from '../ui/avatar/mouth';

const AvatarContext = createContext();

const DEFAULT_AVATAR = {
  bodyShape: BodyShapes.SQUARE,
  color: defaultColors.avatar,
  eyes: EyeTypes.EYE_1,
  mouth: MouthTypes.MOUTH_1,
  moustache: MoustacheTypes.NOTHING,
  glasses: GlassesTypes.NOTHING,
  hat: HatTypes.NOTHING,
  background: 'solid-3', // This corresponds to the blue color #4d5ded (index 3 in avatarColors)
};

export function AvatarProvider({ children }) {
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const { data: session, status, update } = useSession();

  // Update avatar when session changes
  useEffect(() => {
    if (session?.user?.avatar) {
      setAvatar(session.user.avatar);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.avatar) {
      setAvatar(session.user.avatar);
    }
  }, []);

  // Save avatar to localStorage whenever it changes
  const updateAvatar = async (userID, newAvatar) => {
    setAvatar(newAvatar);
    localStorage.setItem('userAvatar', JSON.stringify(newAvatar));

    const res = await updateUserAvatar(userID, newAvatar);
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
