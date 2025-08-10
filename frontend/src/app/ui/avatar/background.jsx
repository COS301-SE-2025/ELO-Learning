'use client';

export const BackgroundTypes = {
  SOLID_PINK: 'solid-pink',
  SOLID_BLUE: 'solid-blue',
  SOLID_GREEN: 'solid-green',
  SOLID_PURPLE: 'solid-purple',
  GRADIENT_SUNSET: 'gradient-sunset',
  GRADIENT_OCEAN: 'gradient-ocean',
  GRADIENT_FOREST: 'gradient-forest',
  GRADIENT_PURPLE: 'gradient-purple',
};

export function BackgroundSelector({ selectedBackground, onBackgroundChange }) {
  const backgrounds = [
    {
      id: BackgroundTypes.SOLID_PINK,
      name: 'Pink',
      style: { backgroundColor: '#FFB6C1' },
    },
    {
      id: BackgroundTypes.SOLID_BLUE,
      name: 'Blue',
      style: { backgroundColor: '#87CEEB' },
    },
    {
      id: BackgroundTypes.SOLID_GREEN,
      name: 'Green',
      style: { backgroundColor: '#98FB98' },
    },
    {
      id: BackgroundTypes.SOLID_PURPLE,
      name: 'Purple',
      style: { backgroundColor: '#DDA0DD' },
    },
    {
      id: BackgroundTypes.GRADIENT_SUNSET,
      name: 'Sunset',
      style: {
        background:
          'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      },
    },
    {
      id: BackgroundTypes.GRADIENT_OCEAN,
      name: 'Ocean',
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
    {
      id: BackgroundTypes.GRADIENT_FOREST,
      name: 'Forest',
      style: {
        background: 'linear-gradient(135deg, #c3ec52 0%, #0ba360 100%)',
      },
    },
    {
      id: BackgroundTypes.GRADIENT_PURPLE,
      name: 'Purple',
      style: {
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Background</h3>
      <div className="grid grid-cols-4 gap-3">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onBackgroundChange(bg.id)}
            className={`w-12 h-12 rounded-lg border-2 transition-all ${
              selectedBackground === bg.id
                ? 'border-blue-500 border-4 scale-110'
                : 'border-gray-600 hover:border-blue-400 hover:scale-105'
            }`}
            style={bg.style}
          />
        ))}
      </div>
    </div>
  );
}

export function AvatarBackground({ backgroundType, className = '' }) {
  const backgroundStyles = {
    [BackgroundTypes.SOLID_PINK]: { backgroundColor: '#FFB6C1' },
    [BackgroundTypes.SOLID_BLUE]: { backgroundColor: '#87CEEB' },
    [BackgroundTypes.SOLID_GREEN]: { backgroundColor: '#98FB98' },
    [BackgroundTypes.SOLID_PURPLE]: { backgroundColor: '#DDA0DD' },
    [BackgroundTypes.GRADIENT_SUNSET]: {
      background:
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    },
    [BackgroundTypes.GRADIENT_OCEAN]: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    [BackgroundTypes.GRADIENT_FOREST]: {
      background: 'linear-gradient(135deg, #c3ec52 0%, #0ba360 100%)',
    },
    [BackgroundTypes.GRADIENT_PURPLE]: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
  };

  return (
    <div
      className={`${className}`}
      style={
        backgroundStyles[backgroundType] ||
        backgroundStyles[BackgroundTypes.SOLID_PINK]
      }
    />
  );
}
