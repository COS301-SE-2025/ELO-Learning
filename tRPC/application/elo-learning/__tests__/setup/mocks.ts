// application/elo-learning/__tests__/setup/mocks.ts

// Mock Supabase client
export const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
    }),
  },
};

// Mock Express request
export const createMockRequest = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  headers: {},
  user: undefined,
  ...overrides,
});

// Mock Express response
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res;
};

// Test data factories
export const testData = {
  user: {
    id: 'test-user-id',
    name: 'Test',
    surname: 'User',
    username: 'testuser',
    email: 'test@example.com',
    currentLevel: 1,
    joinDate: '2024-01-01',
    xp: 100,
  },
  question: {
    Q_id: 'test-question-id',
    topic: 'algebra',
    difficulty: 'easy',
    level: 1,
    questionText: 'What is 2 + 2?',
    xpGain: 10,
    type: 'multiple-choice',
  },
  answer: {
    id: 'test-answer-id',
    question_id: 'test-question-id',
    answer_text: '4',
    isCorrect: true,
  },
};
