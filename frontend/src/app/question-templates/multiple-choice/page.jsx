import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { getQuestionsByType } from '@/utils/api';

export default async function MultipleChoicePage() {
  const result = await getQuestionsByType('Multiple Choice');
  
  if (!result.success) {
    return <div>Error loading questions</div>;
  }

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <QuestionsTracker
        questions={result.data}
        lives={5}
        mode="practice"
        // Removed submitCallback prop
      />
    </div>
  );
}