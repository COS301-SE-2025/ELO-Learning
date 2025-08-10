'use client';

export const AvatarColors = {
  // Math-themed colors for geometric shapes
  BRIGHT_RED: '#FF6B6B',
  WARM_ORANGE: '#FFB347',
  SUNNY_YELLOW: '#FFD93D',
  LIME_GREEN: '#6BCF7F',
  SKY_BLUE: '#4DABF7',
  ROYAL_PURPLE: '#845EC2',
  HOT_PINK: '#FF6B9D',
  MINT_GREEN: '#4ECDC4',
  CORAL: '#FF7F7F',
  LAVENDER: '#C8A8E9',
  PEACH: '#FFB899',
  TEAL: '#20B2AA',
};

export function ColorSelector({ selectedColor, onColorChange }) {
  const colors = Object.values(AvatarColors);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Shape Color</h3>
      <div className="grid grid-cols-4 gap-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-12 h-12 rounded-lg border-2 transition-all ${
              selectedColor === color
                ? 'border-blue-500 border-4 scale-110'
                : 'border-gray-600 hover:border-blue-400 hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
