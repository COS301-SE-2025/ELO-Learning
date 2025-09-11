'use client';

import Image from 'next/image';

export const EyeTypes = {
  EYE_1: 'Eye 1',
  EYE_2: 'Eye 2',
  EYE_3: 'Eye 3',
  EYE_4: 'Eye 4',
  EYE_5: 'Eye 5',
  EYE_6: 'Eye 6',
  EYE_7: 'Eye 7',
  EYE_8: 'Eye 8',
  EYE_9: 'Eye 9',
  EYE_10: 'Eye 10',
  EYE_11: 'Eye 11',
  EYE_12: 'Eye 12',
  EYE_13: 'Eye 13',
  EYE_14: 'Eye 14',
  EYE_15: 'Eye 15',
  EYE_16: 'Eye 16',
  EYE_17: 'Eye 17',
  EYE_18: 'Eye 18',
  EYE_19: 'Eye 19',
  EYE_20: 'Eye 20',
  EYE_21: 'Eye 21',
  EYE_22: 'Eye 22',
  EYE_23: 'Eye 23',
  EYE_24: 'Eye 24',
  EYE_25: 'Eye 25',
  EYE_26: 'Eye 26',
  EYE_27: 'Eye 27',
  EYE_28: 'Eye 28',
  EYE_29: 'Eye 29',
  EYE_30: 'Eye 30',
  EYE_31: 'Eye 31',
  EYE_32: 'Eye 32',
};

export function EyeSelector({ selectedEyes, onEyesChange }) {
  const eyes = Object.values(EyeTypes).map((eyeType) => ({
    id: eyeType,
    name: eyeType,
    src: `/eyes/${eyeType}.svg`,
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Eyes</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {eyes.map((eye) => (
          <button
            key={eye.id}
            onClick={() => onEyesChange(eye.id)}
            className={`p-3 rounded-lg border-2 transition-all aspect-square ${
              selectedEyes === eye.id
                ? 'border-[#4d5ded] bg-[#201F1F] bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-[#4d5ded]'
            }`}
          >
            <div className="w-full h-20 relative mb-2 flex items-center justify-center">
              <Image
                src={eye.src}
                alt={eye.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* <div className="text-xs font-medium text-white text-center">
              {eye.name}
            </div> */}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvatarEyes({ eyeType, className = '' }) {
  // Fallback for old eye types or invalid types
  const validEyeType = Object.values(EyeTypes).includes(eyeType)
    ? eyeType
    : EyeTypes.EYE_1;
  const eyeSrc = `/eyes/${validEyeType}.svg`;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="w-full h-full relative">
        <Image
          src={eyeSrc}
          alt={`${validEyeType} eyes`}
          fill
          className="object-contain"
          priority
          onError={(e) => {
            console.error('Failed to load eye image:', eyeSrc);
            // Fallback to Eye 1 if image fails to load
            e.target.src = '/eyes/Eye 1.svg';
          }}
        />
      </div>
    </div>
  );
}
