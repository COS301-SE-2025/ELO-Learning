import MCTemplate from '@/app/ui/mc-template';
import ProgressBar from '@/app/ui/progress-bar';
import QuestionTemplate from '@/app/ui/question-template';
import questions from '@/utils/questions';
import Link from 'next/link';

const currentStep = 3;
const totalSteps = 3;

export default function Page() {
  // Get the first question
  const firstQuestion = questions[2];

  return (
    <div className="full-screen w-full min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex flex-row items-center justify-between w-full px-4 py-2">
          <div className="flex-1 ml-4">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
        </div>
        <div>
          <QuestionTemplate
            question={firstQuestion.question}
            calculation={firstQuestion.calculation}
          />
        </div>
        <div className="m-200">
          <Link href="/practice">
            <MCTemplate answers={firstQuestion.answers} />
          </Link>
        </div>
      </div>
    </div>
  );
}
