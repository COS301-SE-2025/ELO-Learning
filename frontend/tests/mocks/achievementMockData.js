/**
 * Mock Data for Achievement Testing
 * Provides realistic test data for achievement system testing
 */

export const mockAchievements = {
  // Gameplay achievements
  firstSteps: {
    id: 1,
    name: 'First Steps',
    description: 'Answer your first question correctly',
    condition_type: 'Questions Answered',
    condition_value: 1,
    AchievementCategories: { name: 'Gameplay' }
  },

  questioner: {
    id: 2,
    name: 'Questioner',
    description: 'Answer 10 questions correctly',
    condition_type: 'Questions Answered',
    condition_value: 10,
    AchievementCategories: { name: 'Gameplay' }
  },

  scholar: {
    id: 3,
    name: 'Scholar',
    description: 'Answer 100 questions correctly',
    condition_type: 'Questions Answered',
    condition_value: 100,
    AchievementCategories: { name: 'Gameplay' }
  },

  // Streak achievements
  onFire: {
    id: 4,
    name: 'On Fire',
    description: 'Get 5 questions right in a row',
    condition_type: 'Streak',
    condition_value: 5,
    AchievementCategories: { name: 'Streak' }
  },

  unstoppable: {
    id: 5,
    name: 'Unstoppable',
    description: 'Get 10 questions right in a row',
    condition_type: 'Streak',
    condition_value: 10,
    AchievementCategories: { name: 'Streak' }
  },

  // ELO Rating achievements
  risingStar: {
    id: 6,
    name: 'Rising Star',
    description: 'Reach 1300 ELO rating',
    condition_type: 'ELO Rating',
    condition_value: 1300,
    AchievementCategories: { name: 'ELO Rating' }
  },

  expert: {
    id: 7,
    name: 'Expert',
    description: 'Reach 1500 ELO rating',
    condition_type: 'ELO Rating',
    condition_value: 1500,
    AchievementCategories: { name: 'ELO Rating' }
  },

  grandmaster: {
    id: 8,
    name: 'Grandmaster',
    description: 'Reach 1800 ELO rating',
    condition_type: 'ELO Rating',
    condition_value: 1800,
    AchievementCategories: { name: 'ELO Rating' }
  },

  // Problem Solving achievements
  problemSolver: {
    id: 9,
    name: 'Problem Solver',
    description: 'Solve complex mathematical problems',
    condition_type: 'Problem Solving',
    condition_value: 50,
    AchievementCategories: { name: 'Problem Solving' }
  },

  mathWizard: {
    id: 10,
    name: 'Math Wizard',
    description: 'Master advanced mathematical concepts',
    condition_type: 'Problem Solving',
    condition_value: 200,
    AchievementCategories: { name: 'Problem Solving' }
  },

  // Practice achievements
  practiceRookie: {
    id: 11,
    name: 'Practice Rookie',
    description: 'Complete 5 practice sessions',
    condition_type: 'Practice Questions',
    condition_value: 5,
    AchievementCategories: { name: 'Practice' }
  },

  practiceVeteran: {
    id: 12,
    name: 'Practice Veteran',
    description: 'Complete 50 practice sessions',
    condition_type: 'Practice Questions',
    condition_value: 50,
    AchievementCategories: { name: 'Practice' }
  },

  // Badge Collection achievements
  collector: {
    id: 13,
    name: 'Collector',
    description: 'Unlock 5 different achievements',
    condition_type: 'Badges Collected',
    condition_value: 5,
    AchievementCategories: { name: 'Badge Collection' }
  },

  achievementHunter: {
    id: 14,
    name: 'Achievement Hunter',
    description: 'Unlock 15 different achievements',
    condition_type: 'Badges Collected',
    condition_value: 15,
    AchievementCategories: { name: 'Badge Collection' }
  },

  // Speed achievements
  quickDraw: {
    id: 15,
    name: 'Quick Draw',
    description: 'Answer a question in under 10 seconds',
    condition_type: 'Speed',
    condition_value: 10,
    AchievementCategories: { name: 'Speed' }
  },

  lightningFast: {
    id: 16,
    name: 'Lightning Fast',
    description: 'Answer 10 questions under 5 seconds each',
    condition_type: 'Speed',
    condition_value: 5,
    AchievementCategories: { name: 'Speed' }
  }
}

export const mockUserAchievements = [
  {
    ...mockAchievements.firstSteps,
    unlocked: true,
    unlocked_at: '2024-01-15T10:30:00Z',
    progress: 1
  },
  {
    ...mockAchievements.questioner,
    unlocked: false,
    progress: 7
  },
  {
    ...mockAchievements.onFire,
    unlocked: true,
    unlocked_at: '2024-01-16T14:20:00Z',
    progress: 5
  }
]

export const mockUsers = {
  testUser: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    elo: 1250,
    xp: 850,
    created_at: '2024-01-01T00:00:00Z'
  },

  beginnerUser: {
    id: 2,
    username: 'beginner',
    email: 'beginner@example.com',
    elo: 1000,
    xp: 100,
    created_at: '2024-02-01T00:00:00Z'
  },

  expertUser: {
    id: 3,
    username: 'expert',
    email: 'expert@example.com',
    elo: 1600,
    xp: 5000,
    created_at: '2023-12-01T00:00:00Z'
  }
}

