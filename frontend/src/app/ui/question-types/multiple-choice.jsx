'use client';

import { useState } from 'react';

export default function MultipleChoiceTemplate({
  answers,
  setAnswer,
  setIsAnswerCorrect,
}) {
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswerId(answer.id);
    setAnswer(answer.answer_text);
    setIsAnswerCorrect(answer.isCorrect);
  };

  return (
    <div className="space-y-4">
      {answers.map((answer, idx) => (
        <button
          key={answer.id || idx}
          onClick={() => handleAnswerSelect(answer)}
          className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
            selectedAnswerId === answer.id
              ? 'bg-[#7D32CE] text-white border-[#7D32CE] shadow-lg transform scale-[1.02]'
              : 'bg-white text-black border-gray-300 hover:border-[#7D32CE] hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedAnswerId === answer.id
                  ? 'border-white bg-white'
                  : 'border-gray-400'
              }`}
            >
              {selectedAnswerId === answer.id && (
                <div className="w-3 h-3 rounded-full bg-[#7D32CE]"></div>
              )}
            </div>
            <span className="text-lg">{answer.answer_text}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
