'use client';
import { useState, useEffect } from 'react';
import classroomWarsSocket from '@/utils/classroomWarsSocket';
import {
  createClassroomWarRoom,
  joinClassroomWarRoom,
  startClassroomWarGame,
  getClassroomWarRoom,
  listClassroomWarRooms,
  submitClassroomWarAnswer,
  endClassroomWarGame,
} from '@/services/api';

export default function ClassroomWarsPage() {
  const [roomName, setRoomName] = useState('');
  const [userId, setUserId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Listen for game started event
    const gameStartedHandler = (data) => {
      console.log(
        `[Socket] classroomWarsGameStarted received for room: ${data.roomName}`,
      );
      if (!currentRoom || !currentRoom.name) return;
      if (data.roomName === currentRoom.name) {
        setGameStarted(true);
        setQuestions(data.questions || []);
        setQuestionIdx(0);
        handleGetRoomInfo(data.roomName);
      }
    };
    classroomWarsSocket.on('classroomWarsGameStarted', gameStartedHandler);
    // Cleanup listener on unmount
    return () => {
      classroomWarsSocket.off('classroomWarsGameStarted', gameStartedHandler);
    };
  }, [currentRoom, userId]);

  // Fetch open rooms
  const fetchRooms = async () => {
    try {
      const res = await listClassroomWarRooms();
      setRooms(res.data.rooms);
    } catch (err) {
      setError('Failed to fetch rooms');
    }
  };

  // Create room
  const handleCreateRoom = async () => {
    try {
      const res = await createClassroomWarRoom(userId, roomName);
      setCurrentRoom({ name: roomName, creatorId: userId, players: [userId] });
      setIsCreator(true);
      setPlayers([userId]);
      setError('');
      // Ensure creator joins socket room immediately
      console.log(`[Socket] Creator emitting joinRoom for ${roomName}`);
      classroomWarsSocket.emit('joinRoom', roomName);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  // Join room
  const handleJoinRoom = async (name) => {
    try {
      const res = await joinClassroomWarRoom(userId, name);
      setCurrentRoom({ name, players: res.data.players });
      setIsCreator(false);
      setPlayers(res.data.players);
      setError('');
      // Join socket room after successful API join
      console.log(`[Socket] Emitting joinRoom for ${name}`);
      classroomWarsSocket.emit('joinRoom', name);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    }
  };

  // Start game
  const handleStartGame = async () => {
    try {
      const res = await startClassroomWarGame(userId, currentRoom.name);
      setGameStarted(true);
      setError('');
      // Fetch initial game state and show game UI for all users
      const info = await getClassroomWarRoom(currentRoom.name);
      setGameState(info.data.gameState);
      setPlayers(info.data.players);
      setCurrentRoom(info.data); // Ensure currentRoom is updated for all users
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start game');
    }
  };

  // Get room info
  const handleGetRoomInfo = async (name) => {
    try {
      const res = await getClassroomWarRoom(name);
      setCurrentRoom(res.data);
      setPlayers(res.data.players);
      setGameStarted(res.data.started);
      setGameState(res.data.gameState);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get room info');
    }
  };

  // Submit answer for current question
  const handleSubmitAnswer = async (isCorrect) => {
    try {
      const res = await submitClassroomWarAnswer({
        roomName: currentRoom.name,
        userId,
        correct: isCorrect,
      });
      // Update local game state
      setGameState((prev) => {
        const updated = { ...prev };
        updated.playerStates[userId] = res.data;
        return updated;
      });
      // Next question or end
      if (res.data.finished) {
        handleEndGame();
      } else {
        setQuestionIdx((idx) => idx + 1);
        setAnswer('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer');
    }
  };

  // End game and show leaderboard
  const handleEndGame = async () => {
    try {
      const res = await endClassroomWarGame({ roomName: currentRoom.name });
      setLeaderboard(res.data.leaderboard);
      setShowLeaderboard(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end game');
    }
  };

  // Render UI
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Classroom Wars</h2>
      <div className="mb-4 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 mb-2"
        />
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="border p-2 mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleCreateRoom}
            className="main-button px-2 py-1 rounded text-sm"
          >
            Create Room
          </button>
          <button
            onClick={fetchRooms}
            className="secondary-button px-2 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Open Rooms:</h3>
        <ul>
          {rooms.map((room) => (
            <li key={room.name} className="mb-2">
              <span className="mr-2">
                {room.name} ({room.players.length} players)
              </span>
              <button
                onClick={() => handleJoinRoom(room.name)}
                className="bg-purple-600 text-white px-2 py-1 rounded mr-2"
              >
                Join
              </button>
              <button
                onClick={() => handleGetRoomInfo(room.name)}
                className="bg-gray-600 text-white px-2 py-1 rounded"
              >
                Info
              </button>
            </li>
          ))}
        </ul>
      </div>
      {currentRoom && !currentRoom.started && (
        <div className="mb-4 border p-4 rounded">
          <h4 className="font-bold">Room: {currentRoom.name}</h4>
          <div>Creator: {currentRoom.creatorId}</div>
          <div>Players: {players.join(', ')}</div>
          <div>Status: {currentRoom.started ? 'Started' : 'Waiting'}</div>
          {isCreator && !currentRoom.started && (
            <button
              onClick={async () => {
                setError('');
                setGameStarted(false);
                if (!userId || !players.includes(userId)) {
                  setError(
                    'Enter your User ID and join the room before starting the game.',
                  );
                  return;
                }
                try {
                  await handleStartGame();
                } catch (err) {
                  setError('Failed to start game');
                }
              }}
              className="main-button w-full sm:w-auto px-4 py-2 rounded mt-2 text-base sm:text-lg"
              disabled={!userId || !players.includes(userId)}
            >
              Start Game
            </button>
          )}
        </div>
      )}
      {/* Game UI */}
      {gameStarted && gameState && !showLeaderboard && questions.length > 0 && (
        <div className="flex flex-col border border-[#696969] rounded-lg bg-[#18162a] p-4">
          <h4 className="font-bold mb-2 text-white">Question Battle</h4>
          <div className="mb-2 text-white">
            Lives: {gameState.playerStates[userId]?.lives ?? 0}
          </div>
          <div className="mb-2 text-white">
            XP: {gameState.playerStates[userId]?.xp ?? 0}
          </div>
          <div className="mb-2 text-white">
            Accuracy:{' '}
            {((gameState.playerStates[userId]?.accuracy ?? 0) * 100).toFixed(1)}
            %
          </div>
          <div className="mb-2 text-white">
            Question {questionIdx + 1} of {questions.length}
          </div>
          <div className="mb-2 font-semibold text-white">
            {questions[questionIdx]?.questionText || 'No question'}
          </div>
          <input
            type="text"
            placeholder="Your Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 mb-2"
            disabled={gameState.playerStates[userId]?.finished}
          />
          <button
            onClick={() =>
              handleSubmitAnswer(answer.trim().toLowerCase() === 'correct')
            }
            className="main-button bg-blue-600 text-white px-4 py-2 rounded"
            disabled={gameState.playerStates[userId]?.finished || !answer}
          >
            Submit Answer
          </button>
        </div>
      )}
      {/* Leaderboard UI */}
      {showLeaderboard && (
        <div className="mb-4 border p-4 rounded bg-yellow-50">
          <h4 className="font-bold mb-2">Leaderboard</h4>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Player</th>
                <th className="border px-2 py-1">XP</th>
                <th className="border px-2 py-1">Accuracy</th>
                <th className="border px-2 py-1">Answered</th>
                <th className="border px-2 py-1">Correct</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.userId}>
                  <td className="border px-2 py-1">{entry.userId}</td>
                  <td className="border px-2 py-1">{entry.xp}</td>
                  <td className="border px-2 py-1">
                    {(entry.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="border px-2 py-1">{entry.answered}</td>
                  <td className="border px-2 py-1">{entry.correct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <div className="text-red-600 font-bold">{error}</div>}
    </div>
  );
}
