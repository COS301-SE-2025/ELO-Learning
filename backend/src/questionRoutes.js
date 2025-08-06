import express from 'express'
import { supabase } from '../database/supabaseClient.js'
import { verifyToken } from './middleware/auth.js'
import { backendMathValidator } from './mathValidator.js'

const router = express.Router()

// Enhanced answer validation for different question types
const validateAnswerByType = (questionType, studentAnswer, correctAnswer) => {
  switch (questionType) {
    case 'Multiple Choice':
      return studentAnswer === correctAnswer

    case 'Math Input':
      return backendMathValidator.validateAnswer(studentAnswer, correctAnswer)

    case 'Open Response':
      return validateOpenResponse(studentAnswer, correctAnswer)

    case 'Expression Builder':
      return validateExpressionBuilder(studentAnswer, correctAnswer)

    case 'Fill-in-the-Blank':
      return validateFillInBlank(studentAnswer, correctAnswer)

    default:
      return studentAnswer === correctAnswer
  }
}

// Validation functions for each question type
const validateOpenResponse = (studentAnswer, correctAnswer) => {
  if (!studentAnswer || studentAnswer.trim().length < 10) {
    return false
  }

  try {
    // For now, just check if it's a reasonable length response
    // You can enhance this later with keyword matching
    return studentAnswer.trim().length >= 20
  } catch (error) {
    console.log('Open response validation - using basic length check')
    return studentAnswer.trim().length >= 20
  }
}

const validateExpressionBuilder = (studentAnswer, correctAnswer) => {
  try {
    const studentExpression =
      typeof studentAnswer === 'string'
        ? studentAnswer
        : studentAnswer.join('')
    const correctExpression = correctAnswer

    return backendMathValidator.validateAnswer(
      studentExpression,
      correctExpression,
    )
  } catch (error) {
    console.error('Error validating expression builder:', error)
    return false
  }
}

const validateFillInBlank = (studentAnswer, correctAnswer) => {
  try {
    const studentAnswers =
      typeof studentAnswer === 'object'
        ? studentAnswer
        : JSON.parse(studentAnswer)
    const correctAnswers =
      typeof correctAnswer === 'object'
        ? correctAnswer
        : JSON.parse(correctAnswer)

    for (let blankId in correctAnswers) {
      const studentBlank = studentAnswers[blankId]?.trim().toLowerCase()
      const correctBlank = correctAnswers[blankId].trim().toLowerCase()

      const possibleAnswers = correctBlank.split('|').map((ans) => ans.trim())

      if (!possibleAnswers.includes(studentBlank)) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error validating fill in blank:', error)
    return false
  }
}

// Get questions by type - UPDATED to use only existing columns
router.get('/questions/type/:type', async (req, res) => {
  const { type } = req.params
  const { limit = 10 } = req.query

  try {
    let query = supabase
      .from('Questions')
      .select(
        `
        Q_id,
        topic,
        difficulty,
        level,
        questionText,
        xpGain,
        type,
        topic_id,
        elo_rating,
        imageUrl
      `,
      )
      .eq('type', type)
      .limit(parseInt(limit))

    const { data: questions, error: qError } = await query

    if (qError) {
      return res.status(500).json({
        error: 'Failed to fetch questions',
        details: qError.message,
      })
    }

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        error: `No questions found for type: ${type}`,
      })
    }

    // Fetch answers for each question
    const questionIds = questions.map((q) => q.Q_id)
    const { data: answers, error: aError } = await supabase
      .from('Answers')
      .select('*')
      .in('question_id', questionIds)

    if (aError) {
      return res.status(500).json({
        error: 'Failed to fetch answers',
        details: aError.message,
      })
    }

    // Map answers to questions and add placeholder metadata for frontend compatibility
    questions.forEach((question) => {
      question.answers = answers.filter(
        (answer) => answer.question_id === question.Q_id,
      )

      // Add placeholder fields for frontend compatibility (all null for now)
      question.inputLabels = null
      question.expressionTiles = null
      question.fillInText = null
      question.showMathHelper = false
    })

    res.status(200).json({
      success: true,
      data: questions,
      type: type,
      count: questions.length,
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Unexpected server error' })
  }
})

