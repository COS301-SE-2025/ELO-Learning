'use client';

import Image from 'next/image';

export const MouthTypes = {
  MOUTH_1: 'Mouth 1',
  MOUTH_2: 'Mouth 2',
  MOUTH_3: 'Mouth 3',
  MOUTH_4: 'Mouth 4',
  MOUTH_5: 'Mouth 5',
  MOUTH_6: 'Mouth 6',
  MOUTH_7: 'Mouth 7',
  MOUTH_8: 'Mouth 8',
  MOUTH_9: 'Mouth 9',
  MOUTH_10: 'Mouth 10',
  MOUTH_11: 'Mouth 11',
  MOUTH_12: 'Mouth 12',
  MOUTH_13: 'Mouth 13',
  MOUTH_14: 'Mouth 14',
  MOUTH_15: 'Mouth 15',
  MOUTH_16: 'Mouth 16',
  MOUTH_17: 'Mouth 17',
  MOUTH_18: 'Mouth 18',
  MOUTH_19: 'Mouth 19',
  MOUTH_20: 'Mouth 20',
  MOUTH_21: 'Mouth 21',
  MOUTH_22: 'Mouth 22',
  MOUTH_23: 'Mouth 23',
  MOUTH_24: 'Mouth 24',
  MOUTH_25: 'Mouth 25',
  MOUTH_26: 'Mouth 26',
  MOUTH_27: 'Mouth 27',
  MOUTH_28: 'Mouth 28',
  MOUTH_29: 'Mouth 29',
  MOUTH_30: 'Mouth 30',
  MOUTH_31: 'Mouth 31',
  MOUTH_32: 'Mouth 32',
};

export function MouthSelector({ selectedMouth, onMouthChange }) {
  const mouths = Object.values(MouthTypes).map((mouthType) => ({
    id: mouthType,
    name: mouthType,
    src: `/mouths/${mouthType}.svg`,
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Mouth</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {mouths.map((mouth) => (
          <button
            key={mouth.id}
            onClick={() => onMouthChange(mouth.id)}
            className={`p-3 rounded-lg border-2 transition-all aspect-square ${
              selectedMouth === mouth.id
                ? 'border-[#4d5ded] bg-[#201F1F] bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-[#4d5ded]'
            }`}
          >
            <div className="w-full h-20 relative mb-2 flex items-center justify-center">
              <Image
                src={mouth.src}
                alt={mouth.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* <div className="text-xs font-medium text-white text-center">
              {mouth.name}
            </div> */}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvatarMouth({ mouthType, className = '' }) {
  // Fallback for old mouth types or invalid types
  const validMouthType = Object.values(MouthTypes).includes(mouthType)
    ? mouthType
    : MouthTypes.MOUTH_1;
  const mouthSrc = `/mouths/${validMouthType}.svg`;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="w-full h-full relative">
        <Image
          src={mouthSrc}
          alt={`${validMouthType} mouth`}
          fill
          className="object-contain"
          priority
          onError={(e) => {
            console.error('Failed to load mouth image:', mouthSrc);
            // Fallback to Mouth 1 if image fails to load
            e.target.src = '/mouths/Mouth 1.svg';
          }}
        />
      </div>
    </div>
  );
}
