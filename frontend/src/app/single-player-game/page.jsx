import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { authOptions } from '@/lib/auth';
import { fetchRandomQuestions } from '@/services/api';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function SinglePlayerGame() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const level = Math.min(session.user.currentLevel || 1, 7); // Cap at level 7 since level 8+ don't exist
  
  let questions;
  try {
    console.log('Attempting to fetch questions for level:', level);
    questions = await fetchRandomQuestions(level);
    
    // Ensure we have questions
    if (!questions || !questions.questions || questions.questions.length === 0) {
      console.error('No questions returned from API for level:', level);
      // Try fallback to level 1
      console.log('Trying fallback to level 1...');
      questions = await fetchRandomQuestions(1);
      
      // If still no questions, throw error
      if (!questions || !questions.questions || questions.questions.length === 0) {
        throw new Error('No questions available even at level 1');
      }
    }
    
    console.log('Successfully fetched questions:', questions.questions.length);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    // Redirect to home or show error page
    redirect('/?error=no-questions');
  }
  const submitCallback = async () => {
    'use server';
    redirect('/end-screen?mode=single-player');
  };

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      {/* <ClientWrapper questions={questions.questions} /> */}
      <QuestionsTracker
        questions={questions.questions}
        submitCallback={submitCallback}
        lives={5}
        mode="single-player"
      />
    </div>
  );
}
