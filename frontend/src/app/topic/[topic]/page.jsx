'use client';
import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { fetchQuestionsByLevelAndTopic } from '@/services/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function PracticeTopic() {
  const { topic } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/api/auth/signin');
      return;
    }

    const loadQuestions = async () => {
      try {
        const level = session.user.currentLevel || 1;
        const apiResponse = await fetchQuestionsByLevelAndTopic(level, topic);

        console.log('API Response:', apiResponse);
        setQuestions(apiResponse);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topic, session, status, router]);

  const submitCallback = async () => {
    router.push('/end-screen?mode=practice');
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error Loading Questions</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/practice" className="text-blue-500 hover:underline">
          ← Back to Practice
        </Link>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
        <p className="mb-4">
          There are no questions available for {decodeURIComponent(topic)} at
          your current level.
        </p>
        <Link href="/practice" className="text-blue-500 hover:underline">
          ← Back to Practice
        </Link>
      </div>
    );
  }

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <QuestionsTracker
        questions={questions}
        userId={session.user.id}
        gameType="practice"
        submitCallback={submitCallback}
      />
    </div>
  );
}
