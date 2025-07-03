'use client';

import { useEffect, useState } from 'react';

export default function Time() {
  const [totalTime, setTotalTime] = useState('0:00');

  useEffect(() => {
    const questionsObj = JSON.parse(localStorage.getItem('questionsObj')) || [];

    // Calculate total time in seconds
    const totalSeconds = questionsObj.reduce((total, question) => {
      return total + (question.timeElapsed || 0);
    }, 0);

    // Format time as MM:SS
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    setTotalTime(formatTime(totalSeconds));
  }, []);

  return (
    <div className="border-1 border-[#309F04] rounded-[10px] w-[90px]">
      <div className="uppercase bg-[#309F04] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        Time
      </div>
      <div className="text-center text-[18px] font-bold py-3 px-5">
        {totalTime}
      </div>
    </div>
  );
}
