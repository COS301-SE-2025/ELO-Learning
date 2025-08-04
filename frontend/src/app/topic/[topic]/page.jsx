import { getCookie } from '@/app/lib/authCookie';
import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { fetchQuestionsByLevelAndTopic } from '@/services/api';
import { redirect } from 'next/navigation';

export default async function PracticeTopic({ params }) {
  const { topic } = await params;
  const authCookie = await getCookie();
  const userLevel = authCookie.user.currentLevel;
  
  console.log('User level:', userLevel, 'Topic:', topic);
  
  // Try to fetch questions from multiple levels (current level and below)
  let allQuestions = [];
  const levelsToTry = [];
  
  // Create array of levels to try (current level down to 1, but also include higher levels)
  for (let i = Math.max(1, userLevel - 2); i <= userLevel + 2; i++) {
    levelsToTry.push(i);
  }
  
  console.log('Trying levels:', levelsToTry);
  
  // Fetch questions from multiple levels
  for (const level of levelsToTry) {
    try {
      const questions = await fetchQuestionsByLevelAndTopic(level, topic);
      if (questions?.questions && questions.questions.length > 0) {
        console.log(`Found ${questions.questions.length} questions at level ${level}`);
        allQuestions = [...allQuestions, ...questions.questions];
      }
    } catch (error) {
      console.log(`No questions found for level ${level}:`, error.message);
    }
  }
  
  console.log('Total questions found:', allQuestions.length);
  console.log('First question:', allQuestions[0]);
  console.log('First question answers:', allQuestions[0]?.answers);

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