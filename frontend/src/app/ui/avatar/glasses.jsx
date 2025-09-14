'use client';

import Image from 'next/image';

export const GlassesTypes = {
  NOTHING: 'Nothing',
  GLASSES_1: 'Glasses 1',
  GLASSES_2: 'Glasses 2',
  GLASSES_3: 'Glasses 3',
  GLASSES_4: 'Glasses 4',
  GLASSES_5: 'Glasses 5',
  GLASSES_7: 'Glasses 7',
  GLASSES_8: 'Glasses 8',
};

export function GlassesSelector({ selectedGlasses, onGlassesChange }) {
  const glasses = Object.entries(GlassesTypes).map(([key, value]) => ({
    id: value,
    name: key === 'NOTHING' ? 'No Glasses' : value,
    src: key === 'NOTHING' ? null : `/shapes/glasses/${value}.svg`,
    isNothing: key === 'NOTHING',
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Glasses</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {glasses.map((glasses) => (
          <button
            key={glasses.id}
            onClick={() => onGlassesChange(glasses.id)}
            className={`p-3 rounded-lg border-2 transition-all aspect-square ${
              selectedGlasses === glasses.id
                ? 'border-[#4d5ded] bg-[#201F1F] bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-[#4d5ded]'
            }`}
          >
            <div className="w-full h-20 relative mb-2 flex items-center justify-center">
              {glasses.isNothing ? (
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-2xl text-gray-400">✕</span>
                </div>
              ) : (
                <Image
                  src={glasses.src}
                  alt={glasses.name}
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
