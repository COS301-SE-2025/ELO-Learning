'use client';

import { useEffect, useState } from 'react';
export default function TotalXP() {
  const [totalXP, setTotalXP] = useState(0);
  useEffect(() => {
    const questions = JSON.parse(localStorage.getItem('questionsObj'));
    const correctAnswers = questions.filter(
      (question) => question.isCorrect == true
    );
    const totalXPSum = correctAnswers.reduce(
      (accumulator, question) => accumulator + question.question.xpGain,
      0
    );

    setTotalXP(totalXPSum);
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
