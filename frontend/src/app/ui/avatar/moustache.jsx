'use client';

import { useAvatarUnlockables } from '@/hooks/useAvatarUnlockables';
import Image from 'next/image';
import { LockIndicator, ProgressIndicator } from './lock-indicator';

export const MoustacheTypes = {
  NOTHING: 'Nothing',
  MOUSTACHE_1: 'Moustache 1',
  MOUSTACHE_2: 'Moustache 2',
  MOUSTACHE_3: 'Moustache 3',
  MOUSTACHE_4: 'Moustache 4',
  MOUSTACHE_5: 'Moustache 5',
  MOUSTACHE_6: 'Moustache 6',
  MOUSTACHE_7: 'Moustache 7',
  MOUSTACHE_8: 'Moustache 8',
  MOUSTACHE_9: 'Moustache 9',
};

export function MoustacheSelector({ selectedMoustache, onMoustacheChange }) {
  const { isItemUnlocked, getLockedItemInfo, loading } = useAvatarUnlockables();

  const moustaches = Object.entries(MoustacheTypes).map(([key, value]) => ({
    id: value,
    name: key === 'NOTHING' ? 'No Moustache' : value,
    key: key, // NOTHING, MOUSTACHE_1, etc.
    src: key === 'NOTHING' ? null : `/shapes/moustache/${value}.svg`,
    isNothing: key === 'NOTHING',
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Moustache</h3>
        <div className="text-gray-400">Loading moustache options...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Moustache</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {moustaches.map((moustache) => {
          // "Nothing" is always unlocked
          const isUnlocked =
            moustache.isNothing || isItemUnlocked(moustache.key);
          const lockedInfo = moustache.isNothing
            ? null
            : getLockedItemInfo(moustache.key);

          return (
            <button
              key={moustache.id}
              onClick={() => isUnlocked && onMoustacheChange(moustache.id)}
              disabled={!isUnlocked}
              className={`p-3 rounded-lg border-2 transition-all aspect-square relative ${
                selectedMoustache === moustache.id && isUnlocked
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
                  : moustache.name
              }
            >
              <div className="w-full h-20 relative mb-2 flex items-center justify-center">
                {moustache.isNothing ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-2xl text-gray-400">✕</span>
                  </div>
                ) : (
                  <Image
                    src={moustache.src}
                    alt={moustache.name}
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

export function AvatarMoustache({ moustacheType, className = '' }) {
  // Don't render anything if no moustache is selected or "Nothing" is selected
  if (!moustacheType || moustacheType === MoustacheTypes.NOTHING) {
    return null;
  }

  // Check if it's a valid moustache type
  const validMoustacheType = Object.values(MoustacheTypes).includes(
    moustacheType,
  )
    ? moustacheType
    : null;

  if (!validMoustacheType) {
    return null;
  }

  const moustacheSrc = `/shapes/moustache/${validMoustacheType}.svg`;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="w-full h-full relative">
        <Image
          src={moustacheSrc}
          alt={`${validMoustacheType} moustache`}
          fill
          className="object-contain"
          priority
          onError={(e) => {
            console.error('Failed to load moustache image:', moustacheSrc);
          }}
        />
      </div>
    </div>
  );
}
