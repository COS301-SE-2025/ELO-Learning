'use client';

import { useEffect, useState } from 'react';

interface Question {
  timeElapsed?: number;
  // Add other question properties as needed
}

export default function Time() {
  const [totalTime, setTotalTime] = useState<string>('0:00');

  useEffect(() => {
    const questionsData = localStorage.getItem('questionsObj');

    if (!questionsData) {
      console.warn('No questions data found in localStorage');
      return;
    }

    try {
      const questionsObj: Question[] = JSON.parse(questionsData) || [];

      if (!Array.isArray(questionsObj)) {
        console.warn('Invalid questions data format');
        return;
      }

      // Calculate total time in seconds
      const totalSeconds = questionsObj.reduce(
        (total: number, question: Question) => {
          return total + (question.timeElapsed || 0);
        },
        0,
      );

      // Format time as MM:SS
      const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      };

      setTotalTime(formatTime(totalSeconds));
    } catch (error) {
      console.error('Error parsing questions data:', error);
      setTotalTime('0:00'); // Fallback to default value
    }
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
