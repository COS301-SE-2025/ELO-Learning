// Test script to add match questions and start backend if needed
const express = require('express');
const cors = require('cors');

// Simple test data for match questions
const sampleMatchQuestions = [
  {
    Q_id: 'match-1',
    questionText: "Match the countries with their capitals:",
    type: "Match Question",
    subject: "Geography",
    difficulty: "Medium",
    answers: [
      { id: 1, answer_text: "France → Paris", isCorrect: true },
      { id: 2, answer_text: "Italy → Rome", isCorrect: true },
      { id: 3, answer_text: "Spain → Madrid", isCorrect: true },
      { id: 4, answer_text: "Germany → Berlin", isCorrect: true }
    ]
  },
  {
    Q_id: 'match-2',
    questionText: "Match the programming languages with their primary use:",
    type: "Match Question",
    subject: "Computer Science", 
    difficulty: "Medium",
    answers: [
      { id: 1, answer_text: "JavaScript | Web Development", isCorrect: true },
      { id: 2, answer_text: "Python | Data Science", isCorrect: true },
      { id: 3, answer_text: "Java | Enterprise Applications", isCorrect: true },
      { id: 4, answer_text: "C++ | System Programming", isCorrect: true }
    ]
  },
  {
    Q_id: 'match-3',
    questionText: "Match the mathematical operations with their symbols:",
    type: "Match Question",
    subject: "Mathematics",
    difficulty: "Easy",
    answers: [
      { id: 1, answer_text: "Addition: +", isCorrect: true },
      { id: 2, answer_text: "Subtraction: -", isCorrect: true },
      { id: 3, answer_text: "Multiplication: ×", isCorrect: true },
      { id: 4, answer_text: "Division: ÷", isCorrect: true }
    ]
  }
];

const app = express();
app.use(cors());
app.use(express.json());

// Mock storage
let questions = sampleMatchQuestions;

// Route to get questions by type
app.get('/questions/type/:type', (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  
  console.log(`Getting questions for type: ${type}`);
  
  const filteredQuestions = questions.filter(q => 
    q.type === type || 
    (type === 'Match Question' && q.type === 'Matching') ||
    (type === 'Matching' && q.type === 'Match Question')
  ).slice(0, limit);
  
  console.log(`Found ${filteredQuestions.length} questions`);
  
  if (filteredQuestions.length === 0) {
    return res.status(404).json({
      success: false,
      error: `No questions found for type: ${type}`,
      availableTypes: [...new Set(questions.map(q => q.type))]
    });
  }
  
  res.json({
    success: true,
    data: filteredQuestions,
    type: type,
    count: filteredQuestions.length
  });
});

// Route to submit answers
app.post('/questions/:questionId/submit', (req, res) => {
  const { questionId } = req.params;
  const { answer } = req.body;
  
  console.log(`Submitting answer for question ${questionId}:`, answer);
  
  res.json({
    success: true,
    data: {
      isCorrect: true,
      message: "Great job! You matched all pairs correctly!",
      xpAwarded: 10
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Test backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /questions/type/Match%20Question');
  console.log('  POST /questions/:questionId/submit');
  console.log('\nSample questions loaded:');
  questions.forEach(q => {
    console.log(`  - ${q.Q_id}: ${q.questionText.substring(0, 50)}...`);
  });
});
