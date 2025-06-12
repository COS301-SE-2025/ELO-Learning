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
