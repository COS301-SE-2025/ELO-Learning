'use client';

import Image from 'next/image';

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
  const moustaches = Object.entries(MoustacheTypes).map(([key, value]) => ({
    id: value,
    name: key === 'NOTHING' ? 'No Moustache' : value,
    src: key === 'NOTHING' ? null : `/shapes/moustache/${value}.svg`,
    isNothing: key === 'NOTHING',
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Moustache</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {moustaches.map((moustache) => (
          <button
            key={moustache.id}
            onClick={() => onMoustacheChange(moustache.id)}
            className={`p-3 rounded-lg border-2 transition-all aspect-square ${
              selectedMoustache === moustache.id
                ? 'border-[#4d5ded] bg-[#201F1F] bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-[#4d5ded]'
            }`}
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
