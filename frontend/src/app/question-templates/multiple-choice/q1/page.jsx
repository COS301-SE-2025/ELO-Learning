import MCTemplate from '@/app/ui/mc-template';
import ProgressBar from '@/app/ui/progress-bar';
import QuestionTemplate from '@/app/ui/question-template';
import questions from '@/utils/questions';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';

const currentStep = 1;
const totalSteps = 3;

export default function Page() {
  // Get the first question
  const firstQuestion = questions[0];

  return (
    <div className="full-screen w-full min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex flex-row items-center justify-between w-full py-2 gap-2">
          <Link href="/dashboard">
            <X size={24} />
          </Link>
          <div className="flex-1">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
            <p>5</p>
          </div>
        </div>
        <div>
          <QuestionTemplate
            question={firstQuestion.question}
            calculation={firstQuestion.calculation}
          />
        </div>
        <div className="m-2">
          <Link href="/question-templates/multiple-choice/q2">
            <MCTemplate answers={firstQuestion.answers} />
          </Link>
        </div>
      </div>
    </div>
  );
}
