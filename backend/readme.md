# 🚀 ELO Learning Backend - Supabase Setup

This backend module connects to Supabase for handling user data, questions, answers, progress tracking, and more for the ELO Learning platform. It uses Node.js and the Supabase JS SDK.

---

## 📁 Folder Structure

```plaintext
📁 backend/
├── .env
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package.json
├── package-lock.json
├── readme.md
├── database/
├── src/
└── test/
```

---

## 📦 Dependencies

Install dependencies locally in the `/backend` folder:

```bash
cd backend
npm init -y             # If not already initialized
npm install express cors dotenv @supabase/supabase-js
```

## 🖥️ Running the Server

```bash
cd src
node server.js
```

You should see:

```bash
✅ Server is running on http://localhost:3000
```

## 🔁 API Endpoints

### ✅ Health Check

**GET /**
Returns:

```bash
"API is running successfully!"
```

---

## 👤 User Endpoints

### 🔍 Get All Users

**GET /users**
Returns:

```json
[
  {
    "id": 2,
    "name": "Alice",
    "surname": "Johnson",
    "username": "alicej",
    "email": "alice@example.com",
    "currentLevel": 2,
    "joinDate": "2024-09-15",
    "xp": 150.5
  },
  ...
]
```

### 🔍 Get User by ID (with Auth)

**GET /user/\:id**
Headers:

```plaintext
Authorization: Bearer <token>
```

Returns user with the given ID or error if not authorized or not found.

---

### 🏆 Get User Achievements

**GET /users/\:id/achievements**
Headers:

```plaintext
Authorization: Bearer <token>
```

Returns achievements of the user with the given ID.

---

### ✏️ Update User XP

**POST /user/\:id/xp**
Headers:

```plaintext
Authorization: Bearer <token>
```

Body:

```json
{
  "xp": 200.5
}
```

Updates the XP of the specified user.

---

## ❓ Question Endpoints

### 📋 Get All Questions

**GET /questions**
Returns a list of all questions.

---

### 🎯 Get Questions by Level (with Auth)

**GET /question/\:level**
Headers:

```plaintext
Authorization: Bearer <token>
```

Returns questions for a specific level.

---

### ✅ Get Correct Answer to Question (with Auth)

**GET /question/\:id/answer**
Headers:

```plaintext
Authorization: Bearer <token>
```

Returns the correct answer for the specified question ID.

---

### 🗂️ Get Questions by Topic

**GET /questions/topic?topic=topicName**
Query Parameters:

- `topic` (required): The topic to filter by.

Returns questions matching the topic.

---

### 🔍 Get Questions by Level and Topic

**GET /questions/level/topic?level=number\&topic=topicName**
Query Parameters:

- `level` (required): Level number
- `topic` (required): Topic name

Returns questions matching both level and topic.

---

### 🕹️ Single Player Attempt

**POST /singleplayer**
Description:
Records a new question attempt, calculates XP earned, updates the user's XP and level, and returns the updated values.

Request Body:

```json
{
  "user_id": 7,
  "question_id": 7,
  "isCorrect": true,
  "timeSpent": 18
}
```

Example Response:

```json
{
  "xpEarned": 6,
  "eloChange": 0.02,
  "newElo": 2.76,
  "leveledUp": false,
  "newRank": "Bronze",
  "totalXP": 860,
  "newLevel": 5
}
```

---

### ⚔️ Multiplayer Match Attempt

**POST /multiplayer**
Description:
Processes a multiplayer match between two players, calculates XP earned for each based on expected performance, updates both players’ XP (and level if applicable), and records the attempt.

Request Body:

```json
{
  "player1_id": 7,
  "player2_id": 14,
  "question_id": 22,
  "score1": 1,
  "xpTotal": 80
}
```

Example Response:

```json
{
  "message": "Multiplayer match processed successfully",
  "players": [
    {
      "id": 7,
      "xpEarned": 104,
      "newXP": 1104,
      "currentLevel": 6,
      "leveledUp": false
    },
    {
      "id": 14,
      "xpEarned": 56,
      "newXP": 906,
      "currentLevel": 5,
      "leveledUp": false
    }
  ]
}
```

---
