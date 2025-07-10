// routes/question.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabaseClient';
import { authMiddleware } from '../middleware/auth';

const router = Router();

interface Question {
  Q_id: string;
  topic: string;
  difficulty: string;
  level: number;
  questionText: string;
  xpGain: number;
  type: string;
  answers?: Answer[];
}

interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  isCorrect: boolean;
}

interface SubmitAnswerRequest {
  userId: string;
  questionId: string;
  selectedAnswerId: string;
}

// GET /questions - Get all questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('Q_id, topic, difficulty, level, questionText, xpGain');

    if (error) {
      console.error('Error fetching questions:', error.message);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /questions/random - Get random questions by level
router.get('/random', async (req: Request, res: Response) => {
  try {
    const { level } = req.query;
    if (!level) {
      return res.status(400).json({ error: 'level is required' });
    }

    const { data: questions, error: qError } = await supabase
      .from('Questions')
      .select('*')
      .eq('level', level);

    if (qError) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch questions', details: qError.message });
    }

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ error: 'No questions found for this level' });
    }

    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const questionIds = selected.map((q: Question) => q.Q_id);
    const { data: answers, error: aError } = await supabase
      .from('Answers')
      .select('*')
      .in('question_id', questionIds);

    if (aError) {
      console.log('Database error:', aError);
      return res.status(500).json({ error: 'Failed to fetch answers' });
    }

    selected.forEach((q: Question) => {
      q.answers =
        answers?.filter((a: Answer) => a.question_id === q.Q_id) || [];
    });

    res.status(200).json({ questions: selected });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /questions/practice - Get 10 practice questions
