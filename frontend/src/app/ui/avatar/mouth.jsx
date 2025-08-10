'use client';

export const MouthTypes = {
  SMILE: 'smile',
  NEUTRAL: 'neutral',
  FROWN: 'frown',
  SURPRISED: 'surprised',
  TONGUE: 'tongue',
  LAUGH: 'laugh',
};

export function MouthSelector({ selectedMouth, onMouthChange }) {
  const mouths = [
    { id: MouthTypes.SMILE, name: 'Smile', emoji: '😊' },
    { id: MouthTypes.NEUTRAL, name: 'Neutral', emoji: '😐' },
    { id: MouthTypes.FROWN, name: 'Frown', emoji: '☹️' },
    { id: MouthTypes.SURPRISED, name: 'Surprised', emoji: '😮' },
    { id: MouthTypes.TONGUE, name: 'Tongue', emoji: '😛' },
    { id: MouthTypes.LAUGH, name: 'Laugh', emoji: '😄' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Mouth</h3>
      <div className="grid grid-cols-3 gap-3">
        {mouths.map((mouth) => (
          <button
            key={mouth.id}
            onClick={() => onMouthChange(mouth.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedMouth === mouth.id
                ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-blue-400'
            }`}
          >
            <div className="text-xl mb-1">{mouth.emoji}</div>
            <div className="text-xs font-medium text-white">{mouth.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvatarMouth({ mouthType, className = '' }) {
  const mouthComponents = {
    [MouthTypes.SMILE]: (
      <div className="w-6 h-3 border-b-2 border-black rounded-b-full"></div>
    ),
    [MouthTypes.NEUTRAL]: (
      <div className="w-4 h-0.5 bg-black rounded-full"></div>
    ),
    [MouthTypes.FROWN]: (
      <div className="w-6 h-3 border-t-2 border-black rounded-t-full"></div>
    ),
    [MouthTypes.SURPRISED]: (
      <div className="w-3 h-4 bg-black rounded-full"></div>
    ),
    [MouthTypes.TONGUE]: (
      <div className="flex flex-col items-center">
        <div className="w-6 h-3 border-b-2 border-black rounded-b-full"></div>
        <div className="w-2 h-2 bg-red-400 rounded-b-full -mt-1"></div>
      </div>
    ),
    [MouthTypes.LAUGH]: (
      <div className="w-8 h-4 border-b-2 border-black rounded-b-full">
        <div className="flex justify-center mt-1 space-x-0.5">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    ),
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {mouthComponents[mouthType] || mouthComponents[MouthTypes.SMILE]}
    </div>
  );
}
