// validateRoutes.js
import express from 'express';
import { backendMathValidator } from './mathValidator.js';

const router = express.Router();

// Validate a math answer
router.post('/validate-answer', async (req, res) => {
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
});

// Quick validation for real-time feedback
router.post('/quick-validate', async (req, res) => {
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
});

// Validate math expression format
router.post('/validate-expression', async (req, res) => {
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
});

export default router;
