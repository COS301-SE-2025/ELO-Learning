// ui/answers/answer-wrapper.jsx
import MathInputTemplate from '@/app/ui/answers/input-question';
import MultipleChoiceTemplate from '@/app/ui/answers/multiple-choice';
import OpenResponseTemplate from '@/app/ui/answers/open-response';
import ExpressionBuilderTemplate from '@/app/ui/answers/expression-builder';
import { validateAnswer } from '@/utils/answerValidator';

export default function AnswerWrapper({
  question,
  currAnswers,
  setAnswer,
  setStudentAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  answer,
}) {
  // Debug logging to see what question type we're handling
  console.log('Question type:', question.type);
  console.log('All available answers:', currAnswers);

  // Enhanced validation function that considers ALL correct answers
  const handleAnswerValidation = (studentAnswer) => {
    if (!studentAnswer || !currAnswers || currAnswers.length === 0) {
      setIsAnswerCorrect(false);
      return;
    }

    // Get ALL correct answers, not just the first one
    const correctAnswers = currAnswers
      .filter(answer => answer.isCorrect)
      .map(answer => answer.answer_text || answer.answerText)
      .filter(Boolean); // Remove any null/undefined values

    if (correctAnswers.length === 0) {
      console.warn('No correct answers found in currAnswers:', currAnswers);
      setIsAnswerCorrect(false);
      return;
    }

    console.log('Checking student answer against all correct answers:', {
      student: studentAnswer,
      correctAnswers: correctAnswers,
      questionText: question.questionText
    });

    // Check if student answer matches ANY of the correct answers
    let isCorrect = false;
    let matchedAnswer = null;

    for (const correctAnswer of correctAnswers) {
      const individualResult = validateAnswer(
        studentAnswer, 
        correctAnswer, 
        question.questionText || '', 
        question.type || ''
      );
      
      if (individualResult) {
        isCorrect = true;
        matchedAnswer = correctAnswer;
        break; // Found a match, no need to check further
      }
    }
    
    console.log('Validation result:', {
      student: studentAnswer,
      correctAnswers: correctAnswers,
      questionText: question.questionText,
      isCorrect: isCorrect,
      matchedAnswer: matchedAnswer
    });
    
    setIsAnswerCorrect(isCorrect);
  };

  // Helper function to get all correct answers as an array
  const getAllCorrectAnswers = () => {
    return currAnswers
      .filter(answer => answer.isCorrect)
      .map(answer => answer.answer_text || answer.answerText)
      .filter(Boolean);
  };

  return (
    <div className="m-2">
      {/* Multiple Choice Questions */}
      {question.type === 'Multiple Choice' && (
        <MultipleChoiceTemplate
          answers={currAnswers}
          setSelectedAnswer={setAnswer}
          setIsSelectedAnswerCorrect={setIsAnswerCorrect}
        />
      )}

      {/* Math Input Questions - Now with ALL correct answers */}
      {question.type === 'Math Input' && (
        <MathInputTemplate
          correctAnswers={getAllCorrectAnswers()} // Pass all correct answers
          correctAnswer={currAnswers[0]?.answer_text} // Keep for backward compatibility
          setStudentAnswer={(answer) => {
            setAnswer(answer);
            handleAnswerValidation(answer);
          }}
          setIsAnswerCorrect={setIsAnswerCorrect}
          setIsValidExpression={setIsValidExpression}
          studentAnswer={answer}
          questionText={question.questionText}
        />
      )}

      {/* Open Response Questions */}
      {question.type === 'Open Response' && (
        <OpenResponseTemplate
          setAnswer={(answer) => {
            setAnswer(answer);
            handleAnswerValidation(answer);
          }}
          answer={answer}
          setIsAnswerCorrect={setIsAnswerCorrect}
        />
      )}

      {/* Expression Builder - Enhanced validation */}
      {question.type === 'Expression Builder' && (
        <ExpressionBuilderTemplate
          question={question}
          setAnswer={(answer) => {
            setAnswer(answer);
            handleAnswerValidation(answer);
          }}
          answer={answer}
          setIsAnswerCorrect={setIsAnswerCorrect}
        />
      )}

      {/* Fill in the Blank - Future Implementation */}
      {question.type === 'Fill-in-the-Blank' && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Fill in the Blank</h3>
          <p className="text-gray-600">Interactive blanks coming soon!</p>
        </div>
      )}

      {/* Fallback for Unknown Question Types */}
      {!['Multiple Choice', 'Math Input', 'Open Response', 'Expression Builder', 'Fill-in-the-Blank'].includes(question.type) && (
        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Unknown Question Type</h3>
          <p className="text-yellow-700">Question type "{question.type}" is not yet supported.</p>
          
          {/* Basic fallback input with enhanced validation */}
          <div className="mt-4">
            <input
              type="text"
              value={answer || ''}
              onChange={(e) => {
                const newAnswer = e.target.value;
                setAnswer(newAnswer);
                handleAnswerValidation(newAnswer);
              }}
              placeholder="Enter your answer..."
              className="w-full max-w-md mx-auto p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}