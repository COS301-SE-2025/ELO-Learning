'use client';

import { useAvatarUnlockables } from '@/hooks/useAvatarUnlockables';
import Image from 'next/image';
import { LockIndicator, ProgressIndicator } from './lock-indicator';

export const GlassesTypes = {
  NOTHING: 'Nothing',
  GLASSES_1: 'Glasses 1',
  GLASSES_2: 'Glasses 2',
  GLASSES_3: 'Glasses 3',
  GLASSES_4: 'Glasses 4',
  GLASSES_5: 'Glasses 5',
  GLASSES_6: 'Glasses 6',
  GLASSES_7: 'Glasses 7',
  GLASSES_8: 'Glasses 8',
  GLASSES_9: 'Glasses 9',
  GLASSES_10: 'Glasses 10',
};

export function GlassesSelector({ selectedGlasses, onGlassesChange }) {
  const { isItemUnlocked, getLockedItemInfo, loading } = useAvatarUnlockables();

  const glasses = Object.entries(GlassesTypes).map(([key, value]) => ({
    id: value,
    name: key === 'NOTHING' ? 'No Glasses' : value,
    key: key, // NOTHING, GLASSES_1, etc.
    src: key === 'NOTHING' ? null : `/shapes/glasses/${value}.svg`,
    isNothing: key === 'NOTHING',
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Glasses</h3>
        <div className="text-gray-400">Loading glasses options...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Glasses</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {glasses.map((glassesItem) => {
          // "Nothing" is always unlocked
          const isUnlocked =
            glassesItem.isNothing || isItemUnlocked(glassesItem.key);
          const lockedInfo = glassesItem.isNothing
            ? null
            : getLockedItemInfo(glassesItem.key);

          return (
            <button
              key={glassesItem.id}
              onClick={() => isUnlocked && onGlassesChange(glassesItem.id)}
              disabled={!isUnlocked}
              className={`p-3 rounded-lg border-2 transition-all aspect-square relative ${
                selectedGlasses === glassesItem.id && isUnlocked
                  ? 'border-[#4d5ded] bg-[#201F1F] bg-opacity-20'
                  : isUnlocked
                    ? 'border-gray-600 bg-gray-700 hover:border-[#4d5ded] hover:cursor-pointer'
                    : 'border-gray-700 bg-gray-800 cursor-not-allowed opacity-75'
              }`}
              title={
                !isUnlocked
                  ? `Unlock by completing: ${
                      lockedInfo?.achievementName || 'Achievement'
                    }`
                  : glassesItem.name
              }
            >
              <div className="w-full h-20 relative mb-2 flex items-center justify-center">
                {glassesItem.isNothing ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-2xl text-gray-400">✕</span>
                  </div>
                ) : (
                  <Image
                    src={glassesItem.src}
                    alt={glassesItem.name}
                    fill
                    className={`object-contain transition-all ${
                      !isUnlocked ? 'grayscale opacity-50' : ''
                    }`}
                    priority
                  />
                )}
              </div>

              {/* Lock overlay for locked items */}
              <LockIndicator
                isLocked={!isUnlocked}
                achievement={lockedInfo}
                progress={lockedInfo?.progressPercentage}
                size="small"
              />

              {/* Progress indicator for partially completed achievements */}
              {!isUnlocked && lockedInfo?.progressPercentage > 0 && (
                <ProgressIndicator progress={lockedInfo.progressPercentage} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AvatarGlasses({ glassesType, className = '' }) {
  // Don't render anything if no glasses are selected or "Nothing" is selected
  if (!glassesType || glassesType === GlassesTypes.NOTHING) {
    return null;
  }

  // Check if it's a valid glasses type
  const validGlassesType = Object.values(GlassesTypes).includes(glassesType)
    ? glassesType
    : null;

  if (!validGlassesType) {
    return null;
  }

  const glassesSrc = `/shapes/glasses/${validGlassesType}.svg`;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="w-full h-full relative">
        <Image
          src={glassesSrc}
          alt={`${validGlassesType} glasses`}
          fill
          className="object-contain"
          priority
          onError={(e) => {
            console.error('Failed to load glasses image:', glassesSrc);
          }}
        />
      </div>
    </div>
  );
}