// Get mixed question types for practice - UPDATED
router.get('/questions/mixed', async (req, res) => {
  const { level = 1, count = 10 } = req.query

  try {
    const { data: questions, error: qError } = await supabase
      .from('Questions')
      .select(
        `
        Q_id,
        topic,
        difficulty,
        level,
        questionText,
        xpGain,
        type,
        topic_id,
        elo_rating,
        imageUrl
      `,
      )
      .eq('level', level)

    if (qError) {
      return res.status(500).json({
        error: 'Failed to fetch questions',
        details: qError.message,
      })
    }

    // Shuffle and select
    const shuffled = questions.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, parseInt(count))

    // Fetch answers
    const questionIds = selected.map((q) => q.Q_id)
    const { data: answers, error: aError } = await supabase
      .from('Answers')
      .select('*')
      .in('question_id', questionIds)

    if (aError) {
      return res.status(500).json({
        error: 'Failed to fetch answers',
        details: aError.message,
      })
    }

    // Map answers to questions and add placeholder metadata
    selected.forEach((question) => {
      question.answers = answers.filter(
        (answer) => answer.question_id === question.Q_id,
      )

      // Add placeholder fields for frontend compatibility
      question.inputLabels = null
      question.expressionTiles = null
      question.fillInText = null
      question.showMathHelper = false
    })

    res.status(200).json({
      success: true,
      data: selected,
      level: level,
      count: selected.length,
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Unexpected server error' })
  }
})

// Enhanced submit route with support for all question types - UPDATED
router.post('/question/:id/submit', async (req, res) => {
  const { id } = req.params
  const { studentAnswer, userId, questionType } = req.body

  try {
    // Fetch question and correct answer
    const { data: questionData, error: questionError } = await supabase
      .from('Questions')
      .select('type, xpGain')
      .eq('Q_id', id)
      .single()

    if (questionError || !questionData) {
      return res.status(404).json({ error: 'Question not found' })
    }

    const { data: correctAnswerData, error: answerError } = await supabase
      .from('Answers')
      .select('*') // Select all fields
      .eq('question_id', id)
      .eq('isCorrect', true)
      .single()

    // Add debugging
    console.log('Answer query result:', { correctAnswerData, answerError })

    if (answerError || !correctAnswerData) {
      console.log('Answer error details:', answerError)
      return res.status(404).json({
        error: 'Correct answer not found',
        debug: { answerError, question_id: id },
      })
    }

    const correctAnswer =
      correctAnswerData.answer_text || correctAnswerData.answerText
    const actualQuestionType = questionType || questionData.type

    // Validate answer based on question type
    const isCorrect = validateAnswerByType(
      actualQuestionType,
      studentAnswer,
      correctAnswer,
    )

    // Award XP if correct and userId provided
    let updatedUser = null
    let xpAwarded = 0

    if (isCorrect && userId) {
      const { data: currentUser, error: userError } = await supabase
        .from('Users')
        .select('xp')
        .eq('id', userId)
        .single()

      if (!userError && currentUser) {
        xpAwarded = questionData.xpGain || 10
        const newXp = (currentUser.xp || 0) + xpAwarded

        const { data: updated, error: updateError } = await supabase
          .from('Users')
          .update({ xp: newXp })
          .eq('id', userId)
          .select('id, xp')
          .single()

        if (!updateError) {
          updatedUser = updated
        }
      }
    }

    // Generate feedback message based on question type
    let feedbackMessage
    if (isCorrect) {
      feedbackMessage = getFeedbackMessage(actualQuestionType, true)
    } else {
      feedbackMessage = getFeedbackMessage(actualQuestionType, false)
    }

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        studentAnswer,
        correctAnswer:
          actualQuestionType === 'Open Response'
            ? 'See rubric for details'
            : correctAnswer,
        message: feedbackMessage,
        xpAwarded,
        updatedUser,
        questionType: actualQuestionType,
      },
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit answer',
      details: error.message,
    })
  }
})

// Helper function for feedback messages
const getFeedbackMessage = (questionType, isCorrect) => {
  const correctMessages = {
    'Multiple Choice': 'Correct! Well done!',
    'Math Input': 'Correct! Your mathematical expression is right!',
    'Open Response':
      'Great response! Your explanation demonstrates good understanding.',
    'Expression Builder': 'Perfect! Your expression is correctly constructed!',
    'Fill-in-the-Blank': 'Correct! All blanks filled properly!',
  }

  const incorrectMessages = {
    'Multiple Choice': 'Incorrect. Try again!',
    'Math Input': 'Not quite right. Check your mathematical expression.',
    'Open Response':
      'Your response needs more detail or accuracy. Try explaining step by step.',
    'Expression Builder':
      "Your expression isn't quite right. Try rearranging the tiles.",
    'Fill-in-the-Blank':
      'Some blanks are incorrect. Double-check your answers.',
  }

  return isCorrect
    ? correctMessages[questionType] || 'Correct!'
    : incorrectMessages[questionType] || 'Incorrect. Try again!'
}

