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

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      {/* <ClientWrapper questions={questions.questions} /> */}
      <QuestionsTracker
        questions={questions.questions}
        submitCallback={submitCallback}
        lives={5}
        mode="practice"
      />
    </div>
  );
}
