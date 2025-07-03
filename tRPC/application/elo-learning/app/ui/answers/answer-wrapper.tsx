import MathInputTemplate from '@/app/ui/answers/input-question';
import MultipleChoiceTemplate from '@/app/ui/answers/multiple-choice';
import { Question as ApiQuestion } from '@/services/api';
import { Dispatch, SetStateAction } from 'react';

interface Answer {
  id: number;
  answer_text: string;
  isCorrect: boolean;
}

interface AnswerWrapperProps {
  question: ApiQuestion;
  currAnswers: Answer[];
  setAnswer: Dispatch<SetStateAction<string>>;
  setIsAnswerCorrect: Dispatch<SetStateAction<boolean>>;
  setIsValidExpression?: Dispatch<SetStateAction<boolean>>;
  answer: string;
}

export default function AnswerWrapper({
  question,
  currAnswers,
  setAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  answer,
}: AnswerWrapperProps) {
  const questionType = question.type;

  if (currAnswers.length === 0) {
    return (
      <div className="m-2">
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
          <p>No answers available for this question</p>
          <p>Question ID: {question.id}</p>
          <p>Type: {questionType}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2">
      {/* Multiple Choice template for MC question types */}
      {questionType === 'Multiple Choice' && (
        <MultipleChoiceTemplate
          answers={currAnswers}
          setSelectedAnswer={setAnswer}
          setIsSelectedAnswerCorrect={setIsAnswerCorrect}
        />
      )}
      {questionType === 'Math Input' && (
        <MathInputTemplate
          correctAnswer={currAnswers[0].answer_text}
          setStudentAnswer={setAnswer}
          setIsAnswerCorrect={setIsAnswerCorrect}
          setIsValidExpression={setIsValidExpression}
          studentAnswer={answer}
        />
      )}
      {/* Fallback for unknown types
      {questionType !== 'Multiple Choice' && questionType !== 'Math Input' && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p>Unknown question type: "{questionType}"</p>
          <p>Defaulting to Multiple Choice</p>
          <MultipleChoiceTemplate
            answers={currAnswers}
            setSelectedAnswer={setAnswer}
            setIsSelectedAnswerCorrect={setIsAnswerCorrect}
          />
        </div>
      )} */}
    </div>
  );
}
