// openaiRoutes.js - Express routes for OpenAI question generation/approval
import express from 'express';
import { verifyToken } from './middleware/auth.js';
import { supabase } from '../database/supabaseClient.js';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: fetch random questions (same as test-openai.js)
async function fetchQuestions(limit = 5) {
  const { data, error } = await supabase.rpc('get_random_questions', {
    limit_num: limit,
  });
  if (error) throw error;
  return data;
}

function getAlternateType(questions) {
  const types = questions.map((q) => q.type);
  const allTypes = ['math-input', 'multiple-choice', 'open-response'];
  const counts = allTypes.map((type) => types.filter((t) => t === type).length);
  const minCount = Math.min(...counts);
  const candidates = allTypes.filter((type, i) => counts[i] === minCount);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// POST /api/openai/generate - Generate a question/answer using OpenAI
router.post('/api/openai/generate', verifyToken, async (req, res) => {
  // Only allow admin
  console.log('[OpenAI Generate] req.user:', req.user);
  if (!req.user || req.user.email !== 'admin@gmail.com') {
    console.log(
      '[OpenAI Generate] Forbidden: Not admin or missing user',
      req.user,
    );
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const existingQuestions = await fetchQuestions();
    const nextType = getAlternateType(existingQuestions);
    const prompt = `Given these sample questions:\n${existingQuestions
      .map(
        (q) =>
          `Type: ${q.type}, Topic: ${q.topic}, Level: ${q.level}, Difficulty: ${q.difficulty}, Question: ${q.questionText}`,
      )
      .join(
        '\n',
      )}\n\nGenerate a new question of type '${nextType}' with similar topic, difficulty (easy, medium, or hard), and structure. Return a JSON object with keys: topic, difficulty, level, questionText, xpGain, type, topic_id, elo_rating, imageUrl, answerChoices (for multiple-choice), correctAnswer (for open-response/math-input).`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    // Parse JSON from response
    const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in OpenAI response');
    let obj = JSON.parse(jsonMatch[0]);
    // Difficulty normalization
    const allowedDiff = ['Easy', 'Medium', 'Hard', 'Very Hard'];
    let diff = (obj.difficulty || '').toLowerCase();
    switch (diff) {
      case 'easy':
        obj.difficulty = 'Easy';
        obj.xpGain = 10;
        break;
      case 'medium':
        obj.difficulty = 'Medium';
        obj.xpGain = 15;
        break;
      case 'hard':
        obj.difficulty = 'Hard';
        obj.xpGain = 20;
        break;
      case 'very hard':
        obj.difficulty = 'Very Hard';
        obj.xpGain = 25;
        break;
      default:
        obj.difficulty = 'Medium';
        obj.xpGain = 15;
    }
    obj.elo_rating = 1000;
    // Return to admin for review/modification
    res.json({
      question: obj.questionText,
      answer: obj.correctAnswer,
      full: obj,
    });
  } catch (err) {
    console.log('[OpenAI Generate] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper: get next Q_id
async function getNextQid() {
  const { data, error } = await supabase
    .from('Questions')
    .select('Q_id')
    .order('Q_id', { ascending: false })
    .limit(1);
  if (error) throw error;
  const lastQid = data && data.length > 0 ? data[0].Q_id : 102;
  return lastQid + 1;
}

function getTopicIdForTopic(topic) {
  if (!topic || typeof topic !== 'string') return 1;
  const t = topic.toLowerCase();
  if (t.includes('stat')) return 1;
  if (t.includes('geom')) return 2;
  if (t.includes('trig')) return 3;
  if (t.includes('graph') || t.includes('function')) return 4;
  if (t.includes('calc')) return 5;
  if (t.includes('sequence') || t.includes('series')) return 6;
  if (t.includes('algebra')) return 7;
  if (t.includes('financ')) return 8;
  return 1;
}

// POST /api/openai/approve - Approve and save question/answer to DB
router.post('/api/openai/approve', verifyToken, async (req, res) => {
  if (!req.user || req.user.email !== 'admin@gmail.com') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  console.log('[OpenAI Approve] req.user:', req.user);
  console.log('[OpenAI Approve] req.body:', req.body);
  try {
    const { full } = req.body;
    if (!full || typeof full !== 'object') {
      console.warn(
        '[OpenAI Approve] Missing or invalid full question object in request body:',
        req.body,
      );
      return res
        .status(400)
        .json({ error: 'Full question object required in "full" field.' });
    }
    // Log the full payload for debugging
    console.log('[OpenAI Approve] Full question object:', full);
    // Prepare question object for DB
    let questionObj = { ...full };
    questionObj.Q_id = await getNextQid();
    questionObj.topic_id = getTopicIdForTopic(questionObj.topic);
    // Ensure questionText and correctAnswer are set from possible alternate keys
    if (!questionObj.questionText && questionObj.question)
      questionObj.questionText = questionObj.question;
    if (!questionObj.correctAnswer && questionObj.answer)
      questionObj.correctAnswer = questionObj.answer;
    // Remove any wonky topic_id from OpenAI and recalculate
    // Insert into Questions
    const { answerChoices, correctAnswer, ...questionFields } = questionObj;
    console.log('[OpenAI Approve] Inserting into Questions:', questionFields);
    const { error: qError } = await supabase
      .from('Questions')
      .insert([questionFields]);
    if (qError) throw qError;
    // Insert into Answers
    const normalizedType = (questionObj.type || '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (normalizedType === 'multiple-choice' && Array.isArray(answerChoices)) {
      // Fetch max answer_id
      const { data: answerData, error: answerIdError } = await supabase
        .from('Answers')
        .select('answer_id')
        .order('answer_id', { ascending: false })
        .limit(1);
      let lastAnswerId =
        answerData && answerData.length > 0 ? answerData[0].answer_id : 0;
      // Ensure only one correct answer
      let foundCorrect = false;
      for (let i = 0; i < answerChoices.length; i++) {
        const choice = answerChoices[i];
        lastAnswerId++;
        // Only the first marked correct is TRUE, rest are FALSE
        let isCorrect = false;
        if (!foundCorrect && !!choice.isCorrect) {
          isCorrect = true;
          foundCorrect = true;
        }
        const answerPayload = {
          answer_id: lastAnswerId,
          question_id: questionObj.Q_id,
          answer_text: choice.text,
          isCorrect,
        };
        console.log('[OpenAI Approve] Inserting into Answers:', answerPayload);
        await supabase.from('Answers').insert([answerPayload]);
      }
    } else if (
      normalizedType === 'open-response' ||
      normalizedType === 'math-input'
    ) {
      // Fetch max answer_id
      const { data: answerData, error: answerIdError } = await supabase
        .from('Answers')
        .select('answer_id')
        .order('answer_id', { ascending: false })
        .limit(1);
      let lastAnswerId =
        answerData && answerData.length > 0 ? answerData[0].answer_id : 0;
      const ans = questionObj.correctAnswer || questionObj.answer;
      if (ans && typeof ans === 'string' && ans.trim().length > 0) {
        lastAnswerId++;
        const answerPayload = {
          answer_id: lastAnswerId,
          question_id: questionObj.Q_id,
          answer_text: ans,
          isCorrect: true,
        };
        console.log('[OpenAI Approve] Inserting into Answers:', answerPayload);
        await supabase.from('Answers').insert([answerPayload]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.log('[OpenAI Approve] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
