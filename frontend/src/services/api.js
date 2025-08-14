// api.js - FIXED VERSION
import axios from 'axios';
import { performanceCache, CACHE_DURATIONS } from '../utils/performanceCache';


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const isServer = typeof window === 'undefined';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  if (isServer) {
    const { cookies } = await import('next/headers');
    const awaitedCookies = await cookies();

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
      const tokenCookie = awaitedCookies
        .getAll()
        .filter((item) => item.name === 'token')
        .map((item) => item.value);
      if (tokenCookie.length > 0) {
        config.headers.Authorization = `Bearer ${tokenCookie}`;
      }
    }
    return config;
  } else {
    // CLIENT-SIDE: SIMPLE TOKEN RETRIEVAL (NO CACHE!)
    let token = null;

    try {
      // Try direct localStorage access only
      token = localStorage.getItem('token') || localStorage.getItem('oauth_token');
      
      console.log('🔐 Token retrieved for API call:', token ? 'Found' : 'Not found');
      
    } catch (error) {
      console.warn('Token retrieval failed:', error);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  }
});

// Helper to attach auth token (for backward compatibility)
const authHeader = {
  Authorization: 'Bearer testtoken123',
};

// LEADERBOARD - Cache 
export async function fetchAllUsers() {
  try {
    const cached = performanceCache.get('users', CACHE_DURATIONS.QUICK);
    if (cached) return cached;

    console.log('🌐 Fetching fresh users data...');
    const res = await axiosInstance.get('/users');
    
    performanceCache.set('users', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Failed to fetch users:', error);
    throw error;
  }
}

// QUESTIONS - Cache for 30 minutes (rarely change)
export async function fetchAllQuestions() {
  try {
    const cached = performanceCache.get('questions', CACHE_DURATIONS.LONG);
    if (cached) return cached;

    console.log('🌐 Fetching fresh questions data...');
    const res = await axiosInstance.get('/questions');
    
    performanceCache.set('questions', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Failed to fetch questions:', error);
    throw error;
  }
}


export async function loginUser(email, password) {
  try {
    console.log('🚀 Starting login...');
    
    const res = await axiosInstance.post('/login', { email, password });
    
    console.log('✅ Login API response:', res.data);
    
    // SIMPLE, DIRECT STORAGE
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      console.log('✅ Token stored:', res.data.token);
    }
    
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
      console.log('✅ User data stored:', res.data.user);
    }
    
    localStorage.setItem('auth_provider', 'credentials');
    
    console.log('🎉 Login completed successfully');
    return res.data;
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
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
  try {
    console.log('🚀 Starting registration...');
    
    const res = await axiosInstance.post('/register', {
      name,
      surname,
      username,
      email,
      password,
      currentLevel,
      joinDate,
    });
    
    console.log('✅ Registration API response:', res.data);
    
    // SIMPLE, DIRECT STORAGE - No complex caching
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      console.log('✅ Token stored');
    }
    
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
      console.log('✅ User data stored:', res.data.user);
    }
    
    // Set auth provider
    localStorage.setItem('auth_provider', 'credentials');
    
    console.log('🎉 Registration completed successfully');
    return res.data;
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}


// LOGOUT - Clear performance cache
export async function logoutUser() {
  try {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('oauth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_provider');
    
    // Clear performance cache
    performanceCache.clear();
    
    console.log('🧹 Logout cleanup completed (auth + cache cleared)');
    return true;
  } catch (error) {
    console.error('Logout cleanup failed:', error);
    return false;
  }
}


// Handle OAuth user creation/retrieval
export async function handleOAuthUser(email, name, image, provider) {
  try {
    const res = await axiosInstance.post('/oauth/user', {
      email,
      name,
      image,
      provider,
    });
    
    // SIMPLE STORAGE - consistent with login/register
    if (res.data.token) {
      localStorage.setItem('oauth_token', res.data.token);
      localStorage.setItem('auth_provider', provider);
    }
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    
    return res.data;
  } catch (error) {
    console.error('OAuth user handling failed:', error);
    throw error;
  }
}

// OTHER API FUNCTIONS (unchanged but with better error handling)
export async function fetchUserById(id) {
  const res = await axiosInstance.get(`/user/${id}`, {
    headers: authHeader,
  });
  return res.data;
}

