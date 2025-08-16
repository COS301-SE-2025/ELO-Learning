import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { fetchAllBaselineQuestions } from '@/services/api';
import BaselineGameClient from './baseline-game-client';

export default async function BaselineGamePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  // Fetch all baseline questions
  const allQuestions = await fetchAllBaselineQuestions();
  console.log('Baseline questions fetched:', allQuestions);
  
  if (!allQuestions || allQuestions.length === 0) {
    throw new Error('No questions available');
  }
  
  // Ensure we have the correct structure for the questions
  const questions = allQuestions.map(q => ({
    ...q,
    answers: q.answers || q.Answers || [], // Normalize the answers property
    level: q.level || 5 // Ensure each question has a level
  }));

  return <BaselineGameClient questions={questions} userId={session.user.id} />;
}
