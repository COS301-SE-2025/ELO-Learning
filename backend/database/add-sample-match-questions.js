// add-sample-match-questions.js - Fixed script to properly add match questions
import { supabase } from './supabaseClient.js';

// Sample match questions with proper database structure
const sampleMatchQuestions = [
  {
    questionText: 'Match the countries with their capitals:',
    type: 'Match Question',
    topic: 'Geography', // Use 'topic' instead of 'subject'
    difficulty: 'Medium',
    level: 1,
    xpGain: 15,
  },
  {
    questionText: 'Match the programming languages with their primary use:',
    type: 'Match Question',
    topic: 'Computer Science',
    difficulty: 'Medium',
    level: 1,
    xpGain: 15,
  },
  {
    questionText: 'Match the mathematical operations with their symbols:',
    type: 'Match Question',
    topic: 'Mathematics',
    difficulty: 'Easy',
    level: 1,
    xpGain: 10,
  },
  {
    questionText: 'Match the animals with their habitats:',
    type: 'Match Question',
    topic: 'Biology',
    difficulty: 'Easy',
    level: 1,
    xpGain: 10,
  },
];

// Match pairs data - separate from questions
const matchPairsData = [
  {
    questionIndex: 0, // Countries and capitals
    pairs: [
      { left: 'France', right: 'Paris' },
      { left: 'Italy', right: 'Rome' },
      { left: 'Spain', right: 'Madrid' },
      { left: 'Germany', right: 'Berlin' },
    ],
  },
  {
    questionIndex: 1, // Programming languages
    pairs: [
      { left: 'JavaScript', right: 'Web Development' },
      { left: 'Python', right: 'Data Science' },
      { left: 'Java', right: 'Enterprise Applications' },
      { left: 'C++', right: 'System Programming' },
    ],
  },
  {
    questionIndex: 2, // Math operations
    pairs: [
      { left: 'Addition', right: '+' },
      { left: 'Subtraction', right: '-' },
      { left: 'Multiplication', right: '×' },
      { left: 'Division', right: '÷' },
    ],
  },
  {
    questionIndex: 3, // Animals and habitats
    pairs: [
      { left: 'Fish', right: 'Ocean' },
      { left: 'Bear', right: 'Forest' },
      { left: 'Camel', right: 'Desert' },
      { left: 'Penguin', right: 'Antarctica' },
    ],
  },
];

async function addSampleMatchQuestions() {
  console.log('Adding sample match questions to the database...');

  try {
    const addedQuestions = [];

    // Step 1: Add questions to Questions table
    for (let i = 0; i < sampleMatchQuestions.length; i++) {
      const question = sampleMatchQuestions[i];
      console.log(
        `\nAdding question: "${question.questionText.substring(0, 50)}..."`,
      );

      const { data: questionData, error: questionError } = await supabase
        .from('Questions') // Make sure this matches your table name
        .insert([question])
        .select()
        .single();

      if (questionError) {
        console.error('Error adding question:', questionError);
        continue;
      }

      const questionId = questionData.Q_id;
      console.log('✅ Successfully added question with ID:', questionId);
      addedQuestions.push({ ...questionData, pairIndex: i });

      // Step 2: Add match pairs as answers
      const pairs = matchPairsData[i].pairs;
      const answers = [];

      for (let j = 0; j < pairs.length; j++) {
        const pair = pairs[j];
        // Store each pair as "Left → Right" format in answer_text
        answers.push({
          question_id: questionId,
          answer_text: `${pair.left} → ${pair.right}`,
          isCorrect: true, // All pairs are "correct" for match questions
          // Add additional metadata for match questions
          match_left: pair.left,
          match_right: pair.right,
          pair_index: j,
        });
      }

      const { data: answersData, error: answersError } = await supabase
        .from('Answers') // Make sure this matches your table name
        .insert(answers)
        .select();

      if (answersError) {
        console.error(
          'Error adding answers for question',
          questionId,
          ':',
          answersError,
        );
      } else {
        console.log(
          `✅ Added ${answersData.length} answer pairs for question ${questionId}`,
        );
      }
    }

    console.log('\n🎉 All sample match questions added successfully!');

    // Step 3: Verify by fetching them back
    console.log('\n--- Verifying questions ---');
    const { data: matchQuestions, error: fetchError } = await supabase
      .from('Questions')
      .select(
        `
        Q_id,
        questionText,
        type,
        topic,
        difficulty,
        level,
        xpGain
      `,
      )
      .in('type', ['Match Question', 'Matching']);

    if (fetchError) {
      console.error('Error fetching questions:', fetchError);
    } else {
      console.log(
        `Found ${matchQuestions.length} match questions in database:`,
      );

      for (const question of matchQuestions) {
        // Fetch answers for each question
        const { data: answers, error: answerError } = await supabase
          .from('Answers')
          .select('*')
          .eq('question_id', question.Q_id);

        if (!answerError) {
          console.log(
            `- Question ${question.Q_id}: "${question.questionText.substring(
              0,
              40,
            )}..." (${answers.length} pairs)`,
          );
          answers.forEach((answer, index) => {
            console.log(`  ${index + 1}. ${answer.answer_text}`);
          });
        }
      }
    }

    return addedQuestions;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
}

// Alternative: Add match questions with JSON storage for pairs
async function addSampleMatchQuestionsWithJSON() {
  console.log('Adding sample match questions with JSON storage...');

  try {
    for (let i = 0; i < sampleMatchQuestions.length; i++) {
      const question = sampleMatchQuestions[i];
      const pairs = matchPairsData[i].pairs;

      // Store pairs as JSON in a single answer record
      const questionWithPairs = {
        ...question,
        // You might need to add a matchPairs column to your Questions table
        // Or store it as a special answer with type 'match_data'
      };

      const { data: questionData, error: questionError } = await supabase
        .from('Questions')
        .insert([questionWithPairs])
        .select()
        .single();

      if (questionError) {
        console.error('Error adding question:', questionError);
        continue;
      }

      // Store match pairs as JSON in a single answer record
      const matchAnswer = {
        question_id: questionData.Q_id,
        answer_text: JSON.stringify(pairs), // Store pairs as JSON
        isCorrect: true,
        answer_type: 'match_pairs', // Special type to identify this as match data
      };

      const { error: answerError } = await supabase
        .from('Answers')
        .insert([matchAnswer]);

      if (answerError) {
        console.error('Error adding match pairs:', answerError);
      } else {
        console.log(`✅ Added question ${questionData.Q_id} with JSON pairs`);
      }
    }
  } catch (error) {
    console.error('Error in JSON method:', error);
  }
}

// Export functions
export {
  addSampleMatchQuestions,
  addSampleMatchQuestionsWithJSON,
  sampleMatchQuestions,
  matchPairsData,
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Try the first method (individual answer records)
  addSampleMatchQuestions()
    .then(() => {
      console.log('\n📝 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}
