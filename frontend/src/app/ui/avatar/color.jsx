'use client';

// 24 colors in rainbow order, using the provided palette
export const AvatarColors = [
  // Purples
  '#421e68',
  '#7d32ce',
  '#c794ff',
  '#4d5ded',
  // Pinks
  '#ff6e99',
  '#ff7f7f',
  '#ffb6c1',
  '#ffb899',
  // Reds
  '#ff6b6b',
  '#ff4d4d',
  '#ff3b30',
  '#ff6347',
  // Oranges
  '#ffb347',
  '#ffa500',
  '#ff8c00',
  '#ffad60',
  // Yellows
  '#ffd93d',
  '#fff700',
  '#ffe066',
  '#fffacd',
  // Greens
  '#6bcf7f',
  '#98fb98',
  '#4ecdc4',
  '#20b2aa',
];

export function ColorSelector({ selectedColor, onColorChange }) {
  const colors = AvatarColors;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Shape Color</h3>
      <div className="grid grid-cols-4 gap-3">
        {colors.map((color) => (
          <div className="flex justify-center items-center" key={color}>
            <button
              onClick={() => onColorChange(color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                selectedColor === color
                  ? 'border-blue-500 border-4 scale-110'
                  : 'border-gray-600 hover:border-blue-400 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
