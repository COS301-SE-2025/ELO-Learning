-- Create database schema for ELO Learning application
-- This file creates all the necessary tables for D1 (SQLite)

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    currentLevel INTEGER,
    joinDate DATE,
    xp REAL DEFAULT 0,
    pfpURL TEXT
);

-- Topics table
CREATE TABLE IF NOT EXISTS Topics (
    topic_id INTEGER PRIMARY KEY,
    topicName TEXT NOT NULL,
    description TEXT
);

-- Levels table
CREATE TABLE IF NOT EXISTS Levels (
    level_id INTEGER PRIMARY KEY,
    levelNumber INTEGER NOT NULL,
    xpRequired REAL NOT NULL,
    description TEXT
);

-- Questions table
CREATE TABLE IF NOT EXISTS Questions (
    Q_id INTEGER PRIMARY KEY,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    level INTEGER NOT NULL,
    questionText TEXT NOT NULL,
    xpGain REAL NOT NULL,
    type TEXT NOT NULL,
    topic_id INTEGER,
    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id)
);

-- Answers table
CREATE TABLE IF NOT EXISTS Answers (
    A_id INTEGER PRIMARY KEY,
    Q_id INTEGER NOT NULL,
    answerText TEXT NOT NULL,
    isCorrect BOOLEAN NOT NULL,
    FOREIGN KEY (Q_id) REFERENCES Questions(Q_id)
);

-- QuestionAttempts table
CREATE TABLE IF NOT EXISTS QuestionAttempts (
    attempt_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    Q_id INTEGER NOT NULL,
    isCorrect BOOLEAN NOT NULL,
    attemptDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    xpEarned REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (Q_id) REFERENCES Questions(Q_id)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS Rooms (
    room_id INTEGER PRIMARY KEY,
    roomName TEXT NOT NULL,
    createdBy INTEGER NOT NULL,
    maxPlayers INTEGER DEFAULT 4,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS Achievements (
    achievement_id INTEGER PRIMARY KEY,
    achievementName TEXT NOT NULL,
    description TEXT,
    xpReward REAL DEFAULT 0,
    iconURL TEXT
);
