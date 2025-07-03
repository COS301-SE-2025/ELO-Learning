import { getCookie } from '@/app/lib/authCookie';
import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { fetchRandomQuestions } from '@/services/api';
import { redirect } from 'next/navigation';
import { ReactElement } from 'react';

export default async function SinglePlayerGame(): Promise<ReactElement> {
  const authCookie = await getCookie();

  if (!authCookie.user) {
    redirect('/login');
    return <></>;
  }

  const level = authCookie.user.currentLevel;
  const questions = await fetchRandomQuestions(level);

  const submitCallback = async (): Promise<void> => {
    'use server';
    redirect('/end-screen?mode=single-player');
  };

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      {/* <ClientWrapper questions={questions} /> */}
      <QuestionsTracker
        questions={questions}
        submitCallback={submitCallback}
        lives={5}
        mode="single-player"
      />
    </div>
  );
}
