// Test file for ELO logic
import { distributeXPFromResults } from './src/multiPlayerArray.js';

// Sample player results
const player1Results = [
  {
    question: {
      Q_id: 27,
      topic: 'Algebra',
      difficulty: 'Easy',
      level: 5,
      questionText: 'Simplify: (2x + 3) - (x - 5)',
      xpGain: 10,
      type: 'Math Input',
      topic_id: 8,
      answers: [],
    },
    q_index: 1,
    answer: 'x + 8',
    isCorrect: true,
    actualAnswer: {
      answer_id: 102,
      question_id: 27,
      answer_text: 'x + 8',
      isCorrect: true,
    },
    timeElapsed: 5,
  },
  {
    question: {
      Q_id: 32,
      topic: 'Survey Design',
      difficulty: 'Easy',
      level: 5,
      questionText: 'A survey is biased if:',
      xpGain: 10,
      type: 'Multiple Choice',
      topic_id: 7,
      answers: [],
    },
    q_index: 2,
    answer: 'It favors certain outcomes over others',
    isCorrect: true,
    actualAnswer: {
      answer_id: 111,
      question_id: 32,
      answer_text: 'It favors certain outcomes over others',
      isCorrect: true,
    },
    timeElapsed: 3,
  },
];

const player2Results = [
  {
    question: {
      Q_id: 27,
      topic: 'Algebra',
      difficulty: 'Easy',
      level: 5,
      questionText: 'Simplify: (2x + 3) - (x - 5)',
      xpGain: 10,
      type: 'Math Input',
      topic_id: 8,
      answers: [],
    },
    q_index: 1,
    answer: '5',
    isCorrect: false,
    actualAnswer: {
      answer_id: 102,
      question_id: 27,
      answer_text: 'x + 8',
      isCorrect: true,
    },
    timeElapsed: 8,
  },
  {
    question: {
      Q_id: 32,
      topic: 'Survey Design',
      difficulty: 'Easy',
      level: 5,
      questionText: 'A survey is biased if:',
      xpGain: 10,
      type: 'Multiple Choice',
      topic_id: 7,
      answers: [],
    },
    q_index: 2,
    answer: 'It includes both genders',
    isCorrect: false,
    actualAnswer: {
      answer_id: 111,
      question_id: 32,
      answer_text: 'It favors certain outcomes over others',
      isCorrect: true,
    },
    timeElapsed: 4,
  },
];

console.log('=== Testing ELO Logic ===');
try {
  const result = distributeXPFromResults(
    player1Results,
    player2Results,
    1000,
    1000,
  );
  console.log('ELO Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error);
}