// USER ACHIEVEMENTS - Cache for 10 minutes per user
export async function fetchUserAchievements(id) {
  try {
    const cacheKey = `achievements_${id}`;
    const cached = performanceCache.get(cacheKey, CACHE_DURATIONS.MEDIUM);
    if (cached) return cached;

    console.log(`🌐 Fetching achievements for user ${id}...`);
    const res = await axiosInstance.get(`/users/${id}/achievements`, {
      headers: authHeader,
    });
    
    performanceCache.set(cacheKey, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Failed to fetch achievements for user ${id}:`, error);
    throw error;
  }
}

// UPDATE USER XP - Smart cache invalidation
export async function updateUserXP(id, xp) {
  try {
    console.log(`🚀 Updating XP for user ${id} to ${xp}...`);
    
    const res = await axiosInstance.post(
      `/user/${id}/xp`,
      { xp },
      { headers: authHeader },
    );
    
    // SMART INVALIDATION: XP changed, so invalidate related caches
    performanceCache.refresh('users'); // Leaderboard will change
    performanceCache.refresh(`achievements_${id}`); // User achievements might change
    
    // Update user data in localStorage too
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        if (userData.id === parseInt(id)) {
          userData.xp = xp;
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ User XP updated in localStorage');
        }
      } catch (error) {
        console.warn('Failed to update user XP in localStorage:', error);
      }
    }
    
    console.log('✅ XP update completed with cache invalidation');
    return res.data;
  } catch (error) {
    console.error('❌ Failed to update XP:', error);
    throw error;
  }
}

// QUESTIONS BY LEVEL - Cache for 30 minutes per level
export async function fetchQuestionsByLevel(level) {
  try {
    const cacheKey = `questions_level_${level}`;
    const cached = performanceCache.get(cacheKey, CACHE_DURATIONS.LONG);
    if (cached) return cached;

    console.log(`🌐 Fetching questions for level ${level}...`);
    const res = await axiosInstance.get(`/question/${level}`, {
      headers: authHeader,
    });
    
    performanceCache.set(cacheKey, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Failed to fetch questions for level ${level}:`, error);
    throw error;
  }
}

export async function fetchQuestionAnswer(id) {
  const res = await axiosInstance.get(`/question/${id}/answer`, {
    headers: authHeader,
  });
  return res.data;
}

// QUESTIONS BY TOPIC - Cache for 30 minutes per topic
export async function fetchQuestionsByTopic(topic) {
  try {
    const cacheKey = `questions_topic_${topic}`;
    const cached = performanceCache.get(cacheKey, CACHE_DURATIONS.LONG);
    if (cached) return cached;

    console.log(`🌐 Fetching questions for topic ${topic}...`);
    const res = await axiosInstance.get(`/questions/topic`, {
      params: { topic },
    });
    
    performanceCache.set(cacheKey, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Failed to fetch questions for topic ${topic}:`, error);
    throw error;
  }
}

// QUESTIONS BY LEVEL AND TOPIC - Cache for 30 minutes per combination
export async function fetchQuestionsByLevelAndTopic(level, topic) {
  try {
    const cacheKey = `questions_${level}_${topic}`;
    const cached = performanceCache.get(cacheKey, CACHE_DURATIONS.LONG);
    if (cached) return cached;

    console.log(`🌐 Fetching questions for level ${level}, topic ${topic}...`);
    const res = await axiosInstance.get('/questions/level/topic', {
      params: { level, topic },
    });
    
    performanceCache.set(cacheKey, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Failed to fetch questions for level ${level}, topic ${topic}:`, error);
    throw error;
  }
}

export async function submitAnswer(id, answer) {
  const res = await axiosInstance.post(`/question/${id}/answer`, {
    question: [{ answer }],
  });
  return res.data;
}

// TOPICS - Cache for 30 minutes (rarely change)
export async function fetchAllTopics() {
  try {
    const cached = performanceCache.get('topics', CACHE_DURATIONS.LONG);
    if (cached) return cached;

    console.log('🌐 Fetching fresh topics data...');
    const res = await axiosInstance.get('/topics');
    
    performanceCache.set('topics', res.data.topics);
    return res.data.topics;
  } catch (error) {
    console.error('❌ Failed to fetch topics:', error);
    throw error;
  }
}

// RANDOM QUESTIONS - Cache for 10 minutes per level
export async function fetchRandomQuestions(level) {
  try {
    const cacheKey = `random_questions_${level}`;
    const cached = performanceCache.get(cacheKey, CACHE_DURATIONS.MEDIUM);
    if (cached) return cached;

    console.log(`🌐 Fetching random questions for level ${level}...`);
    const res = await axiosInstance.get('/questions/random', {
      params: { level },
    });
    
    performanceCache.set(cacheKey, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Failed to fetch random questions for level ${level}:`, error);
    throw error;
  }
}

//  SUBMIT SINGLE PLAYER ATTEMPT - Invalidate relevant caches
export async function submitSinglePlayerAttempt(data) {
  try {
    console.log('🚀 Submitting single player attempt...');
    
    const res = await axiosInstance.post('/singleplayer', data, {
      headers: authHeader,
    });
    
    // If this updates XP or achievements, invalidate caches
    if (res.data.xpAwarded || res.data.achievementUnlocked) {
      performanceCache.refresh('users'); // Leaderboard might change
      if (data.userId) {
        performanceCache.refresh(`achievements_${data.userId}`);
      }
      console.log('🔄 Invalidated caches due to XP/achievement changes');
    }
    
    return res.data;
  } catch (error) {
    console.error('❌ Failed to submit single player attempt:', error);
    throw error;
  }
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

export async function updateUserAvatar(userId, avatar) {
  const res = await axiosInstance.post(
    `/user/${userId}/avatar`,
    { avatar },
    {
      headers: authHeader,
    },
  );
  return res;
}