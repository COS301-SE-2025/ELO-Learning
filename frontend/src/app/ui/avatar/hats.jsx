'use client';

import Image from 'next/image';

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
  const hats = Object.entries(HatTypes).map(([key, value]) => ({
    id: value,
    name:
      key === 'NOTHING'
        ? 'No Hat'
        : value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    src: key === 'NOTHING' ? null : `/shapes/hats/${value}.svg`,
    isNothing: key === 'NOTHING',
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Hats</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {hats.map((hat) => (
          <button
            key={hat.id}
            onClick={() => onHatChange(hat.id)}
            className={`p-3 rounded-lg border-2 transition-all aspect-square ${
              selectedHat === hat.id
                ? 'border-[#4d5ded] bg-[#201F1F] bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-[#4d5ded]'
            }`}
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
                  className="object-contain"
                  priority
                />
              )}
            </div>
          </button>
        ))}
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
