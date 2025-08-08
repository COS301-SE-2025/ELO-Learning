import axios from 'axios';
import { cache, CACHE_EXPIRY, CACHE_KEYS } from '../utils/cache';

const BASE_URL = 'http://localhost:3000'; // Change this when deploying

const isServer = typeof window === 'undefined';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token with performance optimization
axiosInstance.interceptors.request.use(async (config) => {
  // Skip auth for random questions endpoint to improve performance
  if (config.url === '/questions/random') {
    return config;
  }
  
  if (isServer) {
    // Server-side token handling
    const { cookies } = await import('next/headers');
    const awaitedCookies = await cookies();

    // Priority 1: NextAuth session token (for OAuth users)
    const nextAuthToken = awaitedCookies
      .getAll()
      .find(
        (item) =>
          item.name === 'next-auth.session-token' ||
          item.name === '__Secure-next-auth.session-token',
      );

    if (nextAuthToken) {
      config.headers.Authorization = `Bearer ${nextAuthToken.value}`;
    } else {
      // Priority 2: Custom JWT token (for credential users)
      const tokenCookie = awaitedCookies
        .getAll()
        .filter((item) => item.name === 'token')
        .map((item) => item.value);
      if (tokenCookie.length > 0) {
        config.headers.Authorization = `Bearer ${tokenCookie[0]}`;
      }
    }
    return config;
  } else {
    // Client-side token handling
    let token = null;

    // Priority 1: NextAuth session from cache
    const nextAuthSession = cache.get(CACHE_KEYS.NEXTAUTH_SESSION);
    if (nextAuthSession?.accessToken) {
      token = nextAuthSession.accessToken;
    } else {
      // Priority 2: JWT token from localStorage
      token = cache.get(CACHE_KEYS.TOKEN) || localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
});

// Helper to get dynamic auth token
function getDynamicAuthHeader() {
  if (typeof window === 'undefined') {
    // Server-side: return empty object, let interceptor handle it
    return {};
  }

  // Client-side: try to get token from various sources

  // 1. Try NextAuth session (with backend JWT token)
  const nextAuthSession = cache.get(CACHE_KEYS.NEXTAUTH_SESSION);
  if (nextAuthSession?.backendToken) {
    return { Authorization: `Bearer ${nextAuthSession.backendToken}` };
  }

  // 2. Try NextAuth OAuth access token (for OAuth users)
  if (nextAuthSession?.accessToken) {
    return { Authorization: `Bearer ${nextAuthSession.accessToken}` };
  }

  // 3. Fallback to localStorage token (direct JWT login)
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  // 4. Check for cookie-based authentication (manual JWT storage)
  try {
    const tokenCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='));

    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      return { Authorization: `Bearer ${token}` };
    }
  } catch (error) {
    console.error('Error parsing token cookie:', error);
  }

  // No token available - this will cause 401 for protected routes
  console.warn('No authentication token found for API request');
  return {};
}

// 1. GET /users
export async function fetchAllUsers() {
  // Try to get from cache first
  const cachedUsers = cache.get(CACHE_KEYS.LEADERBOARD);
  if (cachedUsers) {
    return cachedUsers;
  }

  // If not in cache or expired, fetch from API
  const res = await axiosInstance.get('/users');
  // Cache the response with 5-minute expiry
  cache.set(CACHE_KEYS.LEADERBOARD, res.data, CACHE_EXPIRY.SHORT);
  return res.data;
}

// 2. GET /user/:id
export async function fetchUserById(id) {
  const res = await axiosInstance.get(`/user/${id}`, {
    headers: getDynamicAuthHeader(),
  });
  return res.data;
}

// 3. GET /users/:id/achievements
export async function fetchUserAchievements(id) {
  const res = await axiosInstance.get(`/users/${id}/achievements`, {
    headers: getDynamicAuthHeader(),
  });
  return res.data;
}

// 4. POST /user/:id/xp
export async function updateUserXP(id, xp) {
  const res = await axiosInstance.post(
    `/user/${id}/xp`,
    { xp },
    { headers: getDynamicAuthHeader() },
  );
  return res.data;
}

// 5. GET /questions
export async function fetchAllQuestions() {
  // Try to get from cache first
  const cachedQuestions = cache.get(CACHE_KEYS.QUESTIONS);
  if (cachedQuestions) {
    return cachedQuestions;
  }

  const res = await axiosInstance.get('/questions');
  // Cache for 30 minutes
  cache.set(CACHE_KEYS.QUESTIONS, res.data, CACHE_EXPIRY.MEDIUM);
  return res.data;
}

// 6. GET /question/:level
export async function fetchQuestionsByLevel(level) {
  const res = await axiosInstance.get(`/question/${level}`, {
    headers: getDynamicAuthHeader(),
  });
  return res.data;
}

// 7. GET /question/:id/answer
export async function fetchQuestionAnswer(id) {
  const res = await axiosInstance.get(`/question/${id}/answer`, {
    headers: getDynamicAuthHeader(),
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
// 9. POST /answer
export async function submitAnswer(questionId, answer) {
  const res = await axiosInstance.post(
    '/answer',
    { questionId, answer },
    { headers: getDynamicAuthHeader() },
  );
  return res.data;
}

export async function loginUser(email, password) {
  const res = await axiosInstance.post('/login', { email, password });
  // Cache the user data and token
  cache.set(CACHE_KEYS.TOKEN, res.data.token, CACHE_EXPIRY.LONG);
  cache.set(CACHE_KEYS.USER, res.data.user, CACHE_EXPIRY.LONG);
  // Still store in localStorage for persistence
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
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
) {
  const res = await axiosInstance.post('/register', {
    name,
    surname,
    username,
    email,
    password,
    currentLevel,
    joinDate,
  });
  // Cache the user data and token
  cache.set(CACHE_KEYS.TOKEN, res.data.token, CACHE_EXPIRY.LONG);
  cache.set(CACHE_KEYS.USER, res.data.user, CACHE_EXPIRY.LONG);
  // Store in localStorage for persistence
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
}

export async function logoutUser() {
  // Clear both cache and localStorage
  cache.clear();
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
  try {
    console.log('fetchRandomQuestions called with level:', level);
    console.log('BASE_URL:', BASE_URL);
    console.log('isServer:', typeof window === 'undefined');
    
    const res = await axiosInstance.get('/questions/random', {
      params: {
        level,
      },
    });
    console.log('fetchRandomQuestions success:', res.status);
    console.log('Questions received:', res.data?.questions?.length || 0);
    
    return res.data;
  } catch (error) {
    console.error('fetchRandomQuestions error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      level: level,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    // If the requested level has no questions, try level 1 as fallback
    if (error.response?.status === 404 && level !== 1) {
      console.log('No questions found for level', level, 'trying level 1 as fallback...');
      try {
        const fallbackRes = await axiosInstance.get('/questions/random', {
          params: {
            level: 1,
          },
        });
        console.log('Fallback to level 1 successful');
        return fallbackRes.data;
      } catch (fallbackError) {
        console.error('Fallback to level 1 also failed:', fallbackError.message);
        throw error; // Throw original error
      }
    }
    
    throw error;
  }
}

//13. POST /singleplayer
export async function submitSinglePlayerAttempt(data) {
  const res = await axiosInstance.post('/singleplayer', data, {
    headers: getDynamicAuthHeader(),
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
  const res = await axiosInstance.post(
    `/user/${userId}/change-password`,
    { currentPassword, newPassword },
    { headers: getDynamicAuthHeader() },
  );
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
