'use client';
import { useEffect, useState } from 'react';

export default function Score() {
  const [percentage, setPercentage] = useState(0);
  useEffect(() => {
    const questions = JSON.parse(localStorage.getItem('questionsObj'));
    const correctAnswers = questions.filter(
      (question) => question.isCorrect == true
    );

    setPercentage((correctAnswers.length / questions.length) * 100);
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
