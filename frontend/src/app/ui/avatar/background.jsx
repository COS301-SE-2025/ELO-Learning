'use client';

import { gradients, solidColors } from './avatar-colors';

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
    // Solid color options
    ...solidColors.map((color, i) => ({
      id: `solid-${i}`,
      name: `Solid ${i + 1}`,
      style: { backgroundColor: color },
    })),
    // Gradient options
    ...gradients.map((g, i) => ({
      id: `gradient-${i}`,
      name: `Gradient ${i + 1}`,
      style: {
        background: `linear-gradient(135deg, ${g.colors.join(', ')})`,
      },
    })),
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Background</h3>
      <div className="grid grid-cols-4 gap-3">
        {/* Center each button in its column using flex */}
        {backgrounds.map((bg) => (
          <div className="flex justify-center items-center" key={bg.id}>
            <button
              onClick={() => onBackgroundChange(bg.id)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                selectedBackground === bg.id
                  ? 'border-[#4d5ded] border-4 scale-110'
                  : 'border-gray-600 hover:border-[#4d5ded] hover:scale-105'
              }`}
              style={bg.style}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AvatarBackground({ backgroundType, className = '' }) {
  // Support new solid and gradient backgrounds
  // If backgroundType starts with 'solid-', use solidColors
  // If backgroundType starts with 'gradient-', use gradients
  const solidColors = [
    '#421e68',
    '#7d32ce',
    '#c794ff',
    '#4d5ded',
    '#ff6e99',
    '#6e3a99',
    '#a16be0',
    '#bfa0ff',
    '#7a8aff',
    '#ff8ab8',
    '#d94d8f',
    '#a8327d',
  ];
  const gradients = [
    { colors: ['#421e68', '#7d32ce'] },
    { colors: ['#7d32ce', '#c794ff'] },
    { colors: ['#c794ff', '#4d5ded'] },
    { colors: ['#4d5ded', '#ff6e99'] },
    { colors: ['#ff6e99', '#421e68'] },
    { colors: ['#421e68', '#7d32ce', '#c794ff'] },
    { colors: ['#7d32ce', '#c794ff', '#4d5ded'] },
    { colors: ['#c794ff', '#4d5ded', '#ff6e99'] },
    { colors: ['#4d5ded', '#ff6e99', '#421e68'] },
    { colors: ['#ff6e99', '#421e68', '#7d32ce'] },
    { colors: ['#421e68', '#7d32ce', '#c794ff', '#4d5ded', '#ff6e99'] },
    { colors: ['#ff6e99', '#4d5ded', '#c794ff', '#7d32ce', '#421e68'] },
  ];

  let style = { backgroundColor: '#421e68' };
  if (backgroundType && backgroundType.startsWith('solid-')) {
    const idx = parseInt(backgroundType.split('-')[1], 10);
    style = { backgroundColor: solidColors[idx] || '#421e68' };
  } else if (backgroundType && backgroundType.startsWith('gradient-')) {
    const idx = parseInt(backgroundType.split('-')[1], 10);
    const g = gradients[idx];
    if (g) {
      style = { background: `linear-gradient(135deg, ${g.colors.join(', ')})` };
    }
  }

  return <div className={`${className}`} style={style} />;
}
