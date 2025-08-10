'use client';

export const BodyShapes = {
  ROUND: 'round',
  SQUARE: 'square',
  OVAL: 'oval',
  TRIANGLE: 'triangle',
};

export function BodyShapeSelector({ selectedShape, onShapeChange }) {
  const shapes = [
    { id: BodyShapes.ROUND, name: 'Round', icon: '●' },
    { id: BodyShapes.SQUARE, name: 'Square', icon: '■' },
    { id: BodyShapes.OVAL, name: 'Oval', icon: '◯' },
    { id: BodyShapes.TRIANGLE, name: 'Triangle', icon: '▲' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Body Shape</h3>
      <div className="grid grid-cols-2 gap-3">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => onShapeChange(shape.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedShape === shape.id
                ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                : 'border-gray-600 bg-gray-700 hover:border-blue-400'
            }`}
          >
            <div className="text-2xl mb-2">{shape.icon}</div>
            <div className="text-sm font-medium text-white">{shape.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvatarBodyShape({ shape, color, className = '' }) {
  const baseClasses = 'transition-all duration-200';

  const shapeStyles = {
    [BodyShapes.ROUND]: 'rounded-full',
    [BodyShapes.SQUARE]: 'rounded-lg',
    [BodyShapes.OVAL]: 'rounded-full aspect-[3/4]',
    [BodyShapes.TRIANGLE]: 'clip-triangle',
  };

  return (
    <div
      className={`${baseClasses} ${shapeStyles[shape]} ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
