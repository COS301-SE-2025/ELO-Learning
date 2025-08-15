'use client';
import { useEffect, useState } from 'react';

export default function Score() {
  const [percentage, setPercentage] = useState(0);
  
  useEffect(() => {
    try {
      const questionsData = localStorage.getItem('questionsObj');
      
      // Add null safety checks
      if (!questionsData) {
        console.log('No questions data found in localStorage');
        setPercentage(0);
        return;
      }

      const questions = JSON.parse(questionsData);
      
      // Ensure questions is an array
      if (!Array.isArray(questions)) {
        console.log('Questions data is not an array:', questions);
        setPercentage(0);
        return;
      }

      // Filter correct answers safely
      const correctAnswers = questions.filter(
        (question) => question && question.isCorrect === true,
      );

      // Calculate percentage
      const calculatedPercentage = questions.length > 0 
        ? (correctAnswers.length / questions.length) * 100 
        : 0;
        
      setPercentage(calculatedPercentage);
      
    } catch (error) {
      console.error('Error parsing questions from localStorage:', error);
      setPercentage(0);
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