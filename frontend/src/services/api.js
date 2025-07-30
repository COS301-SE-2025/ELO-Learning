import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // Change this when deploying

const isServer = typeof window === 'undefined';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
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
  return res.data;
}

export async function logoutUser() {
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

export async function changePassword(currentPassword, newPassword) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  const res = await axiosInstance.post('/change-password', {
    userId: user.id,
    currentPassword,
    newPassword,
  });
  return res.data;
}

export async function verifyResetToken(token) {
  const res = await axiosInstance.get(`/verify-reset-token/${token}`);
  return res.data;
}

export async function fetchAchievementCategories() {
  const res = await axiosInstance.get('/achievement-categories');
  return res.data.categories;
}

export async function fetchAllAchievements(categoryId = null) {
  const params = categoryId ? { category_id: categoryId } : {};
  const res = await axiosInstance.get('/achievements', { params });
  return res.data.achievements;
}

export async function fetchUserAchievements(userId) {
  const res = await axiosInstance.get(`/users/${userId}/achievements`);
  return res.data.achievements;
}

export async function fetchUserAchievementsWithStatus(userId) {
  const res = await axiosInstance.get(`/users/${userId}/achievements/all`);
  return res.data.achievements;
}

export async function updateAchievementProgress(
  userId,
  achievementId,
  increment = 1,
) {
  const res = await axiosInstance.post(
    `/users/${userId}/achievements/progress`,
    {
      achievement_id: achievementId,
      increment_by: increment,
    },
  );
  return res.data;
}
