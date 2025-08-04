import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { authOptions } from '@/lib/auth';
import { fetchQuestionsByLevelAndTopic } from '@/services/api';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';


export default async function PracticeTopic({ params }) {
  const { topic } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const level = session.user.currentLevel || 1;
  const questions = await fetchQuestionsByLevelAndTopic(level, topic);

  const submitCallback = async () => {
    'use server';
    redirect('/end-screen?mode=practice');
  };

  // Defensive check
  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-600">No Questions Available</h2>
          <p className="text-gray-600 mb-4">
            No questions found for this topic. We tried levels {levelsToTry.join(', ')}.
          </p>
          <a href="/practice" className="text-blue-600 hover:underline">
            Back to Practice
          </a>
        </div>
      </div>
    );
  }

  // Shuffle questions and limit to reasonable number
  const shuffledQuestions = allQuestions
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