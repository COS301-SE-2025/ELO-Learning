// ui/answers/expression-builder.jsx
'use client';

import 'katex/dist/katex.min.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { InlineMath } from 'react-katex';
import { convertToLatex } from '../../../utils/latexConverter';

export default function ExpressionBuilderTemplate({
  question,
  setAnswer,
  answer = '',
  setIsAnswerCorrect,
}) {
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [showHelper, setShowHelper] = useState(false);

  // Available tiles for expression building - COMPLETE VERSION
  const mathTiles = [
    // Variables
    { id: 'x', label: 'x', type: 'variable' },
    { id: 'y', label: 'y', type: 'variable' },
    { id: 'z', label: 'z', type: 'variable' }, // ✅ Added missing 'z'

    // Operators
    { id: 'equals', label: '=', type: 'operator' },
    { id: 'minus', label: '-', type: 'operator' },
    { id: 'plus', label: '+', type: 'operator' },
    { id: 'multiply', label: '×', type: 'operator' },
    { id: 'divide', label: '÷', type: 'operator' },
    { id: 'power', label: '^', type: 'operator' },

    // Functions
    { id: 'sqrt', label: '√', type: 'function' },
    { id: 'lparen', label: '(', type: 'bracket' },
    { id: 'rparen', label: ')', type: 'bracket' },

    // Numbers
    { id: '0', label: '0', type: 'number' },
    { id: '1', label: '1', type: 'number' },
    { id: '2', label: '2', type: 'number' },
    { id: '3', label: '3', type: 'number' },
    { id: '4', label: '4', type: 'number' },
    { id: '5', label: '5', type: 'number' },
    { id: '6', label: '6', type: 'number' },
    { id: '7', label: '7', type: 'number' },
    { id: '8', label: '8', type: 'number' },
    { id: '9', label: '9', type: 'number' },

    // Decimal point
    { id: 'dot', label: '.', type: 'number' }, // ✅ Added decimal point to array
  ];

  const getTileColor = () => {
    // Uniform color scheme matching Figma: fill: #7D32CE, stroke: #421E68
    return 'bg-[#7D32CE] border-2 border-[#421E68] hover:bg-[#421E68] text-white';
  };

  // Initialize available tiles
  useEffect(() => {
    setAvailableTiles(mathTiles);
  }, []);

  // Update parent components when expression changes
  useEffect(() => {
    const expression = selectedTiles.map((tile) => tile.label).join(' ');
    setAnswer(expression);

    // Basic validation - check if we have a reasonable expression
    const hasVariable = selectedTiles.some((tile) => tile.type === 'variable');
    const hasNumber = selectedTiles.some((tile) => tile.type === 'number');
    const isValidLength = selectedTiles.length >= 3; // Minimum reasonable expression

    setIsAnswerCorrect(hasVariable && hasNumber && isValidLength);
  }, [selectedTiles, setAnswer, setIsAnswerCorrect]);

  const addTile = (tile) => {
    setSelectedTiles((prev) => [
      ...prev,
      { ...tile, uniqueId: Date.now() + Math.random() },
    ]);
  };

  const removeTile = (uniqueId) => {
    setSelectedTiles((prev) =>
      prev.filter((tile) => tile.uniqueId !== uniqueId),
    );
  };

  const clearAll = () => {
    setSelectedTiles([]);
  };

  // Note: Using imported convertToLatex function for enhanced math rendering

  return (
    <div className="w-full space-y-6 mb-35">
      {/* Expression Display Area - Match App Background */}
      <div className="border border-[#696969] rounded-lg p-4 min-h-[100px] flex flex-wrap items-center gap-2">
        {selectedTiles.length === 0 ? (
          <div className="w-full text-sm py-2">
            <p>Start building your expression by tapping tiles below</p>
          </div>
        ) : (
          selectedTiles.map((tile) => (
            <button
              key={tile.uniqueId}
              onClick={() => removeTile(tile.uniqueId)}
              className={`
                ${getTileColor()} px-3 py-2 rounded-md font-bold text-lg
                hover:scale-105 transition-all duration-200 active:scale-95
                shadow-md hover:shadow-lg
              `}
              title="Click to remove"
            >
              {tile.label}
            </button>
          ))
        )}
      </div>

      {/* Expression Preview - Match App Background with LaTeX */}
      {selectedTiles.length > 0 && (
        <div className="border border-[#696969] rounded-lg p-4">
          <div className="text-sm mb-2">Preview:</div>
          <div className="text-xl">
            <InlineMath
              math={convertToLatex(
                selectedTiles.map((tile) => tile.label).join(' '),
              )}
            />
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={clearAll}
          disabled={selectedTiles.length === 0}
          className="px-4 py-2 bg-[#ff6e99] text-white rounded-lg disabled:bg-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Available Tiles Grid - 5x5 Layout */}
      <div className="grid grid-cols-5 gap-3">
        {/* Row 1: 1, 2, 3, 4, 5 */}
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '1'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          1
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '2'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          2
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '3'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          3
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '4'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          4
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '5'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          5
        </button>

        {/* Row 2: 6, 7, 8, 9, 0 */}
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '6'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          6
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '7'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          7
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '8'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          8
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '9'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          9
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === '0'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          0
        </button>

        {/* Row 3: +, -, ×, ÷, = */}
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'plus'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          +
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'minus'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          -
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'multiply'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          ×
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'divide'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          ÷
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'equals'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          =
        </button>

        {/* Row 4: x, y, z, ^, √ */}
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'x'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          x
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'y'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          y
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'z'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          z
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'power'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          ^
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'sqrt'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          √
        </button>

        {/* Row 5: (, ), ., and two empty spaces or additional functions */}
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'lparen'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          (
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'rparen'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          )
        </button>
        <button
          onClick={() => addTile(mathTiles.find((t) => t.id === 'dot'))}
          className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
        >
          .
        </button>
        {/* Empty spaces - you can add more functions here if needed */}
        <div className="h-12"></div>
        <div className="h-12"></div>
      </div>

      {/* Helper Text - Matching Math Input Style */}
      <div
        className="text-xs border border-[#696969] p-3 rounded-lg cursor-pointer select-none"
        onClick={() => setShowHelper((prev) => !prev)}
      >
        <div className="flex items-center justify-between text-[var(--color-foreground)]">
          <strong>Struggling? View some tips here</strong>
          <span className="ml-2">
            {showHelper ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
        {showHelper && (
          <div className="space-y-1 mt-2 text-[var(--color-foreground)]">
            <p>• Tap tiles to add them to your expression</p>
            <p>• Click on tiles in your expression to remove them</p>
            <p>• Build expressions like: x² + 5x + 6</p>
            <p>• Use parentheses for grouping: (x + 2)(x + 3)</p>
            <p>• For identities: sin²θ + cos²θ = 1</p>
            <p>• For sequences: aₙ = a₁ + (n-1)d</p>
            <p>• For functions: f(x) = 2x + 5</p>
            <p>• For geometry: A = πr²</p>
          </div>
        )}
      </div>
    </div>
  );
}
