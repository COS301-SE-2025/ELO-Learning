'use client';

import Image from 'next/image';

export const BodyShapes = {
  CIRCLE: 'Circle',
  SQUARE: 'Square',
  TRIANGLE: 'Triangle',
  HEART: 'Heart',
  PENTAGON: 'Pentagon',
  POLYGON: 'Polygon',
  TACO: 'Taco',
};

export function BodyShapeSelector({ selectedShape, onShapeChange }) {
  const shapes = Object.values(BodyShapes).map((shapeType) => ({
    id: shapeType,
    name: shapeType,
    src: `/shapes/${shapeType}.svg`,
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Body Shape</h3>
      <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => onShapeChange(shape.id)}
            className={`p-4 rounded-lg border-2 transition-all aspect-square ${
              selectedShape === shape.id
                ? 'border-[#4d5ded] bg-[#201F1F] bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-[#4d5ded]'
            }`}
          >
            <div className="w-full h-20 relative mb-2 flex items-center justify-center">
              <Image
                src={shape.src}
                alt={shape.name}
                fill
                className="object-contain"
              />
            </div>
            {/* <div className="text-sm font-medium text-white text-center">
              {shape.name}
            </div> */}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvatarBodyShape({ shape, color, className = '' }) {
  // Fallback for old shape types or invalid types
  const validShapeType = Object.values(BodyShapes).includes(shape)
    ? shape
    : BodyShapes.CIRCLE;
  const shapeSrc = `/shapes/${validShapeType}.svg`;

  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundColor: color,
          WebkitMask: `url(${shapeSrc}) no-repeat center / contain`,
          mask: `url(${shapeSrc}) no-repeat center / contain`,
        }}
      />
    </div>
  );
}