router.get('/practice', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching practice questions:', error.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch practice questions' });
    }

    if (data) {
      const questionsWithAnswers: Question[] = [];
      for (const question of data) {
        const { data: answers, error: answerError } = await supabase
          .from('Answers')
          .select('*')
          .eq('question_id', question.Q_id);

        if (answerError) {
          console.error(
            'Error fetching practice questions:',
            answerError.message,
            question,
          );
          return res
            .status(500)
            .json({ error: 'Failed to fetch practice questions' });
        }
        questionsWithAnswers.push({
          ...question,
          answers: answers || [],
        });
      }
      return res.status(200).json({ questions: questionsWithAnswers });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /questions/practice/type/:questionType - Get practice questions by type
router.get(
  '/practice/type/:questionType',
  async (req: Request, res: Response) => {
    try {
      const { questionType } = req.params;

      const { data, error } = await supabase
        .from('Questions')
        .select('*')
        .eq('type', questionType)
        .limit(10);

      if (error) {
        console.error('Error fetching questions by type:', error.message);
        return res
          .status(500)
          .json({ error: 'Failed to fetch questions by type' });
      }

      if (data) {
        const questionsWithAnswers: Question[] = [];
        for (const question of data) {
          const { data: answers, error: answerError } = await supabase
            .from('Answers')
            .select('*')
            .eq('question_id', question.Q_id);

          if (answerError) {
            console.error('Error fetching answers:', answerError.message);
            return res.status(500).json({ error: 'Failed to fetch answers' });
          }

          questionsWithAnswers.push({
            ...question,
            answers: answers || [],
          });
        }
        return res.status(200).json({ questions: questionsWithAnswers });
      }

      res.status(200).json({ questions: data });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },
);

// GET /questions/topic - Get questions by topic
router.get('/topic', async (req: Request, res: Response) => {
  try {
    const { topic } = req.query;

    if (!topic) {
      return res.status(400).json({ error: 'Missing topic parameter' });
    }

    const { data, error } = await supabase
      .from('Questions')
      .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
      .eq('topic', topic);

    if (error) {
      console.error('Error fetching questions by topic:', error.message);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /questions/level/topic - Get questions by level and topic
router.get('/level/topic', async (req: Request, res: Response) => {
  try {
    const { level, topic } = req.query;

    if (!level || !topic) {
      return res
        .status(400)
        .json({ error: 'Missing level or topic parameter' });
    }

    const { data, error } = await supabase
      .from('Questions')
      .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
      .eq('level', level)
      .eq('topic_id', topic);

    if (error) {
      console.error(
        'Error fetching questions by level and topic:',
        error.message,
      );
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    if (data) {
      const questionsWithAnswers: Question[] = [];
      for (const question of data) {
        const { data: answers, error: answerError } = await supabase
          .from('Answers')
          .select('*')
          .eq('question_id', question.Q_id);

        if (answerError) {
          console.error(
            'Error fetching practice questions:',
            answerError.message,
            question,
          );
          return res
            .status(500)
            .json({ error: 'Failed to fetch practice questions' });
        }
        questionsWithAnswers.push({
          ...question,
          answers: answers || [],
        });
      }
      return res.status(200).json({ questions: questionsWithAnswers });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /questions/:level - Get questions by level
router.get('/:level', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { level } = req.params;

    const { data, error } = await supabase
      .from('Questions')
      .select('Q_id, topic, difficulty, level, questionText, xpGain')
      .eq('level', level);

    if (error) {
      console.error('Error fetching questions:', error.message);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Level doesn't exist" });
    }

    res.status(200).json({ questions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /questions/:id/answer - Get answer to specific question
router.get(
  '/:id/answer',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('Answers')
        .select('*')
        .eq('question_id', id)
        .eq('isCorrect', true);

      if (error) {
        console.error('Error fetching answer:', error.message);
        return res.status(500).json({ error: 'Failed to fetch answer' });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Question doesn't exist" });
      }

      res.status(200).json({ answer: data });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },
);

// GET /questionsById/:id - Get specific question by ID
router.get('ById/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('Q_id', id)
      .single();

    if (error) {
      console.error('Error fetching question:', error.message);
      return res.status(500).json({ error: 'Failed to fetch question' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({ question: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// GET /answers/:id - Get all answers to specific question
router.get('/answers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Answers')
      .select('*')
      .eq('question_id', id);

    if (error) {
      console.error('Error fetching answers:', error.message);
      return res.status(500).json({ error: 'Failed to fetch answers' });
    }

    res.status(200).json({ answer: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// POST /submit-answer - Submit answer for validation and XP award
router.post(
  '/submit-answer',
  authMiddleware,
  async (req: Request<{}, {}, SubmitAnswerRequest>, res: Response) => {
    try {
      const { userId, questionId, selectedAnswerId } = req.body;

      if (!userId || !questionId || !selectedAnswerId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if the selected answer is correct
      const { data: answer, error: answerError } = await supabase
        .from('Answers')
        .select('isCorrect')
        .eq('id', selectedAnswerId)
        .eq('question_id', questionId)
        .single();

      if (answerError || !answer) {
        return res
          .status(404)
          .json({ error: 'Answer not found or does not match question' });
      }

      const isCorrect = answer.isCorrect;

      if (!isCorrect) {
        return res.status(200).json({
          correct: false,
          message: 'Incorrect answer. No XP awarded.',
        });
      }

      // Get XP for the question
      const { data: question, error: questionError } = await supabase
        .from('Questions')
        .select('xpGain')
        .eq('Q_id', questionId)
        .single();

      if (questionError) {
        console.error('Error fetching question XP:', questionError.message);
        return res.status(500).json({ error: 'Failed to fetch XP' });
      }

      const xpToAdd = question?.xpGain ?? 0;

      // Get user XP and add to it
      const { data: user, error: userError } = await supabase
        .from('Users')
        .select('xp')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError.message);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      const newXP = (user?.xp ?? 0) + xpToAdd;

      const { data: updatedUser, error: updateError } = await supabase
        .from('Users')
        .update({ xp: newXP })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating XP:', updateError.message);
        return res.status(500).json({ error: 'Failed to update XP' });
      }

      res.status(200).json({
        correct: true,
        message: `Correct answer! +${xpToAdd} XP awarded.`,
        newXP: updatedUser.xp,
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  },
);
export default router;