export const mockQuestions = {
  basicMath: {
    Q_id: 1,
    questionText: 'What is 2 + 2?',
    answers: [
      { answer_text: '4', isCorrect: true },
      { answer_text: '3', isCorrect: false },
      { answer_text: '5', isCorrect: false },
      { answer_text: '6', isCorrect: false }
    ],
    difficulty: 'easy',
    topic: 'arithmetic'
  },

  algebra: {
    Q_id: 2,
    questionText: 'Solve for x: 2x + 5 = 13',
    answers: [
      { answer_text: '4', isCorrect: true },
      { answer_text: '3', isCorrect: false },
      { answer_text: '5', isCorrect: false },
      { answer_text: '6', isCorrect: false }
    ],
    difficulty: 'medium',
    topic: 'algebra'
  },

  factoring: {
    Q_id: 3,
    questionText: 'Factor: x² - 9',
    answers: [
      { answer_text: '(x+3)(x-3)', isCorrect: true },
      { answer_text: '(x-3)(x-3)', isCorrect: false },
      { answer_text: 'x(x-9)', isCorrect: false },
      { answer_text: '(x+9)(x-1)', isCorrect: false }
    ],
    difficulty: 'hard',
    topic: 'algebra'
  }
}

export const mockGameSessions = {
  practiceSession: {
    id: 1,
    userId: 1,
    gameMode: 'practice',
    questionsAnswered: 5,
    correctAnswers: 4,
    score: 80,
    xpEarned: 40,
    timeSpent: 300, // 5 minutes
    completed: true
  },

  competitiveSession: {
    id: 2,
    userId: 1,
    gameMode: 'competitive',
    questionsAnswered: 10,
    correctAnswers: 8,
    score: 800,
    xpEarned: 80,
    eloChange: 25,
    timeSpent: 600, // 10 minutes
    completed: true
  }
}

// API Response templates
export const mockApiResponses = {
  achievementProgress: {
    success: true,
    message: 'Achievement progress updated',
    unlockedAchievements: [mockAchievements.firstSteps]
  },

  achievementProgressMultiple: {
    success: true,
    message: 'Achievement progress updated',
    unlockedAchievements: [
      mockAchievements.firstSteps,
      mockAchievements.onFire
    ]
  },

  userAchievements: {
    success: true,
    data: mockUserAchievements
  },

  questionSubmission: {
    success: true,
    isCorrect: true,
    xpAwarded: 10,
    eloChange: 5,
    achievements: [mockAchievements.questioner]
  },

  error: {
    success: false,
    error: 'Internal server error'
  }
}

// Helper functions for creating test data
export const createMockAchievement = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  name: 'Test Achievement',
  description: 'A test achievement',
  condition_type: 'Questions Answered',
  condition_value: 10,
  AchievementCategories: { name: 'Gameplay' },
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  username: 'testuser',
  email: 'test@example.com',
  elo: 1200,
  xp: 500,
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockQuestion = (overrides = {}) => ({
  Q_id: Math.floor(Math.random() * 1000),
  questionText: 'What is 2 + 2?',
  answers: [
    { answer_text: '4', isCorrect: true },
    { answer_text: '3', isCorrect: false },
    { answer_text: '5', isCorrect: false },
    { answer_text: '6', isCorrect: false }
  ],
  difficulty: 'easy',
  topic: 'arithmetic',
  ...overrides
})

export const createMockGameSession = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  userId: 1,
  gameMode: 'practice',
  questionsAnswered: 5,
  correctAnswers: 4,
  score: 400,
  xpEarned: 40,
  timeSpent: 300,
  completed: true,
  created_at: new Date().toISOString(),
  ...overrides
})

// Scenario builders for complex test cases
export const buildAchievementUnlockScenario = (achievementType = 'Gameplay') => {
  const baseAchievement = createMockAchievement({
    AchievementCategories: { name: achievementType }
  })

  return {
    achievement: baseAchievement,
    user: createMockUser(),
    triggerAction: 'answer_question',
    expectedNotification: {
      show: true,
      achievement: baseAchievement
    }
  }
}

export const buildMultipleAchievementScenario = (count = 3) => {
  const achievements = Array.from({ length: count }, (_, i) => 
    createMockAchievement({
      id: i + 1,
      name: `Achievement ${i + 1}`,
      description: `Description for achievement ${i + 1}`
    })
  )

  return {
    achievements,
    user: createMockUser(),
    expectedNotifications: achievements.map(achievement => ({
      show: true,
      achievement
    }))
  }
}

export const buildProgressScenario = (currentProgress, targetValue) => {
  const achievement = createMockAchievement({
    condition_value: targetValue
  })

  return {
    achievement,
    currentProgress,
    targetValue,
    isUnlocked: currentProgress >= targetValue,
    progressPercentage: Math.min((currentProgress / targetValue) * 100, 100)
  }
}