// Keep all your existing routes exactly as they are
router.get('/questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('Q_id, topic, difficulty, level, questionText, xpGain, type')

    if (error) {
      console.error('Error fetching questions:', error.message)
      return res.status(500).json({ error: 'Failed to fetch questions' })
    }

    res.status(200).json({ questions: data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Unexpected server error' })
  }
})

router.get('/questionsById/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('Q_id', id)
      .single()

    if (error) {
      console.error('Error fetching question:', error.message)
      return res.status(500).json({ error: 'Failed to fetch question' })
    }

    if (!data) {
      return res.status(404).json({ error: 'Question not found' })
    }

    res.status(200).json({ question: data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Unexpected server error' })
  }
})

// Keep all your other existing routes (level, topic, random, etc.) unchanged
router.get('/question/:level', verifyToken, async (req, res) => {
  const { level } = req.params

  const levelNum = parseInt(level, 10)
  if (isNaN(levelNum) || levelNum <= 0 || !Number.isInteger(levelNum)) {
    return res.status(400).json({ error: 'Invalid level parameter' })
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain')
    .eq('level', levelNum)

  if (error) {
    console.error('Error fetching questions:', error.message)
    return res.status(500).json({ error: 'Failed to fetch questions' })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Level doesn't exist" })
  }

  res.status(200).json({ questions: data })
})

router.get('/question/:id/answer', verifyToken, async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('Answers')
    .select('*')
    .eq('question_id', id)
    .eq('isCorrect', true)

  if (error) {
    console.error('Error fetching answer:', error.message)
    return res.status(500).json({ error: 'Failed to fetch answer' })
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Question doesn't exist" })
  }

  res.status(200).json({ answer: data })
})

router.get('/questions/topic', async (req, res) => {
  const { topic } = req.query

  if (topic === undefined || topic === null) {
    return res.status(400).json({ error: 'Missing topic parameter' })
  }

  if (topic === '') {
    return res.status(200).json({ questions: [] })
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
    .eq('topic', topic)

  if (error) {
    console.error('Error fetching questions by topic:', error.message)
    return res.status(500).json({ error: 'Failed to fetch questions' })
  }

  res.status(200).json({ questions: data })
})

router.get('/questions/level/topic', async (req, res) => {
  const { level, topic } = req.query

  if (!level || !topic) {
    return res.status(400).json({ error: 'Missing level or topic parameter' })
  }

  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id, topic, difficulty, level, questionText, xpGain, type')
    .eq('level', level)
    .eq('topic_id', topic)
  if (data) {
    for (const question of data) {
      const { data, error } = await supabase
        .from('Answers')
        .select('*')
        .eq('question_id', question.Q_id)
      if (error) {
        console.error(
          'Error fetching practice questions:',
          error.message,
          question,
        )
        return res
          .status(500)
          .json({ error: 'Failed to fetch practice questions' })
      }
      question.answers = data
    }
  }

  if (error) {
    console.error(
      'Error fetching questions by level and topic:',
      error.message,
    )
    return res.status(500).json({ error: 'Failed to fetch questions' })
  }

  res.status(200).json({ questions: data })
})

router.get('/topics', async (req, res) => {
  try {
    const { data, error } = await supabase.from('Topics').select('*')

    if (error) {
      console.error('Error fetching topics:', error.message)
      return res.status(500).json({ error: 'Failed to fetch topics' })
    }

    res.status(200).json({ topics: data })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Unexpected server error' })
  }
})

router.get('/questions/random', async (req, res) => {
  try {
    const level = req.query.level
    if (!level) {
      return res.status(400).json({ error: 'level is required' })
    }

    const { data: questions, error: qError } = await supabase
      .from('Questions')
      .select('*')
      .eq('level', level)

    if (qError) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch questions', details: qError.message })
    }

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ error: 'No questions found for this level' })
    }

    const shuffled = questions.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 5)

    const questionIds = selected.map((q) => q.Q_id)
    const { data: answers, error: aError } = await supabase
      .from('Answers')
      .select('*')
      .in('question_id', questionIds)
    if (aError) {
      console.log('Database error:', aError)
      return res.status(500).json({ error: 'Failed to fetch answers' })
    }

    selected.forEach((q) => {
      q.answers = answers.filter((a) => a.question_id === q.Q_id)
    })

    return res.status(200).json({ questions: selected })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router
