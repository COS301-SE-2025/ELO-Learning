'use client';

import { avatarColors } from './avatar-colors';

export { avatarColors as AvatarColors };

export function ColorSelector({ selectedColor, onColorChange }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Shape Color</h3>
      <div className="grid grid-cols-4 gap-3">
        {avatarColors.map((color) => (
          <div className="flex justify-center items-center" key={color}>
            <button
              onClick={() => onColorChange(color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                selectedColor === color
                  ? 'border-[#4d5ded] border-4 scale-110'
                  : 'border-gray-600 hover:border-[#4d5ded] hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
