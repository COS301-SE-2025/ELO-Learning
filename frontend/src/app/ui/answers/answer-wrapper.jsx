import MathInputTemplate from '@/app/ui/answers/input-question';
import MultipleChoiceTemplate from '@/app/ui/answers/multiple-choice';
export default function AnswerWrapper({
  question,
  currAnswers,
  setAnswer,
  setStudentAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  answer,
}) {
  return (
    <div className="m-2">
      {/* Multiple Choice template for MC question types */}
      {question.type === 'Multiple Choice' && (
        <MultipleChoiceTemplate
          answers={currAnswers}
          setSelectedAnswer={setAnswer}
          setIsSelectedAnswerCorrect={setIsAnswerCorrect}
        />
      )}
      {question.type === 'Math Input' && (
        <MathInputTemplate
          correctAnswer={currAnswers[0].answer_text}
          setStudentAnswer={setAnswer}
          setIsAnswerCorrect={setIsAnswerCorrect}
          setIsValidExpression={setIsValidExpression}
          studentAnswer={answer}
        />
      )}
    </div>
  );
}
