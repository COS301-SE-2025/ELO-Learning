'use client';

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

  // Function to migrate old avatar format to new format
  const migrateAvatar = (savedAvatar) => {
    const migratedAvatar = { ...DEFAULT_AVATAR, ...savedAvatar };

    // Migrate old eye types to new format
    const oldEyeTypes = [
      'round',
      'sleepy',
      'wink',
      'happy',
      'surprised',
      'glasses',
    ];
    if (oldEyeTypes.includes(savedAvatar.eyes)) {
      migratedAvatar.eyes = EyeTypes.EYE_1; // Default to Eye 1 for old eye types
    }

    // Migrate old mouth types to new format
    const oldMouthTypes = [
      'smile',
      'neutral',
      'frown',
      'surprised',
      'tongue',
      'laugh',
    ];
    if (oldMouthTypes.includes(savedAvatar.mouth)) {
      migratedAvatar.mouth = MouthTypes.MOUTH_1; // Default to Mouth 1 for old mouth types
    }

    // Migrate old shape types to new format
    const oldShapeTypes = ['round', 'square', 'oval', 'triangle'];
    if (oldShapeTypes.includes(savedAvatar.bodyShape)) {
      migratedAvatar.bodyShape = BodyShapes.CIRCLE; // Default to Circle for old shape types
    }

    return migratedAvatar;
  };

  // Load avatar from localStorage on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      try {
        const parsedAvatar = JSON.parse(savedAvatar);
        const migratedAvatar = migrateAvatar(parsedAvatar);
        setAvatar(migratedAvatar);

        // Save the migrated avatar back to localStorage
        localStorage.setItem('userAvatar', JSON.stringify(migratedAvatar));
      } catch (error) {
        console.error('Error loading saved avatar:', error);
        setAvatar(DEFAULT_AVATAR);
      }
    }
  }, []);

  // Save avatar to localStorage whenever it changes
  const updateAvatar = (newAvatar) => {
    setAvatar(newAvatar);
    localStorage.setItem('userAvatar', JSON.stringify(newAvatar));
  };

  const resetAvatar = () => {
    setAvatar(DEFAULT_AVATAR);
    localStorage.removeItem('userAvatar');
  };

  return (
    <AvatarContext.Provider
      value={{
        avatar,
        updateAvatar,
        resetAvatar,
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
