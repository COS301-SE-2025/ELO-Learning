import axios from 'axios';

// Type definitions
interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  currentLevel: number;
  joinDate: string;
  xp: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  // Add other achievement properties as needed
}

interface Answer {
  id: number;
  answer_text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
  level: number;
  topic: string;
  type: string;
  xpGain: number;
  difficulty?: string;
}

interface Topic {
  id: number;
  name: string;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  success: boolean;
  user: User;
  token?: string;
}

// Backend response wrappers
interface BackendResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  // Add other common backend response properties
}

interface QuestionsResponse {
  questions: Question[];
}

interface TopicsResponse {
  topics: Topic[];
}

interface AnswersResponse {
  answer: Answer[];
}

const BASE_URL = 'http://localhost:3000'; // Change this when deploying

const isServer = typeof window === 'undefined';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(async (config: any) => {
  if (isServer) {
    const { cookies } = await import('next/headers');
    const awaitedCookies = await cookies();
    const cookiesString = awaitedCookies
      .getAll()
      .filter((item) => item.name === 'token')
      .map((item) => item.value);
    config.headers!.Authorization = `Bearer ${cookiesString}`;
    return config;
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  }
});

// Helper to attach auth token
const authHeader = {
  Authorization: 'Bearer testtoken123',
};

// 1. GET /users
export async function fetchAllUsers(): Promise<User[]> {
  const res = await axiosInstance.get('/api/users');
  return res.data;
}

// 2. GET /user/:id
export async function fetchUserById(id: number): Promise<User> {
  const res = await axiosInstance.get(`/api/users/${id}`, {
    headers: authHeader,
  });
  const data = res.data as any;
  return data.data || data as User;
}

// 3. GET /users/:id/achievements
export async function fetchUserAchievements(
  id: number,
): Promise<Achievement[]> {
  const res = await axiosInstance.get(`/api/users/${id}/achievements`, {
    headers: authHeader,
  });
  const data = res.data as any;
  return data.data || data as Achievement[] || [];
}

// 4. POST /user/:id/xp
export async function updateUserXP(
  id: number,
  xp: number,
): Promise<ApiResponse<User>> {
  const res = await axiosInstance.post(
    `/api/users/${id}/xp`,
    { xp },
    { headers: authHeader },
  );
  const data = res.data as any;
  return {
    success: data.success || true,
    data: data.data,
    message: data.message
  };
}

// 5. GET /questions
export async function fetchAllQuestions(): Promise<Question[]> {
  const res = await axiosInstance.get('/api/questions');
  return res.data.questions;
}

// 6. GET /question/:level
export async function fetchQuestionsByLevel(
  level: number,
): Promise<Question[]> {
  const res = await axiosInstance.get(`/api/questions/${level}`, {
    headers: authHeader,
  });
  const data = res.data as any;
  return data.questions || [];
}

// 7. GET /question/:id/answer
export async function fetchQuestionAnswer(id: number): Promise<Answer> {
  const res = await axiosInstance.get(`/api/questions/${id}/answer`, {
    headers: authHeader,
  });
  const data = res.data as any;
  const answers = data.answer || [];
  if (answers.length === 0) {
    throw new Error('No answer found');
  }
  return answers[0];
}

// 8. GET /questions/topic?topic=Algebra
export async function fetchQuestionsByTopic(
  topic: string,
): Promise<Question[]> {
  const res = await axiosInstance.get(`/api/questions/topic`, {
    params: { topic },
  });
  const data = res.data as any;
  return data.questions || [];
}

// 9. GET /questions/level/topic?level=2&topic=Algebra
export async function fetchQuestionsByLevelAndTopic(
  level: number,
  topic: string,
): Promise<Question[]> {
  const res = await axiosInstance.get('/api/questions/level/topic', {
    params: { level, topic },
  });
  const data = res.data as any;
  return data.questions || [];
}

// 10. POST /question/:id/answer
export async function submitAnswer(
  id: number,
  answer: string,
): Promise<ApiResponse<any>> {
  const res = await axiosInstance.post(`/api/questions/${id}/answer`, {
    question: [{ answer }],
  });
  const data = res.data as any;
  return {
    success: data.success || true,
    data: data.data,
    message: data.message
  };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await axiosInstance.post('/api/auth/login', { email, password });
  return res.data;
}

export async function registerUser(
  name: string,
  surname: string,
  username: string,
  email: string,
  password: string,
  currentLevel: number,
  joinDate: string,
): Promise<RegisterResponse> {
  const res = await axiosInstance.post('/api/auth/register', {
    name,
    surname,
    username,
    email,
    password,
    currentLevel,
    joinDate,
  });
  const data = res.data as any;
  return {
    success: data.success || true,
    user: data.user,
    token: data.token
  };
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// 11. GET /topics
export async function fetchAllTopics(): Promise<Topic[]> {
  const res = await axiosInstance.get('/api/topics');
  return res.data.topics;
}

// 12. GET /questions/random
export async function fetchRandomQuestions(level: number): Promise<Question[]> {
  const res = await axiosInstance.get('/api/questions/random', {
    params: {
      level,
    },
  });
  const data = res.data as any;
  return data.questions || [];
}

// 13. GET /questions/topic with answers - enhanced version
export async function fetchQuestionsWithAnswersByTopic(
  topic: string,
): Promise<Question[]> {
  const res = await axiosInstance.get(`/api/questions/topic`, {
    params: { topic },
  });

  const data = res.data as any;
  const questions = data.questions || [];

  if (!Array.isArray(questions) || questions.length === 0) {
    return [];
  }

  // Fetch answers for each question
  const questionsWithAnswers = await Promise.all(
    questions.map(async (question: any) => {
      try {
        const answersRes = await axiosInstance.get(
          `/api/questions/answers/${question.Q_id}`,
        );
        const answers = answersRes.data.answer || [];

        if (!Array.isArray(answers)) {
          console.error(
            `Answers is not an array for question ${question.Q_id}:`,
            answers,
          );
          return {
            id: question.Q_id,
            questionText: question.questionText,
            answers: [],
            level: question.level,
            topic: question.topic,
            type: question.type,
            xpGain: question.xpGain,
            difficulty: question.difficulty,
          };
        }

        return {
          id: question.Q_id,
          questionText: question.questionText,
          answers: answers,
          level: question.level,
          topic: question.topic,
          type: question.type,
          xpGain: question.xpGain,
          difficulty: question.difficulty,
        };
      } catch (error) {
        console.error(
          `Failed to fetch answers for question ${question.Q_id}:`,
          error,
        );
        return {
          id: question.Q_id,
          questionText: question.questionText,
          answers: [],
          level: question.level,
          topic: question.topic,
          type: question.type,
          xpGain: question.xpGain,
          difficulty: question.difficulty,
        };
      }
    }),
  );

  return questionsWithAnswers;
}