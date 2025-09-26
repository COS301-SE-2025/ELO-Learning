// classroomWars.js
import express from 'express';
import { calculateMultiplayerXP } from './utils/xpCalculator.js';
const router = express.Router();

// In-memory store for classroom wars rooms
const classroomWarsRooms = new Map();

// Default game config
const DEFAULT_LIVES = 3;
const DEFAULT_XP_TOTAL = 100;
const DEFAULT_QUESTIONS = 10; // For demo, can be replaced with real questions

// Helper to initialize player state
function initPlayerState(userId) {
  return {
    userId,
    lives: DEFAULT_LIVES,
    xp: 0,
    accuracy: 0,
    answered: 0,
    correct: 0,
    finished: false,
  };
}

// Create a new classroom war room
router.post('/classroom-wars/create', (req, res) => {
  const { creatorId, roomName } = req.body;
  if (!creatorId || !roomName) {
    return res.status(400).json({ error: 'Missing creatorId or roomName' });
  }
  if (classroomWarsRooms.has(roomName)) {
    return res.status(409).json({ error: 'Room already exists' });
  }
  classroomWarsRooms.set(roomName, {
    creatorId,
    started: false,
    players: [creatorId],
    createdAt: Date.now(),
    gameState: {
      questions: DEFAULT_QUESTIONS,
      playerStates: { [creatorId]: initPlayerState(creatorId) },
      leaderboard: [],
    },
  });
  return res.status(201).json({ roomName, creatorId });
});

// Join an existing classroom war room
router.post('/classroom-wars/join', (req, res) => {
  const { userId, roomName } = req.body;
  if (!userId || !roomName) {
    return res.status(400).json({ error: 'Missing userId or roomName' });
  }
  const room = classroomWarsRooms.get(roomName);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  if (room.started) {
    return res.status(403).json({ error: 'Game already started' });
  }
  // Prevent duplicate joins
  if (room.players.includes(userId)) {
    return res.status(409).json({ error: 'User already joined' });
  }
  room.players.push(userId);
  // Initialize player state
  room.gameState.playerStates[userId] = initPlayerState(userId);
  return res.status(200).json({ roomName, players: room.players });
});

// Start the classroom war game (only creator can start)
router.post('/classroom-wars/start', async (req, res) => {
  const { userId, roomName } = req.body;
  console.log(
    `[ClassroomWars] Start game requested for room: ${roomName} by user: ${userId}`,
  );
  const room = classroomWarsRooms.get(roomName);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  if (room.creatorId !== userId) {
    return res.status(403).json({ error: 'Only creator can start the game' });
  }
  if (room.started) {
    return res.status(400).json({ error: 'Game already started' });
  }
  room.started = true;
  room.startedAt = Date.now();
  // Fetch real questions from DB (Supabase)
  const supabase = req.app.get('supabase');
  let questions = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('Questions')
        .select('*')
        .limit(DEFAULT_QUESTIONS);
      if (!error && data) {
        questions = data;
      }
    } catch (err) {
      // fallback: empty questions
      questions = [];
    }
  }
  room.gameState.questions = questions;
  // Reset all player states for new game
  room.gameState.playerStates = {};
  room.players.forEach((uid) => {
    room.gameState.playerStates[uid] = initPlayerState(uid);
  });

  // Emit socket event to all room members (if socket.io is available)
  if (req.app.get('io')) {
    console.log(
      `[ClassroomWars] Emitting classroomWarsGameStarted to room: ${roomName}`,
    );
    req.app.get('io').to(roomName).emit('classroomWarsGameStarted', {
      roomName,
      players: room.players,
      started: true,
      questions,
    });
  }

  return res
    .status(200)
    .json({ roomName, players: room.players, started: true, questions });
});

// Submit answer (update lives, XP, accuracy)
// Expects: { roomName, userId, answer, questionIdx }
router.post('/classroom-wars/submit-answer', (req, res) => {
  const { roomName, userId, answer, questionIdx } = req.body;
  const room = classroomWarsRooms.get(roomName);
  if (!room || !room.started) {
    return res.status(404).json({ error: 'Room not found or not started' });
  }
  const player = room.gameState.playerStates[userId];
  if (!player || player.finished) {
    return res
      .status(400)
      .json({ error: 'Player not found or already finished' });
  }
  player.answered++;
  // Validate answer against correct answer for current question
  const question = room.gameState.questions[questionIdx];
  let isCorrect = false;
  if (question && question.correctAnswer !== undefined) {
    // Accept string or number match, case-insensitive
    isCorrect =
      String(answer).trim().toLowerCase() ===
      String(question.correctAnswer).trim().toLowerCase();
  }
  if (isCorrect) {
    player.correct++;
    player.xp += 10; // Simple XP for correct answer
  } else {
    player.lives--;
    if (player.lives <= 0) {
      player.lives = 0;
      player.finished = true;
    }
  }
  player.accuracy = player.correct / player.answered;
  // End game for player if all questions answered
  if (player.answered >= room.gameState.questions.length) {
    player.finished = true;
  }
  return res.status(200).json({
    userId,
    lives: player.lives,
    xp: player.xp,
    accuracy: player.accuracy,
    finished: player.finished,
    isCorrect,
  });
});

// End game and return leaderboard
// Expects: { roomName }
router.post('/classroom-wars/end', (req, res) => {
  const { roomName } = req.body;
  const room = classroomWarsRooms.get(roomName);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  // Build leaderboard from playerStates
  const leaderboard = Object.values(room.gameState.playerStates)
    .map((p) => ({
      userId: p.userId,
      xp: p.xp,
      accuracy: p.accuracy,
      answered: p.answered,
      correct: p.correct,
    }))
    .sort((a, b) => b.xp - a.xp || b.accuracy - a.accuracy);
  room.gameState.leaderboard = leaderboard;
  return res.status(200).json({ leaderboard });
});

// Get room info
router.get('/classroom-wars/room/:roomName', (req, res) => {
  const { roomName } = req.params;
  const room = classroomWarsRooms.get(roomName);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  return res.status(200).json(room);
});

// List all open rooms
router.get('/classroom-wars/rooms', (req, res) => {
  const rooms = Array.from(classroomWarsRooms.entries())
    .filter(([_, room]) => !room.started)
    .map(([name, room]) => ({
      name,
      creatorId: room.creatorId,
      players: room.players,
    }));
  return res.status(200).json({ rooms });
});

export default router;
