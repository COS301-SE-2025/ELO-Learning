import { getCookie } from '@/app/lib/authCookie';
import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { fetchQuestionsByLevelAndTopic } from '@/services/api';
export default async function PracticeTopic({ params }) {
  console.log('Params: ', params);
  const { topic } = await params;
  const authCookie = await getCookie();
  const level = authCookie.user.currentLevel;
  console.log('Current Level:', level);
  console.log('Topic:', topic);
  const questions = await fetchQuestionsByLevelAndTopic(level, topic);
  console.log(questions.questions);

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      {/* <ClientWrapper questions={questions.questions} /> */}
      <QuestionsTracker questions={questions.questions} />
    </div>
  );
}
