'use client';
import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { fetchRandomQuestions } from '@/services/api';
import { resetXPCalculationState } from '@/utils/gameSession';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';

function SinglePlayerGameContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const level = parseInt(searchParams.get('level')) || 1;

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const loadQuestions = async () => {
      try {
        setLoading(true);
        resetXPCalculationState();

        console.log(`⚡ Fetching questions for level: ${level}`);
        const questionsData = await fetchRandomQuestions(level);

        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions available for this level');
        }

        setQuestions(questionsData);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [session, status, router, level]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF6E99] mx-auto"></div>
          <p className="mt-4 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Questions</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <QuestionsTracker
      questions={questions}
      userId={session.user.id}
      mode="singleplayer"
    />
  );
}

export default function SinglePlayerGame() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SinglePlayerGameContent />
    </Suspense>
  );
}
