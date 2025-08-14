import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Create server-safe API call (no caching)
async function fetchQuestionsByLevelAndTopicServer(level, topic) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/questions/level/topic?level=${level}&topic=${encodeURIComponent(topic)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Server-side question fetch failed:', error);
    return [];
  }
}

export default async function PracticeTopic({ params }) {
  const { topic } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const level = session.user.currentLevel || 1;
  const apiResponse = await fetchQuestionsByLevelAndTopicServer(level, topic); // Use server-safe version

  console.log('API Response:', apiResponse);

  let questions = [];
  if (Array.isArray(apiResponse)) {
    questions = apiResponse;
  } else if (apiResponse && typeof apiResponse === 'object') {
    questions = apiResponse.questions || apiResponse.data || [];
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-600">
            No Questions Available
          </h2>
          <p className="text-gray-600 mb-4">
            No questions found for this topic at level {level}.
          </p>
          <a href="/practice" className="text-blue-600 hover:underline">
            Back to Practice
          </a>
        </div>
      </div>
    );
  }

  const shuffledQuestions = questions
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  const submitCallback = async () => {
    'use server';
    redirect('/end-screen?mode=practice');
  };

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