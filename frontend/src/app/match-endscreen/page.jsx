'use client';
import Score from '@/app/ui/end-screen-ui/end-screen-score';
import Time from '@/app/ui/end-screen-ui/end-screen-total-time';
import TotalXP from '@/app/ui/end-screen-ui/end-screen-total-xp';
import Image from 'next/image';
import { redirect, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const searchParams = useSearchParams();
  const result = searchParams.get('result');
  const [isWinner, setIsWinner] = useState(result === 'winner');

  const clearStorageAndRedirect = () => {
    localStorage.removeItem('questionsObj');
    redirect(`/dashboard`);
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
          >
            Claim xp
          </button>
        </div>
      </div>
    </div>
  );
}
