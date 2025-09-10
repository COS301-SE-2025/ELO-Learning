// ui/answers/answer-wrapper.jsx
import ExpressionBuilderTemplate from '@/app/ui/answers/expression-builder';
import MathInputTemplate from '@/app/ui/answers/input-question';
import MultipleChoiceTemplate from '@/app/ui/answers/multiple-choice';
import OpenResponseTemplate from '@/app/ui/answers/open-response';
import MatchQuestionTemplate from '@/app/ui/question-types/match-question';
import { validateAnswerEnhanced } from '@/utils/answerValidator';
import { Check, X } from 'lucide-react';
import { useCallback, useRef } from 'react';

export default function AnswerWrapper({
  question,
  currAnswers,
  setAnswer,
  setStudentAnswer,
  setIsAnswerCorrect,
  setIsValidExpression,
  answer,
}) {
  // Use refs to prevent infinite validation loops
  const lastValidatedAnswer = useRef(null);
  const validationInProgress = useRef(false);

  // Debug logging to see what question type we're handling
  // console.log('Question type:', question.type);
  // console.log('All available answers:', currAnswers);

  // NEW: Validate answer format for specific question types
  const validateAnswerFormat = (studentAnswer, questionType, questionText) => {
    const cleanAnswer = studentAnswer.trim();

    // console.log('🔍 Validating answer format:', {
    //   studentAnswer,
    //   questionType,
    //   questionText: questionText?.substring(0, 50),
    // });

    // For Expression Builder questions expecting equations
    if (questionType === 'Expression Builder') {
      // If question asks for equation of line, expect proper equation format
      if (questionText.toLowerCase().includes('equation of')) {
        // Must contain variables and operators, not just numbers
        const hasVariables = /[a-zA-Z]/.test(cleanAnswer);
        const hasOperators = /[+\-=]/.test(cleanAnswer);
        const isJustNumbers = /^\d+(\s+\d+)*$/.test(cleanAnswer);

        if (isJustNumbers || (!hasVariables && !hasOperators)) {
          // console.log(
          //   '❌ Expression Builder expects equation format, got just numbers:',
          //   cleanAnswer,
          // );
          return false;
        }

        // Must have = sign for equations
        if (!cleanAnswer.includes('=')) {
          // console.log('❌ Equation expected but no = sign found:', cleanAnswer);
          return false;
        }
      }

      // For slope-intercept or point-slope form, expect proper variables
      if (
        questionText.toLowerCase().includes('slope') &&
        questionText.toLowerCase().includes('line')
      ) {
        const hasY = /y/.test(cleanAnswer);
        const hasX = /x/.test(cleanAnswer);

        if (!hasY || !hasX) {
          // console.log(
          //   '❌ Line equation expected y and x variables:',
          //   cleanAnswer,
          // );
          return false;
        }
      }
    }

    // For Math Input - allow numbers but validate they're reasonable
    if (questionType === 'Math Input') {
      // Should be a number or simple mathematical expression
      const isValidMathInput =
        /^[0-9+\-*/().x\s=]+$/.test(cleanAnswer) ||
        /^\d+(\.\d+)?$/.test(cleanAnswer);
      if (!isValidMathInput) {
        // console.log(
        //   '❌ Math Input expects numerical format, got:',
        //   cleanAnswer,
        // );
        return false;
      }

      // For evaluation questions, expect a numerical result
      if (questionText.toLowerCase().includes('evaluate')) {
        const isNumber = /^\d+(\.\d+)?$/.test(cleanAnswer);
        if (!isNumber) {
          // console.log(
          //   '❌ Evaluation question expects numerical answer:',
          //   cleanAnswer,
          // );
          return false;
        }
      }
    }

    // For Open Response - more lenient but still check for basic validity
    if (questionType === 'Open Response') {
      if (cleanAnswer.length === 0) {
        // console.log('❌ Open Response cannot be empty');
        return false;
      }
    }

    console.log('✅ Answer format is valid for question type');
    return true;
  };

  // Enhanced validation function that considers ALL correct answers
  const handleAnswerValidation = useCallback(
    async (studentAnswer) => {
      // Prevent validation if already in progress or same answer
      if (
        validationInProgress.current ||
        lastValidatedAnswer.current === studentAnswer
      ) {
        return;
      }

      if (!studentAnswer || !currAnswers || currAnswers.length === 0) {
        setIsAnswerCorrect(false);
        lastValidatedAnswer.current = studentAnswer;
        return;
      }

      // Set validation in progress
      validationInProgress.current = true;
      lastValidatedAnswer.current = studentAnswer;

      try {
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

        // console.log('Checking student answer against all correct answers:', {
        //   student: studentAnswer,
        //   correctAnswers: correctAnswers,
        //   questionText: question.questionText,
        // });

        // STEP 1: Check if answer format makes sense for question type
        const isValidFormat = validateAnswerFormat(
          studentAnswer,
          question.type,
          question.questionText,
        );

        if (!isValidFormat) {
          // console.log(
          //   '❌ Answer format validation failed - marking as incorrect',
          // );
          setIsAnswerCorrect(false);
          return;
        }

        // STEP 2: Check if student answer matches ANY of the correct answers
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

        console.log('Final validation result:', {
          student: studentAnswer,
          correctAnswers: correctAnswers,
          questionText: question.questionText,
          formatValid: isValidFormat,
          isCorrect: isCorrect,
          matchedAnswer: matchedAnswer,
        });

        // Only mark correct if BOTH format is valid AND content matches
        setIsAnswerCorrect(isCorrect && isValidFormat);
      } catch (error) {
        console.error('Validation error:', error);
        setIsAnswerCorrect(false);
      } finally {
        // Reset validation flag
        validationInProgress.current = false;
      }
    },
    [currAnswers, question.questionText, question.type, setIsAnswerCorrect],
  );

  // Helper function to get all correct answers as an array
  const getAllCorrectAnswers = () => {
    return currAnswers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.answer_text || answer.answerText)
      .filter(Boolean);
  };

  // Debounced answer handler to prevent rapid validation calls
  const handleAnswerChange = useCallback(
    (newAnswer) => {
      setAnswer(newAnswer);

      // Only validate if answer actually changed
      if (newAnswer !== lastValidatedAnswer.current) {
        // Add small delay to prevent rapid fire validation
        setTimeout(() => {
          handleAnswerValidation(newAnswer);
        }, 150);
      }
    },
    [setAnswer, handleAnswerValidation],
  );

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
          setStudentAnswer={handleAnswerChange}
          setIsAnswerCorrect={setIsAnswerCorrect}
          setIsValidExpression={setIsValidExpression}
          studentAnswer={answer}
          questionText={question.questionText}
        />
      )}

      {/* Open Response Questions */}
      {question.type === 'Open Response' && (
        <OpenResponseTemplate
          setAnswer={handleAnswerChange}
          answer={answer}
          setIsAnswerCorrect={setIsAnswerCorrect}
        />
      )}

      {/* Expression Builder - Enhanced validation */}
      {question.type === 'Expression Builder' && (
        <ExpressionBuilderTemplate
          question={question}
          setAnswer={handleAnswerChange}
          answer={answer}
          setIsAnswerCorrect={setIsAnswerCorrect}
        />
      )}

      {/* Fill in the Blank - Not implemented */}
      {(question.type === 'Fill-in-the-Blank' ||
        question.type === 'Fill-in-the-Blanks') && (
        <div className="text-center p-8">
          <p className="text-yellow-600 font-medium">
            Fill-in-the-blank questions are not yet implemented.
          </p>
        </div>
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
              { id: 'false', answer_text: 'False', isCorrect: false },
            ].map((option) => {
              // Determine if this option is correct based on the currAnswers from database
              let isOptionCorrect = false;
              if (currAnswers && currAnswers.length > 0) {
                const correctAnswerObj = currAnswers.find(
                  (ans) => ans.isCorrect,
                );
                if (correctAnswerObj) {
                  isOptionCorrect =
                    option.answer_text.toLowerCase() ===
                    correctAnswerObj.answer_text?.toLowerCase();
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
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full max-w-md mx-auto p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
