// debug-test.js - A simple script to test match questions
import { getQuestionsByType } from '@/utils/api';

export async function testMatchQuestions() {
  console.log('Testing match questions...');
  
  try {
    const result = await getQuestionsByType('Match Question', 10);
    console.log('Match Question API result:', result);
    
    if (result.success) {
      console.log('✅ Successfully fetched match questions:', result.data?.length || 0);
      result.data?.forEach((question, index) => {
        console.log(`Question ${index + 1}:`, {
          id: question.Q_id,
          type: question.type,
          questionText: question.questionText,
          answersCount: question.answers?.length || 0,
          answers: question.answers
        });
      });
    } else {
      console.log('❌ Failed to fetch match questions:', result.error);
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Also test other question types for comparison
export async function testAllQuestionTypes() {
  const types = ['Multiple Choice', 'Math Input', 'Match Question', 'Matching', 'Open Response'];
  
  for (const type of types) {
    console.log(`\n--- Testing ${type} ---`);
    try {
      const result = await getQuestionsByType(type, 5);
      if (result.success) {
        console.log(`✅ ${type}: Found ${result.data?.length || 0} questions`);
      } else {
        console.log(`❌ ${type}: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${type}: Error -`, error.message);
    }
  }
}
