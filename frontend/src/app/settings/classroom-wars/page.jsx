'use client';
import {
  createClassroomWarRoom,
  endClassroomWarGame,
  getClassroomWarRoom,
  joinClassroomWarRoom,
  listClassroomWarRooms,
  startClassroomWarGame,
  submitClassroomWarAnswer,
} from '@/services/api';
import classroomWarsSocket from '@/utils/classroomWarsSocket';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Back from '../../ui/back';
import AnswerInput from '../../ui/classroom-wars/answer-input';
import QuestionDisplay from '../../ui/classroom-wars/question-display';
import RoomStats from '../../ui/classroom-wars/room-stats';
import SimpleLeaderboard from '../../ui/classroom-wars/simple-leaderboard';

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

  // Delete room handler
  const handleDeleteRoom = async (name) => {
    try {
      await axios.delete(`/classroom-wars/room/${name}`);
      fetchRooms();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete room');
    }
  };

  // Debug info: log relevant state changes to console
  useEffect(() => {
    const playerFinished = gameState?.playerStates?.[userId]?.finished;
    if (gameStarted || playerFinished || answer !== '' || !currentRoom?.name) {
      console.log(
        `[ClassroomWars Debug] gameStarted=${gameStarted}, currentRoom.name=${currentRoom?.name}, finished=${playerFinished}, answer=${answer}`,
      );
    }
  }, [gameStarted, currentRoom?.name, answer, gameState?.playerStates, userId]);

  useEffect(() => {
    // Listen for game started event
    const gameStartedHandler = (data) => {
      console.log(
        `[Socket] classroomWarsGameStarted received for room: ${data.roomName}`,
      );
      if (!data.roomName) return;
      setCurrentRoom((prev) => ({
        ...prev,
        name: data.roomName,
        players: data.players,
        started: true,
        gameState: prev?.gameState || {},
      }));
      setGameStarted(true);
      setQuestions(data.questions || []);
      setQuestionIdx(0);
      // Directly set roomName state for answer submission
      setRoomName(data.roomName);
      handleGetRoomInfo(data.roomName);
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
    console.log(
      'Calling startClassroomWarGame with:',
      userId,
      currentRoom?.name,
    );
    try {
      const res = await startClassroomWarGame(userId, currentRoom.name);
      setGameStarted(true);
      setError('');
      // Fetch initial game state and show game UI for all users
      const info = await getClassroomWarRoom(currentRoom.name);
      // Always preserve room name
      setCurrentRoom((prev) => ({
        ...info.data,
        name: info.data.name || prev?.name || currentRoom.name,
      }));
      setGameState(info.data.gameState);
      setPlayers(info.data.players);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start game');
    }
  };

  // Get room info
  const handleGetRoomInfo = async (name) => {
    try {
      const res = await getClassroomWarRoom(name);
      // Always preserve room name
      setCurrentRoom((prev) => ({
        ...res.data,
        name: res.data.name || prev?.name || name,
      }));
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
    if (!currentRoom?.name) {
      setError('No room name found. Please rejoin the room.');
      return;
    }
    console.log(
      'Submitting answer for room:',
      currentRoom?.name,
      'user:',
      userId,
      'gameStarted:',
      gameStarted,
    );
    try {
      const res = await submitClassroomWarAnswer({
        roomName: currentRoom.name,
        userId,
        answer,
        questionIdx,
      });
      // Update local game state
      setGameState((prev) => {
        const updated = { ...prev };
        updated.playerStates[userId] = res.data;
        return updated;
      });
      // Show feedback and correct answer
      if (res.data.isCorrect !== undefined) {
        if (res.data.isCorrect) {
          setError('✅ Correct!');
        } else {
          setError(`❌ Incorrect! Correct answer: ${res.data.correctAnswer}`);
        }
        setTimeout(() => setError(''), 2000);
      }
      // Next question or end
      if (res.data.finished) {
        setTimeout(() => handleEndGame(), 2000);
      } else {
        setTimeout(() => {
          setQuestionIdx((idx) => idx + 1);
          setAnswer('');
        }, 2000);
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
    <div className="relative">
      {/* Floating Back button at the top */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[var(--background)]">
        <Back pagename="Classroom Wars" />
      </div>
      <div className="pt-20">
        {/* Only show game UI when started, else show lobby/room UI */}
        {gameStarted &&
        gameState &&
        !showLeaderboard &&
        questions.length > 0 ? (
          <div className="flex flex-col min-h-[70vh] justify-between rounded-lg p-6">
            <RoomStats
              lives={gameState.playerStates[userId]?.lives ?? 0}
              xp={gameState.playerStates[userId]?.xp ?? 0}
              accuracy={gameState.playerStates[userId]?.accuracy ?? 0}
              questionIdx={questionIdx}
              totalQuestions={questions.length}
            />
            <QuestionDisplay
              questionText={questions[questionIdx]?.questionText}
            />
            <AnswerInput
              answer={answer}
              setAnswer={setAnswer}
              onSubmit={handleSubmitAnswer}
              disabled={gameState.playerStates[userId]?.finished}
            />
            {error && (
              <div className="text-red-600 font-bold mt-4">{error}</div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-2 p-6">
              <label className="font-semibold">Enter username:</label>
              <input
                type="text"
                placeholder="Your User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border p-2 mb-2"
                style={{ border: '1px solid #696969', borderRadius: '5px' }}
              />
              <label className="font-semibold">Enter the room name:</label>
              <input
                type="text"
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="border p-2 mb-2"
                style={{ border: '1px solid #696969', borderRadius: '5px' }}
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCreateRoom}
                  className="signup-button px-2 py-1 rounded text-sm"
                >
                  Create Room
                </button>
                <button
                  onClick={fetchRooms}
                  className="signup-button-secondary px-2 py-1 rounded text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="mb-4 p-6">
              <h3 className="font-semibold">Open Rooms:</h3>
              <ul>
                {rooms.map((room) => (
                  <li
                    key={room.name}
                    className="mb-2 border-b border-[#696969] py-5"
                  >
                    <div className="mr-2">
                      {room.name} ({room.players.length} players)
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.name)}
                      className="signup-button m-2"
                    >
                      Join
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6">
              <p className="text-xl text-center font-bold mb-5">
                Room Information
              </p>
            </div>
            {currentRoom && !currentRoom.started && (
              <div className="mb-4 p-6">
                <h4 className="font-bold">Room: {currentRoom.name}</h4>
                <div>Creator: {currentRoom.creatorId}</div>
                <div>Players: {players.join(', ')}</div>
                <div>Status: {currentRoom.started ? 'Started' : 'Waiting'}</div>
                <div className="break_small"></div>
                {isCreator && !currentRoom.started && (
                  <div className="flex justify-center">
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
                      className="signup-button w-full mx-auto sm:w-auto px-4 py-2 rounded text-base sm:text-lg"
                      disabled={!userId || !players.includes(userId)}
                    >
                      Start Game
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Leaderboard UI */}
            {showLeaderboard && (
              <div className="mb-4">
                <SimpleLeaderboard
                  users={leaderboard.map((entry) => ({
                    id: entry.userId,
                    username: entry.userId,
                    xp: entry.xp,
                  }))}
                />
              </div>
            )}
            {error && <div className="text-red-600 font-bold">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
