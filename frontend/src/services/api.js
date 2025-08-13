import axios from 'axios'
import { cache, CACHE_EXPIRY, CACHE_KEYS } from '../utils/cache'

const BASE_URL = 'http://localhost:3000' // Change this when deploying

const isServer = typeof window === 'undefined'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(async (config) => {
  if (isServer) {
    const { cookies } = await import('next/headers')
    const awaitedCookies = await cookies()

    // Try to get NextAuth session token first
    const nextAuthToken = awaitedCookies
      .getAll()
      .find(
        (item) =>
          item.name === 'next-auth.session-token' ||
          item.name === '__Secure-next-auth.session-token',
      )

    if (nextAuthToken) {
      config.headers.Authorization = `Bearer ${nextAuthToken.value}`
    } else {
      // Fallback to regular token
      const tokenCookie = awaitedCookies
        .getAll()
        .filter((item) => item.name === 'token')
        .map((item) => item.value)
      if (tokenCookie.length > 0) {
        config.headers.Authorization = `Bearer ${tokenCookie}`
      }
    }
    return config
  } else {
    // Client-side: Check NextAuth session first, then fallback to cached tokens
    let token = null

    // Try to get NextAuth session token from cache or localStorage
    const nextAuthSession = cache.get(CACHE_KEYS.NEXTAUTH_SESSION)
    if (nextAuthSession?.accessToken) {
      token = nextAuthSession.accessToken
    } else {
      // Fallback to our cached tokens
      const provider = cache.get('auth_provider') || 'credentials'

      if (provider === 'google' || provider === 'oauth') {
        token = cache.get('oauth_token') || localStorage.getItem('oauth_token')
      } else {
        token = cache.get(CACHE_KEYS.TOKEN) || localStorage.getItem('token')
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
})

// Helper to attach auth token
const authHeader = {
  Authorization: 'Bearer testtoken123',
}

// 1. GET /users
export async function fetchAllUsers() {
  // Try to get from cache first
  const cachedUsers = cache.get(CACHE_KEYS.LEADERBOARD)
  if (cachedUsers) {
    return cachedUsers
  }

  // If not in cache or expired, fetch from API
  const res = await axiosInstance.get('/users')
  // Cache the response with 5-minute expiry
  cache.set(CACHE_KEYS.LEADERBOARD, res.data, CACHE_EXPIRY.SHORT)
  return res.data
}

// 2. GET /user/:id
export async function fetchUserById(id) {
  const res = await axiosInstance.get(`/user/${id}`, {
    headers: authHeader,
  })
  return res.data
}

// 3. GET /users/:id/achievements
export async function fetchUserAchievements(id) {
  const res = await axiosInstance.get(`/users/${id}/achievements`, {
    headers: authHeader,
  })
  return res.data
}

// 4. POST /user/:id/xp
export async function updateUserXP(id, xp) {
  const res = await axiosInstance.post(
    `/user/${id}/xp`,
    { xp },
    { headers: authHeader },
  )
  return res.data
}

// 5. GET /questions
export async function fetchAllQuestions() {
  // Try to get from cache first
  const cachedQuestions = cache.get(CACHE_KEYS.QUESTIONS)
  if (cachedQuestions) {
    return cachedQuestions
  }

  const res = await axiosInstance.get('/questions')
  // Cache for 30 minutes
  cache.set(CACHE_KEYS.QUESTIONS, res.data, CACHE_EXPIRY.MEDIUM)
  return res.data
}

// 6. GET /question/:level
export async function fetchQuestionsByLevel(level) {
  const res = await axiosInstance.get(`/question/${level}`, {
    headers: authHeader,
  })
  return res.data
}

// 7. GET /question/:id/answer
export async function fetchQuestionAnswer(id) {
  const res = await axiosInstance.get(`/question/${id}/answer`, {
    headers: authHeader,
  })
  return res.data
}

// 8. GET /questions/topic?topic=Algebra
export async function fetchQuestionsByTopic(topic) {
  const res = await axiosInstance.get(`/questions/topic`, {
    params: { topic },
  })
  return res.data
}

// 9. GET /questions/level/topic?level=2&topic=Algebra
export async function fetchQuestionsByLevelAndTopic(level, topic) {
  const res = await axiosInstance.get('/questions/level/topic', {
    params: { level, topic },
  })
  return res.data
}

// 10. POST /question/:id/answer
export async function submitAnswer(id, answer) {
  const res = await axiosInstance.post(`/question/${id}/answer`, {
    question: [{ answer }],
  })
  return res.data
}

export async function loginUser(email, password) {
  const res = await axiosInstance.post('/login', { email, password })
  // Cache the user data and token
  cache.set(CACHE_KEYS.TOKEN, res.data.token, CACHE_EXPIRY.LONG)
  cache.set(CACHE_KEYS.USER, res.data.user, CACHE_EXPIRY.LONG)
  // Still store in localStorage for persistence
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('user', JSON.stringify(res.data.user))
  return res.data
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
  })
  // Cache the user data and token
  cache.set(CACHE_KEYS.TOKEN, res.data.token, CACHE_EXPIRY.LONG)
  cache.set(CACHE_KEYS.USER, res.data.user, CACHE_EXPIRY.LONG)
  // Store in localStorage for persistence
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('user', JSON.stringify(res.data.user))
  return res.data
}

export async function logoutUser() {
  // Clear both cache and localStorage
  cache.clear()
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 11. GET /topics
export async function fetchAllTopics() {
  const res = await axiosInstance.get('/topics')
  return res.data.topics
}

// 12. GET /questions/random

export async function fetchRandomQuestions(level) {
  const res = await axiosInstance.get('/questions/random', {
    params: {
      level,
    },
  })
  return res.data
}

//13. POST /singleplayer
export async function submitSinglePlayerAttempt(data) {
  const res = await axiosInstance.post('/singleplayer', data, {
    headers: authHeader,
  })
  return res.data
}

export async function sendPasswordResetEmail(email) {
  const res = await axiosInstance.post('/forgot-password', { email })
  return res.data
}

export async function resetPassword(token, newPassword) {
  const res = await axiosInstance.post('/reset-password', {
    token,
    newPassword,
  })
  return res.data
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const res = await axiosInstance.post('/change-password', {
    userId,
    currentPassword,
    newPassword,
  })
  return res.data
}

export async function verifyResetToken(token) {
  const res = await axiosInstance.get(`/verify-reset-token/${token}`)
  return res.data
}

// Handle OAuth user creation/retrieval
export async function handleOAuthUser(email, name, image, provider) {
  const res = await axiosInstance.post('/oauth/user', {
    email,
    name,
    image,
    provider,
  })
  return res.data
}

// Update user avatar
export async function updateUserAvatar(userId, avatar) {
  const res = await axiosInstance.post(`/user/${userId}/avatar`, { avatar }, {
    headers: authHeader,
  })
  return res
}
