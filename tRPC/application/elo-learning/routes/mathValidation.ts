// routes/math.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabaseClient';

const router = Router();

// Placeholder for math validator - you'll need to implement this
const backendMathValidator = {
  validateAnswer: (studentAnswer: string, correctAnswer: string): boolean => {
    // Simple comparison for now - replace with actual math validation logic
    return (
      studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    );
  },
  quickValidate: (studentAnswer: string, correctAnswer: string): boolean => {
    return (
      studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    );
  },
  isValidMathExpression: (expression: string): boolean => {
    // Basic validation - replace with actual math expression validation
    return expression.trim().length > 0;
  },
  getValidationMessage: (expression: string): string => {
    return expression.trim().length > 0
      ? 'Valid expression'
      : 'Invalid expression';
  },
};

interface ValidateAnswerRequest {
  studentAnswer: string;
  correctAnswer: string;
}

interface QuickValidateRequest {
  studentAnswer: string;
  correctAnswer: string;
}

interface ValidateExpressionRequest {
  expression: string;
}

interface SubmitQuestionAnswerRequest {
  studentAnswer: string;
  userId?: string;
}

// POST /validate-answer - Validate a math answer
router.post(
  '/validate-answer',
  async (req: Request<{}, {}, ValidateAnswerRequest>, res: Response) => {
    try {
      const { studentAnswer, correctAnswer } = req.body;

      if (!studentAnswer || !correctAnswer) {
        return res.status(400).json({
          error: 'Both studentAnswer and correctAnswer are required',
        });
      }

      const isCorrect = backendMathValidator.validateAnswer(
        studentAnswer,
        correctAnswer,
      );

      res.status(200).json({
        isCorrect,
        studentAnswer,
        correctAnswer,
        message: isCorrect ? 'Answer is correct!' : 'Answer is incorrect.',
      });
    } catch (error) {
      console.error('Error validating answer:', error);
      res.status(500).json({ error: 'Failed to validate answer' });
    }
  },
);

// POST /quick-validate - Quick validation for real-time feedback
router.post(
  '/quick-validate',
  async (req: Request<{}, {}, QuickValidateRequest>, res: Response) => {
    try {
      const { studentAnswer, correctAnswer } = req.body;

      if (!studentAnswer || !correctAnswer) {
        return res.status(400).json({
          error: 'Both studentAnswer and correctAnswer are required',
        });
      }

      const isCorrect = backendMathValidator.quickValidate(
        studentAnswer,
        correctAnswer,
      );

      res.status(200).json({
        isCorrect,
        studentAnswer,
        correctAnswer,
      });
    } catch (error) {
      console.error('Error in quick validation:', error);
      res.status(500).json({ error: 'Failed to perform quick validation' });
    }
  },
);

// POST /validate-expression - Validate math expression format
router.post(
  '/validate-expression',
  async (req: Request<{}, {}, ValidateExpressionRequest>, res: Response) => {
    try {
      const { expression } = req.body;

      if (!expression) {
        return res.status(400).json({
          error: 'Expression is required',
        });
      }

      const isValid = backendMathValidator.isValidMathExpression(expression);
      const message = backendMathValidator.getValidationMessage(expression);

      res.status(200).json({
        isValid,
        expression,
        message,
      });
    } catch (error) {
      console.error('Error validating expression:', error);
      res.status(500).json({ error: 'Failed to validate expression' });
    }
  },
);

// POST /question/:id/submit - Submit and validate answer for a specific question
router.post(
  '/question/:id/submit',
  async (
    req: Request<{ id: string }, {}, SubmitQuestionAnswerRequest>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;
      const { studentAnswer, userId } = req.body;

      if (!studentAnswer) {
        return res.status(400).json({ error: 'Student answer is required' });
      }

      // Fetch the correct answer from database
      const { data: correctAnswerData, error: answerError } = await supabase
        .from('Answers')
        .select('answer_text')
        .eq('question_id', id)
        .eq('isCorrect', true)
        .single();

      if (answerError || !correctAnswerData) {
        return res
          .status(404)
          .json({ error: 'Question or correct answer not found' });
      }

      const correctAnswer = correctAnswerData.answer_text;
      const isCorrect = backendMathValidator.validateAnswer(
        studentAnswer,
        correctAnswer,
      );

      // If correct and userId provided, award XP
      let updatedUser = null;
      let xpAwarded = 0;
      if (isCorrect && userId) {
        // Fetch question XP value
        const { data: questionData, error: questionError } = await supabase
          .from('Questions')
          .select('xpGain')
          .eq('Q_id', id)
          .single();

        if (!questionError && questionData) {
          xpAwarded = questionData.xpGain;

          // Update user XP
          const { data: currentUser, error: userError } = await supabase
            .from('Users')
            .select('xp')
            .eq('id', userId)
            .single();

          if (!userError && currentUser) {
            const newXp = (currentUser.xp || 0) + questionData.xpGain;

            const { data: updated, error: updateError } = await supabase
              .from('Users')
              .update({ xp: newXp })
              .eq('id', userId)
              .select('id, xp')
              .single();

            if (!updateError) {
              updatedUser = updated;
            }
          }
        }
      }

      res.status(200).json({
        isCorrect,
        studentAnswer,
        correctAnswer,
        message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!',
        xpAwarded: isCorrect ? xpAwarded : 0,
        updatedUser,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  },
);

export default router;
