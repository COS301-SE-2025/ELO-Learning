// application/elo-learning/__tests__/utils/testUtils.ts
import { Request, Response } from 'express';
import { jest } from '@jest/globals';

// Mock Express Request
export const createMockRequest = (
  overrides: Partial<Request> = {},
): Partial<Request> => ({
  params: {},
  query: {},
  body: {},
  headers: {},
  user: undefined,
  ...overrides,
});

// Mock Express Response
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res;
};

// Mock Supabase Response
export const createMockSupabaseResponse = (
  data: any = null,
  error: any = null,
) => ({
  data,
  error,
});

// Mock Supabase Client
export const createMockSupabaseClient = () => ({
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
});

// Test data factories
export const createTestUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  name: 'Test',
  surname: 'User',
  username: 'testuser',
  email: 'test@example.com',
  currentLevel: 1,
  joinDate: '2024-01-01',
  xp: 100,
  pfpURL: null,
  ...overrides,
});

export const createTestQuestion = (overrides: any = {}) => ({
  Q_id: 'test-question-id',
  topic: 'algebra',
  difficulty: 'easy',
  level: 1,
  questionText: 'What is 2 + 2?',
  xpGain: 10,
  type: 'multiple-choice',
  ...overrides,
});

export const createTestAnswer = (overrides: any = {}) => ({
  id: 'test-answer-id',
  question_id: 'test-question-id',
  answer_text: '4',
  isCorrect: true,
  ...overrides,
});

export const createTestTopic = (overrides: any = {}) => ({
  id: 'test-topic-id',
  name: 'Algebra',
  description: 'Basic algebra topics',
  level: 1,
  ...overrides,
});

// Helper for async route testing
export const testAsyncRoute = async (
  routeHandler: Function,
  req: Partial<Request>,
  res: Partial<Response>,
) => {
  try {
    await routeHandler(req, res);
  } catch (error) {
    // Route should handle its own errors
    throw error;
  }
};

// JWT Mock
export const createMockJWT = () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
  decode: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
});

// Mock authentication middleware
export const createMockAuthMiddleware = (user: any = null) => {
  return jest.fn((req: any, res: any, next: any) => {
    if (user) {
      req.user = user;
    }
    next();
  });
};

// Database operation helpers
export const expectSupabaseSelect = (mockSupabase: any, table: string) => {
  expect(mockSupabase.from).toHaveBeenCalledWith(table);
  expect(mockSupabase.from().select).toHaveBeenCalled();
};

export const expectSupabaseInsert = (
  mockSupabase: any,
  table: string,
  data: any,
) => {
  expect(mockSupabase.from).toHaveBeenCalledWith(table);
  expect(mockSupabase.from().insert).toHaveBeenCalledWith(data);
};

export const expectSupabaseUpdate = (
  mockSupabase: any,
  table: string,
  data: any,
) => {
  expect(mockSupabase.from).toHaveBeenCalledWith(table);
  expect(mockSupabase.from().update).toHaveBeenCalledWith(data);
};

export const expectSupabaseDelete = (mockSupabase: any, table: string) => {
  expect(mockSupabase.from).toHaveBeenCalledWith(table);
  expect(mockSupabase.from().delete).toHaveBeenCalled();
};
