const BASE_URL = 'http://localhost:3000'; // change if backend is hosted

// 1. GET /users
export async function fetchAllUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
}

// 2. GET /user/:id
export async function fetchUserById(id) {
  const res = await fetch(`${BASE_URL}/user/${id}`, {
    headers: {
      Authorization: 'Bearer testtoken123',
    },
  });
  return res.json();
}

// 3. GET /users/:id/achievements
export async function fetchUserAchievements(id) {
  const res = await fetch(`${BASE_URL}/users/${id}/achievements`, {
    headers: {
      Authorization: 'Bearer testtoken123',
    },
  });
  return res.json();
}

// 4. POST /user/:id/xp
export async function updateUserXP(id, xp) {
  const res = await fetch(`${BASE_URL}/user/${id}/xp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer testtoken123',
    },
    body: JSON.stringify({ xp }),
  });
  return res.json();
}

// 5. GET /questions
export async function fetchAllQuestions() {
  const res = await fetch(`${BASE_URL}/questions`);
  return res.json();
}

// 6. GET /question/:level
export async function fetchQuestionsByLevel(level) {
  const res = await fetch(`${BASE_URL}/question/${level}`, {
    headers: {
      Authorization: 'Bearer testtoken123',
    },
  });
  return res.json();
}

// 7. GET /question/:id/answer
export async function fetchQuestionAnswer(id) {
  const res = await fetch(`${BASE_URL}/question/${id}/answer`, {
    headers: {
      Authorization: 'Bearer testtoken123',
    },
  });
  return res.json();
}

// 8. GET /questions/topic?topic=Algebra
export async function fetchQuestionsByTopic(topic) {
  const res = await fetch(`${BASE_URL}/questions/topic?topic=${topic}`);
  return res.json();
}

// 9. GET /questions/level/topic?level=2&topic=Algebra
export async function fetchQuestionsByLevelAndTopic(level, topic) {
  const res = await fetch(`${BASE_URL}/questions/level/topic?level=${level}&topic=${topic}`);
  return res.json();
}

// 10. POST /question/:id/answer
export async function submitAnswer(id, answer) {
  const res = await fetch(`${BASE_URL}/question/${id}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: [
        { answer }
      ]
    }),
  });
  return res.json();
}
