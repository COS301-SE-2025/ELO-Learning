import { getCookie } from '@/app/lib/authCookie';
import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import {
  fetchQuestionsWithAnswersByTopic,
  Question as ApiQuestion,
} from '@/services/api';
import { redirect } from 'next/navigation';
import { ReactElement } from 'react';

interface PracticeTopicProps {
  params: Promise<{
    topic: string;
  }>;
}

export default async function PracticeTopic({
  params,
}: PracticeTopicProps): Promise<ReactElement> {
  const { topic } = await params;
  const authCookie = await getCookie();

  if (!authCookie.user) {
    redirect('/login');
    return <></>;
  }

  const level = authCookie.user.currentLevel;

  // Fetch all questions for the topic and filter by level on the frontend
  // This is a temporary fix until the backend endpoint is corrected
  try {
    // Decode the topic name from URL encoding
    const decodedTopic = decodeURIComponent(topic);

    const allQuestions = await fetchQuestionsWithAnswersByTopic(decodedTopic);

    // Check if allQuestions is valid and is an array
    if (!allQuestions || !Array.isArray(allQuestions)) {
      return <div>No questions available for this topic.</div>;
    }

    // Filter questions by level with fallback logic
    let questions = allQuestions.filter((q: ApiQuestion) => q.level <= level);

    // If no questions at or below current level, allow questions up to 2 levels above
    if (questions.length === 0) {
      questions = allQuestions.filter((q: ApiQuestion) => q.level <= level + 2);
    }

    // If still no questions, show all questions (last resort)
    if (questions.length === 0) {
      questions = allQuestions;
    }

    if (questions.length === 0) {
      return (
        <div>
          <p>No questions available for this topic.</p>
        </div>
      );
    }

    const submitCallback = async (): Promise<void> => {
      'use server';
      redirect('/end-screen?mode=practice');
    };

    return (
      <div className="full-screen w-full h-full flex flex-col justify-between">
        {/* <ClientWrapper questions={questions} /> */}
        <QuestionsTracker
          questions={questions}
          submitCallback={submitCallback}
          lives={5}
          mode="practice"
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading questions:', error);
    return <div>Error loading questions. Please try again later.</div>;
  }
}
