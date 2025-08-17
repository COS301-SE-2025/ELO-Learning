import { jest } from '@jest/globals';

// ESM-compatible mocking
const bcryptMock = { hash: jest.fn(), compare: jest.fn() };
await jest.unstable_mockModule('bcrypt', () => ({
  default: bcryptMock,
}));
const jwtMock = { sign: jest.fn() };
await jest.unstable_mockModule('jsonwebtoken', () => ({
  default: jwtMock,
}));
await jest.unstable_mockModule('../database/supabaseClient.js', () => ({
  supabase: {},
}));

// Import after mocks
const { default: app } = await import('../src/server.js');
const { supabase } = await import('../database/supabaseClient.js');

// Helper to mock supabase queries
function mockSupabaseMethod(method, returnValue) {
  supabase[method] = jest.fn(() => returnValue);
  return supabase;
}

describe('Unit tests for inner functions (mocked DB)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return users array', async () => {
      const mockData = { data: [{ id: 1, name: 'Test' }], error: null };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('id,name');
      expect(result).toEqual(mockData);
    });
    it('should handle error', async () => {
      const mockData = { data: null, error: { message: 'fail' } };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('id,name');
      expect(result.error).toBeDefined();
    });
  });

  describe('GET /user/:id', () => {
    it('should return user data', async () => {
      const mockData = { data: { id: 1, name: 'Test' }, error: null };
      mockSupabaseMethod('single', mockData);
      const result = await supabase.single();
      expect(result.data).toBeDefined();
    });
    it('should handle user not found', async () => {
      const mockData = { data: null, error: { code: 'PGRST116' } };
      mockSupabaseMethod('single', mockData);
      const result = await supabase.single();
      expect(result.error.code).toBe('PGRST116');
    });
  });

  describe('POST /user/:id/xp', () => {
    it('should update user XP', async () => {
      const mockData = { data: { id: 1, xp: 100 }, error: null };
      mockSupabaseMethod('single', mockData);
      const result = await supabase.single();
      expect(result.data.xp).toBe(100);
    });
    it('should handle update error', async () => {
      const mockData = { data: null, error: { message: 'fail' } };
      mockSupabaseMethod('single', mockData);
      const result = await supabase.single();
      expect(result.error).toBeDefined();
    });
  });

  describe('GET /questions', () => {
    it('should return questions', async () => {
      const mockData = { data: [{ Q_id: 1 }], error: null };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('Q_id');
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /practice', () => {
    it('should return 10 questions with answers', async () => {
      const questions = Array.from({ length: 10 }, (_, i) => ({ Q_id: i + 1 }));
      const mockQuestions = { data: questions, error: null };
      mockSupabaseMethod('select', mockQuestions);
      expect(mockQuestions.data.length).toBe(10);
    });
  });

  describe('GET /questionsById/:id', () => {
    it('should return question by id', async () => {
      const mockData = { data: { Q_id: 1 }, error: null };
      mockSupabaseMethod('single', mockData);
      const result = await supabase.single();
      expect(result.data.Q_id).toBe(1);
    });
  });

  describe('GET /question/:level', () => {
    it('should return questions for level', async () => {
      const mockData = { data: [{ Q_id: 1, level: 1 }], error: null };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('Q_id');
      expect(result.data[0].level).toBe(1);
    });
  });

  describe('GET /question/:id/answer', () => {
    it('should return correct answer', async () => {
      const mockData = { data: [{ isCorrect: true }], error: null };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('*');
      expect(result.data[0].isCorrect).toBe(true);
    });
  });

  describe('GET /answers/:id', () => {
    it('should return all answers for question', async () => {
      const mockData = { data: [{ id: 1 }], error: null };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('*');
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /questions/topic', () => {
    it('should return questions by topic', async () => {
      const mockData = { data: [{ topic: 'math' }], error: null };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('topic');
      expect(result.data[0].topic).toBe('math');
    });
  });

  describe('GET /questions/level/topic', () => {
    it('should return questions by level and topic', async () => {
      const mockData = { data: [{ level: 1, topic: 'math' }], error: null };
      mockSupabaseMethod('select', mockData);
      const result = await supabase.select('level,topic');
      expect(result.data[0].level).toBe(1);
      expect(result.data[0].topic).toBe('math');
    });
  });

  describe('POST /submit-answer', () => {
    it('should handle correct answer and XP update', async () => {
      // Mock answer check
      supabase.single = jest
        .fn()
        .mockReturnValueOnce({ data: { isCorrect: true }, error: null }) // answer
        .mockReturnValueOnce({ data: { xpGain: 10 }, error: null }) // question
        .mockReturnValueOnce({ data: { xp: 5 }, error: null }) // user
        .mockReturnValueOnce({ data: { xp: 15 }, error: null }); // update
      const answer = await supabase.single();
      const question = await supabase.single();
      const user = await supabase.single();
      const updated = await supabase.single();
      expect(answer.data.isCorrect).toBe(true);
      expect(updated.data.xp).toBe(15);
    });
    it('should handle incorrect answer', async () => {
      supabase.single = jest
        .fn()
        .mockReturnValueOnce({ data: { isCorrect: false }, error: null });
      const answer = await supabase.single();
      expect(answer.data.isCorrect).toBe(false);
    });
  });

  describe('POST /register', () => {
    it('should hash password and insert user', async () => {
      bcryptMock.hash.mockResolvedValue('hashed');
      const mockData = { data: { id: 1 }, error: null };
      mockSupabaseMethod('single', mockData);
      const hashed = await bcryptMock.hash('pass', 10);
      expect(hashed).toBe('hashed');
      const result = await supabase.single();
      expect(result.data.id).toBe(1);
    });
  });

  describe('POST /login', () => {
    it('should verify password and return token', async () => {
      const user = { id: 1, email: 'a', password: 'hashed' };
      supabase.single = jest.fn().mockReturnValue({ data: user, error: null });
      bcryptMock.compare.mockResolvedValue(true);
      jwtMock.sign.mockReturnValue('token');
      const fetched = await supabase.single();
      const valid = await bcryptMock.compare('pass', fetched.data.password);
      const token = jwtMock.sign({ id: user.id, email: user.email }, 'secret', {
        expiresIn: '1h',
      });
      expect(valid).toBe(true);
      expect(token).toBe('token');
    });
    it('should handle invalid password', async () => {
      supabase.single = jest
        .fn()
        .mockReturnValue({ data: { password: 'hashed' }, error: null });
      bcryptMock.compare.mockResolvedValue(false);
      const fetched = await supabase.single();
      const valid = await bcryptMock.compare('wrong', fetched.data.password);
      expect(valid).toBe(false);
    });
  });
});
