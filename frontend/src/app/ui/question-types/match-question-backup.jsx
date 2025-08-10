'use client';
import { useState } from 'react';

export default function MatchQuestionTemplate({ question, answers, setAnswer, setIsAnswerCorrect }) {
  console.log('🔥 MatchQuestionTemplate - COMPONENT CALLED!', { question, answers, setAnswer, setIsAnswerCorrect });
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState({});
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);

  // Simple fallback component for now
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600">🔀</span>
          <span className="font-medium text-blue-800">Matching Instructions</span>
        </div>
        <p>Match each item on the left with the correct item on the right. Click one item from each side to create a match.</p>
      </div>

      {/* Simple message for now */}
      <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-4xl mb-4">🔗</div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Simplified Match Component
        </h3>
        <p className="text-yellow-700 mb-4">
          This is a simplified version for debugging.
        </p>
      </div>
    </div>
  );
}
