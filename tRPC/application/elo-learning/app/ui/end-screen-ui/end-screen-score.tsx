'use client';
import { useEffect, useState } from 'react';

interface Question {
  isCorrect: boolean;
  // Add other question properties as needed
}

export default function Score() {
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const questionsData = localStorage.getItem('questionsObj');
    if (!questionsData) {
      console.warn('No questions data found in localStorage');
      return;
    }

    try {
      const questions: Question[] = JSON.parse(questionsData);
      if (!Array.isArray(questions) || questions.length === 0) {
        console.warn('Invalid or empty questions data');
        return;
      }

      const correctAnswers = questions.filter(
        (question: Question) => question.isCorrect === true,
      );

      setPercentage((correctAnswers.length / questions.length) * 100);
    } catch (error) {
      console.error('Error parsing questions data:', error);
    }
  }, []);

  return (
    <div className="border-1 border-[#4D5DED] rounded-[10px] w-[90px]">
      <div className="uppercase bg-[#4D5DED] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        Score
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">
        {percentage.toFixed()}%
      </div>
    </div>
  );
}
