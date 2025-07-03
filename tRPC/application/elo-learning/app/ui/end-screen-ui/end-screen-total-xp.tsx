'use client';

import { useEffect, useState } from 'react';

interface QuestionData {
  xpGain: number;
  // Add other question data properties as needed
}

interface Question {
  isCorrect: boolean;
  question: QuestionData;
  // Add other question properties as needed
}

export default function TotalXP() {
  const [totalXP, setTotalXP] = useState<number>(0);

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

      const totalXPSum = correctAnswers.reduce(
        (accumulator: number, question: Question) => {
          const xpGain = question.question?.xpGain || 0;
          return accumulator + xpGain;
        },
        0,
      );

      setTotalXP(totalXPSum);
    } catch (error) {
      console.error('Error parsing questions data:', error);
      setTotalXP(0); // Fallback to default value
    }
  }, []);
  return (
    <div className="border-1 border-[#FF6E99] rounded-[10px] w-[90px]">
      <div className="uppercase bg-[#FF6E99] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        XP
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">
        {totalXP}xp
      </div>
    </div>
  );
}
