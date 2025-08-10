// ui/answers/answer-wrapper.jsx
import ExpressionBuilderTemplate from '@/app/ui/answers/expression-builder';
import MathInputTemplate from '@/app/ui/answers/input-question';
import MultipleChoiceTemplate from '@/app/ui/answers/multiple-choice';
import OpenResponseTemplate from '@/app/ui/answers/open-response';
import FillInBlankTemplate from '@/app/ui/question-types/fill-in-blank';
import MatchQuestionTemplate from '@/app/ui/question-types/match-question';
import { validateAnswerEnhanced } from '@/utils/answerValidator';
import { Check, X } from 'lucide-react';

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
  const handleAnswerValidation = async (studentAnswer) => {
    if (!studentAnswer || !currAnswers || currAnswers.length === 0) {
      setIsAnswerCorrect(false);
      return;
    }

    // Special handling for Open Response questions
    if (question.type === 'Open Response') {
      // For Open Response, we'll check against ALL correct answers like multiple choice
      const correctAnswers = currAnswers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.answer_text || answer.answerText)
        .filter(Boolean);

      if (correctAnswers.length === 0) {
        // If no correct answers defined, accept any non-empty response
        setIsAnswerCorrect(studentAnswer.trim().length > 0);
        return;
      }

      console.log('Open Response validation:', {
        student: studentAnswer,
        correctAnswers,
        isCorrect: false,
        questionText: question.questionText
      });

      // Check if student answer matches ANY of the correct answers (like multiple choice)
      let isCorrect = false;
      let matchedAnswer = null;

      for (const correctAnswer of correctAnswers) {
        const individualResult = await validateAnswerEnhanced(
          studentAnswer,
          correctAnswer,
          question.questionText || '',
          question.type || '',
        );

        if (individualResult) {
          isCorrect = true;
          matchedAnswer = correctAnswer;
          break; // Found a match, no need to check further
        }
      }

      console.log('Open Response validation result:', {
        student: studentAnswer,
        correctAnswers: correctAnswers,
        isCorrect: isCorrect,
        matchedAnswer: matchedAnswer,
        questionText: question.questionText
      });

      setIsAnswerCorrect(isCorrect);
      return;
    }

    // Original validation logic for other question types
    // Get ALL correct answers, not just the first one
    const correctAnswers = currAnswers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.answer_text || answer.answerText)
      .filter(Boolean); // Remove any null/undefined values

    if (correctAnswers.length === 0) {
      console.warn('No correct answers found in currAnswers:', currAnswers);
      setIsAnswerCorrect(false);
      return;
    }

    console.log('Checking student answer against all correct answers:', {
      student: studentAnswer,
      correctAnswers: correctAnswers,
      questionText: question.questionText,
    });

    // Check if student answer matches ANY of the correct answers
    let isCorrect = false;
    let matchedAnswer = null;

    for (const correctAnswer of correctAnswers) {
      const individualResult = await validateAnswerEnhanced(
        studentAnswer,
        correctAnswer,
        question.questionText || '',
        question.type || '',
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
      matchedAnswer: matchedAnswer,
    });

    setIsAnswerCorrect(isCorrect);
  };

  // Helper function to get all correct answers as an array
  const getAllCorrectAnswers = () => {
    return currAnswers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.answer_text || answer.answerText)
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

      {/* Fill in the Blank */}
      {(question.type === 'Fill-in-the-Blank' || question.type === 'Fill-in-the-Blanks') && (
        <FillInBlankTemplate
          question={question}
          answers={currAnswers}
          setAnswer={(answer) => {
            setAnswer(answer);
            handleAnswerValidation(answer);
          }}
          setIsAnswerCorrect={setIsAnswerCorrect}
          answer={answer}
        />
      )}

      {/* Match Question */}
      {(question.type === 'Match Question' || question.type === 'Matching') && (
        <MatchQuestionTemplate
          question={question}
          answers={currAnswers}
          setAnswer={(answer) => {
            setAnswer(answer);
            // Note: Match questions handle their own validation via setIsAnswerCorrect
            // so we don't call handleAnswerValidation here to avoid conflicts
          }}
          setIsAnswerCorrect={setIsAnswerCorrect}
          answer={answer}
        />
      )}

      {/* True/False Questions */}
      {(question.type === 'True/False' || question.type === 'True-False') && (
        <div className="space-y-6">
          {/* True/False Options - styled exactly like multiple choice */}
          <div className="flex flex-col gap-4 md:gap-2 items-center">
            {[
              { id: 'true', answer_text: 'True', isCorrect: false },
              { id: 'false', answer_text: 'False', isCorrect: false }
            ].map((option) => {
              // Determine if this option is correct based on the currAnswers from database
              let isOptionCorrect = false;
              if (currAnswers && currAnswers.length > 0) {
                const correctAnswerObj = currAnswers.find(ans => ans.isCorrect);
                if (correctAnswerObj) {
                  isOptionCorrect = option.answer_text.toLowerCase() === correctAnswerObj.answer_text?.toLowerCase();
                }
              }

              const isSelected = answer === option.answer_text;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setAnswer(option.answer_text);
                    
                    // Use the enhanced validation function
                    handleAnswerValidation(option.answer_text);
                  }}
                  className={`mc-button px-4 py-5 w-48 flex items-center justify-center gap-2 ${
                    isSelected ? 'opacity-80' : ''
                  }`}
                >
                  {option.answer_text === 'True' ? (
                    <Check size={24} className="text-white" />
                  ) : (
                    <X size={24} className="text-white" />
                  )}
                  <span>{option.answer_text}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Answer Indicator */}
          {answer && (
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                answer === 'True' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {answer === 'True' ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <X size={16} className="text-red-600" />
                )}
                <span className="font-semibold">You selected: {answer}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback for Unknown Question Types */}
      {![
        'Multiple Choice',
        'Math Input',
        'Open Response',
        'Expression Builder',
        'Fill-in-the-Blank',
        'Match Question',
        'Matching',
        'True/False',
        'True-False',
      ].includes(question.type) && (
        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Unknown Question Type
          </h3>
          <p className="text-yellow-700">
            Question type "{question.type}" is not yet supported.
          </p>

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
