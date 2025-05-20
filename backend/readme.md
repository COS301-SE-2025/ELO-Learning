# 🚀 ELO Learning Backend - Supabase Setup

This backend module connects to Supabase for handling user data, questions, answers, progress tracking, and more for the ELO Learning platform. It uses Node.js and the Supabase JS SDK.

---

## 📁 Folder Structure

/backend
|-- .env
|-- server.js
|-- supabaseClient.js
|-- package.json
└── readme.md

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
node server.js
```

You should see:

```bash
✅ Server is running on http://localhost:3000
```

## 🔁 API Endpoints

GET/

Returns:

```bash
"API is running 🎉"
```

### 👤 Get All Users

GET /users

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
    {
        "id": 3,
        "name": "Bob",
        "surname": "Smith",
        "username": "bobsmith",
        "email": "bob@example.com",
        "currentLevel": 5,
        "joinDate": "2024-10-01",
        "xp": 300
    },
    {
        "id": 4,
        "name": "Charlie",
        "surname": "Lee",
        "username": "charlielee",
        "email": "charlie@example.com",
        "currentLevel": 1,
        "joinDate": "2024-11-20",
        "xp": 75
    },
    {
        "id": 5,
        "name": "Alice",
        "surname": "Walker",
        "username": "alicew",
        "email": "alice@example.com",
        "currentLevel": 1,
        "joinDate": "2024-01-10",
        "xp": 120.5
    },
    {
        "id": 6,
        "name": "Bob",
        "surname": "Smith",
        "username": "bobsmith",
        "email": "bob@example.com",
        "currentLevel": 2,
        "joinDate": "2024-01-12",
        "xp": 230
    },
    {
        "id": 7,
        "name": "Carol",
        "surname": "Nguyen",
        "username": "caroln",
        "email": "carol@example.com",
        "currentLevel": 1,
        "joinDate": "2024-01-14",
        "xp": 180
    },
    {
        "id": 8,
        "name": "David",
        "surname": "Jones",
        "username": "davidj",
        "email": "david@example.com",
        "currentLevel": 3,
        "joinDate": "2024-01-16",
        "xp": 310.2
    },
    {
        "id": 9,
        "name": "Ella",
        "surname": "Martinez",
        "username": "ellam",
        "email": "ella@example.com",
        "currentLevel": 2,
        "joinDate": "2024-01-18",
        "xp": 150.8
    },
  ...
]
```
