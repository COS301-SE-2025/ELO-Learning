import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Create server-safe API call (no caching)
async function fetchRandomQuestionsServer(level) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/questions/random?level=${level}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    return await response.json();
  } catch (error) {
    console.error('Server-side question fetch failed:', error);
    return { questions: [] };
  }
}

export default async function SinglePlayerGame() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const level = session.user.currentLevel || 1;
  const questions = await fetchRandomQuestionsServer(level); // Use server-safe version

  const submitCallback = async () => {
    'use server';
    redirect('/end-screen?mode=single-player');
  };

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <QuestionsTracker
        questions={questions.questions}
        submitCallback={submitCallback}
        lives={5}
        mode="single-player"
      />
    </div>
  );
}
