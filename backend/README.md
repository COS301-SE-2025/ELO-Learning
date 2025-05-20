# 🧠 ELO Learning – Backend (Demo 1)

This is the backend service for the ELO Learning platform, built with [NestJS](https://nestjs.com/) and PostgreSQL, hosted via Supabase.

## 🚀 Overview

The backend powers core features of the ELO Learning platform including:

- 🧪 **Practice Mode** – Fetch and submit questions, receive feedback
- 🧾 **Memorandum** – View correct answers after submission
- 🏆 **Leaderboard** – Track top performers based on XP/ELO
- 👤 **User Services** – Manage user data, XP, progress, achievements

> **Tech Stack**: NestJS · PostgreSQL (Supabase) · TypeScript · Docker · GitHub Actions

---

## 📁 Project Structure

```
/backend
├── /src
│   ├── /auth         # Authentication and JWT guard (in progress)
│   ├── /users        # User profile, XP, achievements
│   ├── /questions    # Questions by topic/level
│   ├── /answers      # Answer submission and feedback
│   ├── /leaderboard  # Leaderboard logic (XP-based)
│   ├── /shared       # Reusable DTOs, guards, etc.
│   ├── app.module.ts
│   └── main.ts
├── /database         # Schema and seed files
├── /tests            # Unit and integration tests
├── .env              # Environment config (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

### 📦 Install Dependencies

```bash
cd backend
npm install
```

### 🚧 Start Development Server

```bash
npm run start:dev
```

---

## 📦 Environment Variables

Create a `.env` file in `/backend` with:

```env
DATABASE_URL=your_supabase_postgres_url
JWT_SECRET=your_jwt_secret
```

---

## 🧪 Demo 1 Scope

For Demo 1, the following features are implemented or in progress:

- ✅ `GET /question/:level` – Get question based on level (Practice)
- ✅ `POST /question/:id/answer` – Submit answer
- ✅ `GET /question/:id/answer` – Get correct answer (Memo)
- ✅ `POST /user/:id/xp` – Update XP
- ✅ `GET /leaderboard/top` – Get top XP users

---

## 👥 Team (Backend)

| Role                 | Name             | GitHub           |
| -------------------- | ---------------- | ---------------- |
| 🧠 Data Engineer     | [Tonga Ntokozo]  | [@Ntokozo254]    |
| 🔧 DevOps & Backend  | [Mofati Nigel]   | [@brogrammer012] |
| 🛠️ Backend Developer | [Mokwena Tukelo] | [@Crispykitty]   |

---

## 🧾 License

MIT © 2025 ELO Learning – Capstone Project for COS 301
