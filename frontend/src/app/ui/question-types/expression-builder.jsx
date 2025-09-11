// ui/answers/expression-builder.jsx
'use client';

import 'katex/dist/katex.min.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { InlineMath } from 'react-katex';

export default function ExpressionBuilderTemplate({
  question,
  setAnswer,
  answer = '',
  setIsAnswerCorrect,
}) {
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [showHelper, setShowHelper] = useState(false);

  // Available tiles for expression building - COMPREHENSIVE VERSION FOR ALL QUESTION TYPES
  const mathTiles = [
    // Variables (including Greek letters for advanced math)
    { id: 'x', label: 'x', type: 'variable' },
    { id: 'y', label: 'y', type: 'variable' },
    { id: 'z', label: 'z', type: 'variable' },
    { id: 'a', label: 'a', type: 'variable' },
    { id: 'b', label: 'b', type: 'variable' },
    { id: 'c', label: 'c', type: 'variable' },
    { id: 'd', label: 'd', type: 'variable' },
    { id: 'n', label: 'n', type: 'variable' },
    { id: 'r', label: 'r', type: 'variable' },
    { id: 'i', label: 'i', type: 'variable' },
    { id: 'theta', label: 'θ', type: 'variable' },
    { id: 'h', label: 'h', type: 'variable' },
    { id: 'k', label: 'k', type: 'variable' },
    { id: 'A', label: 'A', type: 'variable' },
    { id: 'B', label: 'B', type: 'variable' },
    { id: 'C', label: 'C', type: 'variable' },
    { id: 'P', label: 'P', type: 'variable' },

    // Basic Operators
    { id: 'equals', label: '=', type: 'operator' },
    { id: 'plus', label: '+', type: 'operator' },
    { id: 'minus', label: '-', type: 'operator' },
    { id: 'multiply', label: '×', type: 'operator' },
    { id: 'divide', label: '÷', type: 'operator' },
    { id: 'power', label: '^', type: 'operator' },
    { id: 'dot', label: '.', type: 'operator' },
    { id: 'pm', label: '±', type: 'operator' },

    // Brackets and Grouping
    { id: 'lparen', label: '(', type: 'bracket' },
    { id: 'rparen', label: ')', type: 'bracket' },
    { id: 'lbracket', label: '[', type: 'bracket' },
    { id: 'rbracket', label: ']', type: 'bracket' },
    { id: 'lbrace', label: '{', type: 'bracket' },
    { id: 'rbrace', label: '}', type: 'bracket' },

    // Mathematical Functions
    { id: 'sqrt', label: '√', type: 'function' },
    { id: 'sin', label: 'sin', type: 'function' },
    { id: 'cos', label: 'cos', type: 'function' },
    { id: 'tan', label: 'tan', type: 'function' },
    { id: 'sec', label: 'sec', type: 'function' },
    { id: 'csc', label: 'csc', type: 'function' },
    { id: 'cot', label: 'cot', type: 'function' },
    { id: 'log', label: 'log', type: 'function' },
    { id: 'ln', label: 'ln', type: 'function' },
    { id: 'abs', label: '|x|', type: 'function' },

    // Constants
    { id: 'pi', label: 'π', type: 'constant' },
    { id: 'e', label: 'e', type: 'constant' },
    { id: 'infinity', label: '∞', type: 'constant' },

    // Fractions and Advanced
    { id: 'fraction', label: 'a/b', type: 'function' },
    { id: 'subscript', label: 'a₁', type: 'function' },
    { id: 'deg', label: '°', type: 'symbol' },

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

  // Convert expression to LaTeX format for proper rendering
  const convertToLatex = (expression) => {
    return expression
      .replace(/×/g, ' \\times ')
      .replace(/÷/g, ' \\div ')
      .replace(/\^/g, '^')
      .replace(/sqrt/g, '\\sqrt')
      .replace(/π/g, '\\pi')
      .replace(/θ/g, '\\theta')
      .replace(/∞/g, '\\infty')
      .replace(/±/g, '\\pm')
      .replace(/°/g, '^\\circ')
      .replace(/sin/g, '\\sin')
      .replace(/cos/g, '\\cos')
      .replace(/tan/g, '\\tan')
      .replace(/sec/g, '\\sec')
      .replace(/csc/g, '\\csc')
      .replace(/cot/g, '\\cot')
      .replace(/log/g, '\\log')
      .replace(/ln/g, '\\ln')
      .replace(/\|x\|/g, '|x|')
      .replace(/a\/b/g, '\\frac{a}{b}')
      .replace(/a₁/g, 'a_1');
  };

  return (
    <div className="w-full space-y-6">
      {/* Expression Display Area - Match App Background */}
      <div className="border border-[#696969] rounded-lg p-4 min-h-[100px] flex flex-wrap items-center gap-2">
        {selectedTiles.length === 0 ? (
          <div className="w-full text-center text-[var(--color-foreground)] py-8">
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
          <div className="text-sm text-[var(--color-foreground)] mb-2">
            Preview:
          </div>
          <div className="text-xl text-[var(--color-foreground)]">
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
          className=" rounded-md disabled:cursor-not-allowed disabled:bg-[#696969] bg-[#ff6e99] transition-colors px-4 py-2"
        >
          Clear All
        </button>
      </div>

      {/* Available Tiles Grid - Organized by Categories */}
      <div className="space-y-6">
        {/* Numbers Grid - Traditional Calculator Layout */}
        <div>
          <div className="text-sm font-medium mb-2">Numbers</div>
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1: 7, 8, 9, ÷ */}
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
              onClick={() => addTile(mathTiles.find((t) => t.id === 'divide'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              ÷
            </button>

            {/* Row 2: 4, 5, 6, × */}
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
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === '6'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              6
            </button>
            <button
              onClick={() =>
                addTile(mathTiles.find((t) => t.id === 'multiply'))
              }
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              ×
            </button>

            {/* Row 3: 1, 2, 3, - */}
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
              onClick={() => addTile(mathTiles.find((t) => t.id === 'minus'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              -
            </button>

            {/* Row 4: 0, ., +, = */}
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === '0'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              0
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'dot'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              .
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'plus'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              +
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'equals'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              =
            </button>
          </div>
        </div>

        {/* Common Variables */}
        <div>
          <div className="text-sm font-medium mb-2">Variables</div>
          <div className="grid grid-cols-6 gap-2">
            {mathTiles
              .filter((tile) => tile.type === 'variable')
              .slice(0, 12)
              .map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => addTile(tile)}
                  className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
                >
                  {tile.label}
                </button>
              ))}
          </div>
        </div>

        {/* Trigonometric Functions */}
        <div>
          <div className="text-sm font-medium mb-2">
            Trigonometric Functions
          </div>
          <div className="grid grid-cols-6 gap-2">
            {mathTiles
              .filter((tile) =>
                ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'].includes(tile.id),
              )
              .map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => addTile(tile)}
                  className={`${getTileColor()} h-10 rounded-md font-bold text-sm hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
                >
                  {tile.label}
                </button>
              ))}
          </div>
        </div>

        {/* Advanced Functions & Operations */}
        <div>
          <div className="text-sm font-medium mb-2">Functions & Operations</div>
          <div className="grid grid-cols-5 gap-2">
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
            <button
              onClick={() =>
                addTile(mathTiles.find((t) => t.id === 'fraction'))
              }
              className={`${getTileColor()} h-12 rounded-md font-bold text-sm hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              a/b
            </button>
            <button
              onClick={() =>
                addTile(mathTiles.find((t) => t.id === 'subscript'))
              }
              className={`${getTileColor()} h-12 rounded-md font-bold text-sm hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              a₁
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'abs'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-sm hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              |x|
            </button>

            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'log'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-sm hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              log
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'ln'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-sm hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              ln
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'pi'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              π
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'e'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              e
            </button>
            <button
              onClick={() => addTile(mathTiles.find((t) => t.id === 'deg'))}
              className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
            >
              °
            </button>
          </div>
        </div>

        {/* Brackets & Symbols */}
        <div>
          <div className="text-sm font-medium mb-2">Brackets & Symbols</div>
          <div className="grid grid-cols-6 gap-2">
            {mathTiles
              .filter(
                (tile) =>
                  tile.type === 'bracket' ||
                  ['pm', 'infinity'].includes(tile.id),
              )
              .map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => addTile(tile)}
                  className={`${getTileColor()} h-12 rounded-md font-bold text-lg hover:scale-105 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
                >
                  {tile.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Helper Text - Matching Math Input Style */}
      <div
        className="text-xs border border-[#696969] p-3 rounded-lg cursor-pointer select-none"
        onClick={() => setShowHelper((prev) => !prev)}
      >
        <div className="flex items-center justify-between text-[var(--color-foreground)]">
          <strong className="text-[var(--color-foreground)]">
            Struggling? View some tips here
          </strong>
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
