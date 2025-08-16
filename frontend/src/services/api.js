import axios from 'axios';


const BASE_URL = 'http://localhost:3000'; // Change this when deploying

const isServer = typeof window === 'undefined';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(async (config) => {
  if (isServer) {
    const { cookies } = await import('next/headers');
    const awaitedCookies = await cookies();
    const cookiesString = awaitedCookies
      .getAll()
      .filter((item) => item.name === 'token')
      .map((item) => item.value);
    config.headers.Authorization = `Bearer ${cookiesString}`;
    return config;
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
});

// Helper to attach auth token
const authHeader = {
  Authorization: 'Bearer testtoken123',
};

// 1. GET /users
export async function fetchAllUsers() {
  const res = await axiosInstance.get('/users');
  return res.data;
}

// 2. GET /user/:id
export async function fetchUserById(id) {
  const res = await axiosInstance.get(`/user/${id}`, {
    headers: authHeader,
  });
  return res.data;
}

// 3. GET /users/:id/achievements
export async function fetchUserAchievements(id) {
  const res = await axiosInstance.get(`/users/${id}/achievements`, {
    headers: authHeader,
  });
  return res.data;
}

// 4. POST /user/:id/xp
export async function updateUserXP(id, xp) {
  const res = await axiosInstance.post(
    `/user/${id}/xp`,
    { xp },
    { headers: authHeader },
  );
  return res.data;
}

// 5. GET /questions
export async function fetchAllQuestions() {
  const res = await axiosInstance.get('/questions');
  return res.data;
}

// 6. GET /question/:level
export async function fetchQuestionsByLevel(level) {
  const res = await axiosInstance.get(`/question/${level}`, {
    headers: authHeader,
  });
  return res.data;
}

// 7. GET /question/:id/answer
export async function fetchQuestionAnswer(id) {
  const res = await axiosInstance.get(`/question/${id}/answer`, {
    headers: authHeader,
  });
  return res.data;
}

// 8. GET /questions/topic?topic=Algebra
export async function fetchQuestionsByTopic(topic) {
  const res = await axiosInstance.get(`/questions/topic`, {
    params: { topic },
  });
  return res.data;
}

// 9. GET /questions/level/topic?level=2&topic=Algebra
export async function fetchQuestionsByLevelAndTopic(level, topic) {
  const res = await axiosInstance.get('/questions/level/topic', {
    params: { level, topic },
  });
  return res.data;
}

// 10. POST /question/:id/answer
export async function submitAnswer(id, answer) {
  const res = await axiosInstance.post(`/question/${id}/answer`, {
    question: [{ answer }],
  });
  return res.data;
}

export async function loginUser(email, password) {
  const res = await axiosInstance.post('/login', { email, password });
  return res.data;
}

export async function registerUser(
  name,
  surname,
  username,
  email,
  password,
  currentLevel,
  joinDate,
  baseLineTest,
) {
  const res = await axiosInstance.post('/register', {
    name,
    surname,
    username,
    email,
    password,
    currentLevel,
    joinDate,
    baseLineTest,
  });

  return res.data;
}

export async function logoutUser() {
  // This function is kept for backward compatibility
  // For new implementations, use performLogout from @/lib/logout
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// 11. GET /topics
export async function fetchAllTopics() {
  const res = await axiosInstance.get('/topics');
  return res.data.topics;
}

// 12. GET /questions/random

export async function fetchRandomQuestions(level) {
  const res = await axiosInstance.get('/questions/random', {
    params: {
      level,
    },
  });
  return res.data;
}

//13. POST /singleplayer
export async function submitSinglePlayerAttempt(data) {
  const res = await axiosInstance.post('/singleplayer', data, {
    headers: authHeader,
  });
  return res.data;
}

export async function sendPasswordResetEmail(email) {
  const res = await axiosInstance.post('/forgot-password', { email });
  return res.data;
}

export async function resetPassword(token, newPassword) {
  const res = await axiosInstance.post('/reset-password', {
    token,
    newPassword,
  });
  return res.data;
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const res = await axiosInstance.post('/change-password', {
    userId,
    currentPassword,
    newPassword,
  });
  return res.data;
}

export async function verifyResetToken(token) {
  const res = await axiosInstance.get(`/verify-reset-token/${token}`);
  return res.data;
}

// Handle OAuth user creation/retrieval
export async function handleOAuthUser(email, name, image, provider) {
  const res = await axiosInstance.post('/oauth/user', {
    email,
    name,
    image,
    provider,
  });
  return res.data;
}

//Baseline Related Functions

// Fetch all baseline questions
export async function fetchAllBaselineQuestions() {
  try {
    const res = await axiosInstance.get('/questions/random', {
      params: {
        level: 5, // Start with level 5 for baseline
        count: 10 // Get 10 questions
      }
    });
    
    if (!res.data || !res.data.questions) {
      throw new Error('No questions received from server');
    }

    return res.data.questions;
  } catch (err) {
    console.error('fetchBaselineQuestions error:', err);
    throw new Error('Failed to fetch baseline questions: ' + (err.response?.data?.message || err.message));
  }
}

// Skip baseline test - When user opts out
export async function skipBaselineTest(userId) {
  if (!userId) throw new Error('Missing userId');
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/baseline/skip`, {
      user_id: userId,
    });
    return res.data; // { success: true }
  } catch (err) {
    console.error('Failed to skip baseline test:', err);
    throw err;
  }
}

// Submit baseline result
export async function submitBaselineResult(userId, finalElo) {
  const res = await fetch('/baseline/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, finalElo })
  });
  const data = await res.json();
  return data;
}

export async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/user/me'); // you need a backend route returning session info
    if (!res.ok) throw new Error('Failed to fetch user');
    return await res.json(); // should return { id, baseLineTest, ... }
  } catch (err) {
    console.error(err);
    return null;
  }
}

//temporary:
export async function fetchBaselineQuestion(level) {
  try {
    const res = await axiosInstance.get(`/baseline/questions/${level}`);
    return res.data;
  } catch (err) {
    console.error('Failed to fetch baseline question:', err);
    throw new Error('Failed to fetch baseline question: ' + (err.response?.data?.message || err.message));
  }
}

export async function updateUserElo(userId, elo) {
  try {
    const res = await axiosInstance.post('/baseline/complete', {
      user_id: userId,
      finalElo: elo
    });
    return res.data;
  } catch (err) {
    console.error('Failed to update user Elo:', err);
    throw err;
  }
}
