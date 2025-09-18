import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { authOptions } from '@/lib/auth';
import { fetchQuestionsByLevelAndTopic } from '@/services/api';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PracticeTopic({ params }) {
  const { topic } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const level = session.user.currentLevel || 1;
  const apiResponse = await fetchQuestionsByLevelAndTopic(level, topic);

  // Debug: Log what we're getting from the API
  console.log('API Response:', apiResponse);
  console.log('Type of response:', typeof apiResponse);
  console.log('Is array:', Array.isArray(apiResponse));

  const submitCallback = async () => {
    'use server';
    redirect('/end-screen?mode=practice');
  };

  // Handle different response formats
  let questions = [];
  if (Array.isArray(apiResponse)) {
    questions = apiResponse;
  } else if (apiResponse && typeof apiResponse === 'object') {
    // Maybe the questions are nested in the response object
    questions = apiResponse.questions || apiResponse.data || [];
  }

  // Defensive check
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#7d32ce]">
            No Questions Available
          </h2>
          <p className="mb-4">
            No questions found for this topic at level {level}.
          </p>
          <Link href="/practice" className="main-button py-2 px-4">
            <button className="py-2 px-4">Back to Practice</button>
          </Link>
        </div>
      </div>
    );
  }

  // Shuffle questions and limit to reasonable number
  const shuffledQuestions = questions
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <QuestionsTracker
        questions={shuffledQuestions}
        submitCallback={submitCallback}
        lives={5}
        mode="practice"
      />
    </div>
  );
}
