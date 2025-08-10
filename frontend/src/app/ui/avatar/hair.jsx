'use client';

export const HairTypes = {
  SHORT: 'short',
  LONG: 'long',
  CURLY: 'curly',
  BUZZ: 'buzz',
  PONYTAIL: 'ponytail',
  NONE: 'none',
};

export const HairColors = {
  BLACK: '#2C1810',
  DARK_BROWN: '#4A2C2A',
  BROWN: '#8B4513',
  LIGHT_BROWN: '#CD853F',
  BLONDE: '#F4A460',
  RED: '#B22222',
  GRAY: '#808080',
  WHITE: '#F5F5F5',
};

export function HairSelector({
  selectedHair,
  selectedHairColor,
  onHairChange,
  onHairColorChange,
}) {
  const hairStyles = [
    { id: HairTypes.SHORT, name: 'Short', emoji: '👱' },
    { id: HairTypes.LONG, name: 'Long', emoji: '👩' },
    { id: HairTypes.CURLY, name: 'Curly', emoji: '👨‍🦱' },
    { id: HairTypes.BUZZ, name: 'Buzz', emoji: '👨‍🦲' },
    { id: HairTypes.PONYTAIL, name: 'Ponytail', emoji: '👩‍🦰' },
    { id: HairTypes.NONE, name: 'Bald', emoji: '👨‍🦲' },
  ];

  const hairColors = Object.entries(HairColors).map(([name, color]) => ({
    id: color,
    name: name.replace('_', ' '),
    color,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-midnight-theorem mb-4">
          Hair Style
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {hairStyles.map((hair) => (
            <button
              key={hair.id}
              onClick={() => onHairChange(hair.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedHair === hair.id
                  ? 'border-vector-violet bg-vector-violet bg-opacity-10'
                  : 'border-chalk-dust bg-white hover:border-vector-violet-light'
              }`}
            >
              <div className="text-xl mb-1">{hair.emoji}</div>
              <div className="text-xs font-medium">{hair.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-midnight-theorem mb-4">
          Hair Color
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {hairColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onHairColorChange(color.id)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                selectedHairColor === color.id
                  ? 'border-vector-violet border-4 scale-110'
                  : 'border-gray-300 hover:border-vector-violet-light hover:scale-105'
              }`}
              style={{ backgroundColor: color.color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AvatarHair({ hairType, hairColor, className = '' }) {
  if (hairType === HairTypes.NONE) return null;

  const hairComponents = {
    [HairTypes.SHORT]: (
      <div
        className="w-20 h-12 rounded-t-full absolute -top-2 left-1/2 transform -translate-x-1/2"
        style={{ backgroundColor: hairColor }}
      />
    ),
    [HairTypes.LONG]: (
      <div
        className="w-24 h-20 rounded-t-full absolute -top-2 left-1/2 transform -translate-x-1/2"
        style={{ backgroundColor: hairColor }}
      />
    ),
    [HairTypes.CURLY]: (
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div
          className="w-20 h-12 rounded-t-full"
          style={{ backgroundColor: hairColor }}
        />
        <div className="flex justify-around -mt-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: hairColor }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: hairColor }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: hairColor }}
          />
        </div>
      </div>
    ),
    [HairTypes.BUZZ]: (
      <div
        className="w-18 h-8 rounded-t-full absolute -top-1 left-1/2 transform -translate-x-1/2"
        style={{ backgroundColor: hairColor }}
      />
    ),
    [HairTypes.PONYTAIL]: (
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div
          className="w-20 h-12 rounded-t-full"
          style={{ backgroundColor: hairColor }}
        />
        <div
          className="w-3 h-8 rounded-full absolute -right-2 top-4"
          style={{ backgroundColor: hairColor }}
        />
      </div>
    ),
  };

  return <div className={className}>{hairComponents[hairType]}</div>;
}
