// Before running this script, create the following function in your Supabase SQL editor:
//
// create or replace function get_random_questions(limit_num integer)
// returns setof "Questions" as $$
//   select * from "Questions" order by random() limit $1;
// $$ language sql stable;
//
// This allows you to fetch random questions using supabase.rpc.

import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function fetchQuestions() {
  const { data, error } = await supabase.rpc('get_random_questions', {
    limit_num: 5,
  });
  if (error) throw error;
  return data;
}

function getAlternateType(questions) {
  const types = questions.map((q) => q.type);
  const allTypes = ['math-input', 'multiple-choice', 'open-response'];
  // Count occurrences
  const counts = allTypes.map((type) => types.filter((t) => t === type).length);
  // Find least used type
  const minCount = Math.min(...counts);
  const candidates = allTypes.filter((type, i) => counts[i] === minCount);
  // Pick one (random if tie)
  return candidates[Math.floor(Math.random() * candidates.length)];
}

async function generateQuestion(existingQuestions, nextType) {
  const prompt = `Given these sample questions:\n${existingQuestions
    .map(
      (q) =>
        `Type: ${q.type}, Topic: ${q.topic}, Level: ${q.level}, Difficulty: ${q.difficulty}, Question: ${q.questionText}`,
    )
    .join('\n')}
\nGenerate a new question of type '${nextType}' with similar topic, difficulty (easy, medium, or hard), and structure. Return a JSON object with keys: topic, difficulty, level, questionText, xpGain, type, topic_id, elo_rating, imageUrl, answerChoices (for multiple-choice), correctAnswer (for open-response/math-input).`;
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  // Parse JSON from response
  try {
    const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in OpenAI response');
    let obj = JSON.parse(jsonMatch[0]);
    // Ensure difficulty is one of Easy/Medium/Hard/Very Hard (capitalized)
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
    // Always set elo_rating to 1000
    obj.elo_rating = 1000;
    return obj;
  } catch (err) {
    throw new Error('Failed to parse OpenAI response: ' + err.message);
  }
}

async function getNextQid() {
  // Get the max Q_id in the table
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
  const topicMap = {
    'Statistics & Probability': 1,
    Geometry: 2,
    Trigonometry: 3,
    'Functions & Graphs': 4,
    Calculus: 5,
    // Add more if needed
  };
  // Default to 1 if not found
  return topicMap[topic] || 1;
}

async function insertQuestion(questionObj) {
  questionObj.Q_id = await getNextQid();
  // Ensure topic_id matches topic name
  questionObj.topic_id = getTopicIdForTopic(questionObj.topic);
  console.log(
    'Full question object before insert:',
    JSON.stringify(questionObj, null, 2),
  );
  // Remove answerChoices and correctAnswer before inserting into Questions
  const { answerChoices, correctAnswer, ...questionFields } = questionObj;
  console.log(
    'Inserting into Questions:',
    JSON.stringify(questionFields, null, 2),
  );
  const { error } = await supabase.from('Questions').insert([questionFields]);
  if (error) throw error;

  // Normalize type for answer insertion
  const normalizedType = (questionObj.type || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
  console.log('Answer logging debug:', {
    normalizedType,
    correctAnswer,
    Q_id: questionObj.Q_id,
    answerChoices,
  });
  if (normalizedType === 'multiple-choice' && Array.isArray(answerChoices)) {
    for (const choice of answerChoices) {
      const answerPayload = {
        question_id: questionObj.Q_id,
        answer_text: choice.text,
        isCorrect: !!choice.isCorrect,
      };
      console.log(
        'Attempting to insert into Answers:',
        JSON.stringify(answerPayload, null, 2),
      );
      const { data, error } = await supabase
        .from('Answers')
        .insert([answerPayload]);
      console.log('Answers insert result:', {
        data,
        error,
        question_id: questionObj.Q_id,
        answer_text: choice.text,
      });
    }
  } else if (
    normalizedType === 'open-response' ||
    normalizedType === 'math-input'
  ) {
    if (
      correctAnswer &&
      typeof correctAnswer === 'string' &&
      correctAnswer.trim().length > 0
    ) {
      const answerPayload = {
        question_id: questionObj.Q_id,
        answer_text: correctAnswer,
        isCorrect: true,
      };
      console.log(
        'Attempting to insert into Answers:',
        JSON.stringify(answerPayload, null, 2),
      );
      const { data, error } = await supabase
        .from('Answers')
        .insert([answerPayload]);
      console.log('Answers insert result:', {
        data,
        error,
        question_id: questionObj.Q_id,
        answer_text: correctAnswer,
      });
    } else {
      console.warn('No correctAnswer found for question', questionObj.Q_id);
    }
  }
}

async function main() {
  const existingQuestions = await fetchQuestions();
  const nextType = getAlternateType(existingQuestions);
  const newQuestionObj = await generateQuestion(existingQuestions, nextType);
  await insertQuestion(newQuestionObj);
  console.log('New question added:', newQuestionObj);
}

main().catch(console.error);
