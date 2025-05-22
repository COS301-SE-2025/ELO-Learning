import 'dotenv/config';
import { supabase } from './supabaseClient.js';

async function testQ_A() {
  const { data: questionsData, error: questionsError } = await supabase
    .from('Questions')
    .select('*')
    .eq('Q_id', 10);

  if (questionsError) {
    console.error('Something went wrong', questionsError.message);
    return;
  }

  if (!questionsData || questionsData.length === 0) {
    console.log('❌ No question found with Q_id = 10');
    return;
  } else {
    console.log('Data', questionsData[0]);
  }

  const { data: answerData, error: answerError } = await supabase
    .from('Answers')
    .select('*')
    .eq('question_id', questionsData[0].Q_id);

  if (answerError) {
    console.log('Something went wrong', answerError.message);
    return;
  } else {
    console.log('Answers: ', answerData);
  }
}

testQ_A();
