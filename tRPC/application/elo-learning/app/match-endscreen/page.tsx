'use client';
import Score from '@/app/ui/end-screen-ui/end-screen-score';
import Time from '@/app/ui/end-screen-ui/end-screen-total-time';
import TotalXP from '@/app/ui/end-screen-ui/end-screen-total-xp';
import { updateUserXP } from '@/services/api';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

// Type definitions
interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  currentLevel: number;
  joinDate: string;
  xp: number;
}

interface Answer {
  id: number;
  answer_text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
  type: string;
  xpGain: number;
}

interface QuestionStorageObject {
  question: Question;
  q_index: number;
  answer: string;
  isCorrect: boolean;
  actualAnswer: Answer;
  timeElapsed: number;
}

function MatchEndScreenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const result = searchParams.get('result');
  const isWinner = result === 'winner';
  const [isLoading, setIsLoading] = useState(false);

  const clearStorageAndRedirect = async () => {
    try {
      setIsLoading(true);

      // Get user data from cookie
      const userCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user='));

      if (!userCookie) {
        console.error('User cookie not found');
        router.push('/dashboard');
        return;
      }

      // Decode the URL-encoded cookie value
      const encodedUserData = userCookie.split('=')[1];
      const decodedUserData = decodeURIComponent(encodedUserData);
      const userData: User = JSON.parse(decodedUserData);

      // Calculate XP earned using the same logic as TotalXP component
      const questions: QuestionStorageObject[] = JSON.parse(
        localStorage.getItem('questionsObj') || '[]',
      );
      const correctAnswers = questions.filter(
        (question: QuestionStorageObject) => question.isCorrect === true,
      );
      const xpEarned = correctAnswers.reduce(
        (accumulator: number, question: QuestionStorageObject) =>
          accumulator + question.question.xpGain,
        0,
      );

      if (xpEarned > 0) {
        // Calculate new total XP
        const newTotalXP = userData.xp + xpEarned;

        // Update user XP in database
        await updateUserXP(userData.id, newTotalXP);

        // Update the cookie with new XP value
        const updatedUserData = { ...userData, xp: newTotalXP };
        const updatedCookie = encodeURIComponent(
          JSON.stringify(updatedUserData),
        );
        document.cookie = `user=${updatedCookie}; path=/`;
      }

      // Clear localStorage
      localStorage.removeItem('questionsObj');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error claiming XP:', error);
      // Still redirect even if there's an error
      localStorage.removeItem('questionsObj');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex md:flex-col md:items-center h-full p-5 md:p-10">
      <div className="flex items-center justify-between flex-col gap-4 ">
        <div className="mt-25 md:mt-0">
          <div className="flex items-center justify-center flex-col gap-0">
            <Image
              src="/ELO-Learning-Mascot.png"
              width={300}
              height={300}
              className="hidden md:block"
              alt="ELO Learning Mascot"
              priority
            />
            <Image
              src="/ELO-Learning-Mascot.png"
              width={200}
              height={200}
              className="block md:hidden"
              alt="ELO Learning Mascot"
              priority
            />
            <h1 className="text-2xl font-bold">
              {isWinner ? 'Winner' : 'Defeat'}
            </h1>
            <p className="text-center m-5 md:m-1">
              {isWinner
                ? 'Congratulations! You are doing an amazing job!'
                : 'Keep practicing! You are improving every day!'}
            </p>
          </div>
          <div className="flex flex-row items-center justify-center gap-8 my-7">
            <TotalXP />
            <Score />
            <Time />
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-5">
          <button
            className="secondary-button w-full uppercase"
            onClick={clearStorageAndRedirect}
            disabled={isLoading}
          >
            {isLoading ? 'Claiming XP...' : 'Claim XP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MatchEndScreenContent />
    </Suspense>
  );
}
