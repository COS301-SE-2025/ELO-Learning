'use client';

import { useAvatarUnlockables } from '@/hooks/useAvatarUnlockables';
import Image from 'next/image';
import { LockIndicator, ProgressIndicator } from './lock-indicator';

export const HatTypes = {
  NOTHING: 'Nothing',
  BEANIE: 'beanie',
  BERET: 'beret',
  BOW: 'bow',
  BUCKET_HAT: 'bucket-hat',
  BUNNY: 'bunny',
  CAT: 'cat',
  CROWN: 'crown',
  DAISY: 'daisy',
  FEDORA: 'fedora',
  JESTER_HAT: 'jester-hat',
  PIRATE_HAT: 'pirate-hat',
  SHERRIF: 'sherrif',
  SOMBRERO: 'sombrero',
  STRAW_HAT: 'straw-hat',
  TOP_HAT: 'top-hat',
  WIZARD_HAT: 'wizard-hat',
};

export function HatSelector({ selectedHat, onHatChange }) {
  const { isItemUnlocked, getLockedItemInfo, loading } = useAvatarUnlockables();

  const hats = Object.entries(HatTypes).map(([key, value]) => ({
    id: value,
    name:
      key === 'NOTHING'
        ? 'No Hat'
        : value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    key: key, // NOTHING, BEANIE, etc.
    unlockableId: value, // The actual hat name used in the unlockables service
    src: key === 'NOTHING' ? null : `/shapes/hats/${value}.svg`,
    isNothing: key === 'NOTHING',
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Hats</h3>
        <div className="text-gray-400">Loading hat options...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Hats</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {hats.map((hat) => {
          // "Nothing" is always unlocked, for others use the unlockableId
          const isUnlocked = hat.isNothing || isItemUnlocked(hat.unlockableId);
          const lockedInfo = hat.isNothing
            ? null
            : getLockedItemInfo(hat.unlockableId);

          return (
            <button
              key={hat.id}
              onClick={() => isUnlocked && onHatChange(hat.id)}
              disabled={!isUnlocked}
              className={`p-3 rounded-lg border-2 transition-all aspect-square relative ${
                selectedHat === hat.id && isUnlocked
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
                  : hat.name
              }
            >
              <div className="w-full h-20 relative mb-2 flex items-center justify-center">
                {hat.isNothing ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-2xl text-gray-400">✕</span>
                  </div>
                ) : (
                  <Image
                    src={hat.src}
                    alt={hat.name}
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

export function AvatarHat({ hatType, className = '' }) {
  // Don't render anything if no hat is selected or "Nothing" is selected
  if (!hatType || hatType === HatTypes.NOTHING) {
    return null;
  }

  // Check if it's a valid hat type
  const validHatType = Object.values(HatTypes).includes(hatType)
    ? hatType
    : null;

  if (!validHatType) {
    return null;
  }

  const hatSrc = `/shapes/hats/${validHatType}.svg`;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="w-full h-full relative">
        <Image
          src={hatSrc}
          alt={`${validHatType} hat`}
          fill
          className="object-contain"
          priority
          onError={(e) => {
            console.error('Failed to load hat image:', hatSrc);
          }}
        />
      </div>
    </div>
  );
}
