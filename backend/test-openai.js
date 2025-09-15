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
        `Type: ${q.type}, Topic: ${q.topic}, Level: ${q.level}, Question: ${q.questionText}`,
    )
    .join('\n')}
\nGenerate a new question of type '${nextType}' with similar topic, difficulty, and structure. Return a JSON object with keys: topic, difficulty, level, questionText, xpGain, type, topic_id, elo_rating, imageUrl.`;
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  // Parse JSON from response
  try {
    const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in OpenAI response');
    return JSON.parse(jsonMatch[0]);
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
  const { error } = await supabase.from('Questions').insert([questionObj]);
  if (error) throw error;
}

async function main() {
  const existingQuestions = await fetchQuestions();
  const nextType = getAlternateType(existingQuestions);
  const newQuestionObj = await generateQuestion(existingQuestions, nextType);
  await insertQuestion(newQuestionObj);
  console.log('New question added:', newQuestionObj);
}

main().catch(console.error);
