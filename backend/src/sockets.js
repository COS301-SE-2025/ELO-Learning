import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../database/supabaseClient.js';
import { distributeXPFromResults } from './multiPlayerArray.js';

const queue = [];
const matchMap = new Map();

export default (io, socket) => {
  const queueForGame = () => {
    console.log('Queueing for game:', socket.id);
    if (!queue.includes(socket)) {
      queue.push(socket);
    }

    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();
      console.log('Starting game between:', player1.id, 'and', player2.id);
      const gameId = uuidv4();
      player1.join(gameId);
      player2.join(gameId);
      io.to(player1.id).emit('startGame', gameId);
      io.to(player2.id).emit('startGame', gameId);

      matchMap.set(gameId, {
        players: [player1.id, player2.id],
        levels: [],
        playerReadyCount: [],
        playerDoneCount: [],
        playerResults: [],
        userIds: [],
      });
    }
  };

  const cancelQueue = () => {
    console.log('Cancelling queue for game:', socket.id);
    const index = queue.indexOf(socket);
    if (index !== -1) {
      queue.splice(index, 1);
      console.log('Cancelled queue for:', socket.id);
    } else {
      console.log('Socket not found in queue:', socket.id);
    }
  };

  const startMatch = async (gameId, level) => {
    console.log('Starting match for game:', gameId, 'with level:', level);
    const gameData = matchMap.get(gameId);
    if (!gameData) {
      console.log('Game not found:', gameId);
      return;
    }

    if (!gameData.playerReadyCount.includes(socket.id)) {
      gameData.playerReadyCount.push(socket.id);
    }

    if (!gameData.levels.includes(level)) {
      gameData.levels.push(level);
    }

    matchMap.set(gameId, gameData);

    if (gameData.playerReadyCount.length === 2) {
      try {
        const averageLevel = Math.round(
          gameData.levels.reduce((sum, level) => sum + level, 0) /
            gameData.levels.length,
        );

        const { data: questions, error: qError } = await supabase
          .from('Questions')
          .select('*')
          .eq('level', averageLevel);

        if (qError || !questions || questions.length === 0) {
          io.to(gameId).emit('gameError', {
            error:
              qError?.message || `No questions found for level ${averageLevel}`,
          });
          return;
        }

        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 16);

        const questionIds = selected.map((q) => q.Q_id);
        const { data: answers, error: aError } = await supabase
          .from('Answers')
          .select('*')
          .in('question_id', questionIds);

        if (aError) {
          io.to(gameId).emit('gameError', { error: 'Failed to fetch answers' });
          return;
        }

        selected.forEach((q) => {
          q.answers = answers.filter((a) => a.question_id === q.Q_id);
        });

        io.to(gameId).emit('gameReady', {
          gameId,
          questions: selected,
          matchLevel: averageLevel,
        });
      } catch (err) {
        console.log('Server error:', err);
        io.to(gameId).emit('gameError', { error: 'Server error' });
      }
    }
  };

  const matchComplete = async (
    gameId,
    playerResults,
    playerID,
    userId = null,
  ) => {
    const gameData = matchMap.get(gameId);
    if (!gameData) return;

    if (!gameData.playerDoneCount.includes(playerID)) {
      gameData.playerDoneCount.push(playerID);
      gameData.playerResults.push(playerResults);
      if (userId) gameData.userIds.push(userId);
      matchMap.set(gameId, gameData);
    }

    if (gameData.playerDoneCount.length < 2) return;

    const [firstPlayer, secondPlayer] = gameData.players;
    const [firstResults, secondResults] = gameData.playerResults.map((r) =>
      JSON.parse(r),
    );

    const correctFirst = firstResults.filter((q) => q.isCorrect).length;
    const correctSecond = secondResults.filter((q) => q.isCorrect).length;

    let result = 'draw';
    if (correctFirst > correctSecond) {
      io.to(firstPlayer).emit('matchEnd', { isWinner: true });
      io.to(secondPlayer).emit('matchEnd', { isWinner: false });
      result = 'Player 1 Wins';
    } else if (correctSecond > correctFirst) {
      io.to(secondPlayer).emit('matchEnd', { isWinner: true });
      io.to(firstPlayer).emit('matchEnd', { isWinner: false });
      result = 'Player 2 Wins';
    } else {
      io.to(firstPlayer).emit('matchEnd', { isWinner: false });
      io.to(secondPlayer).emit('matchEnd', { isWinner: false });
    }

    try {
      const player1Rating = 1000;
      const player2Rating = 1000;

      const eloMatchResult = distributeXPFromResults(
        firstResults,
        secondResults,
        player1Rating,
        player2Rating,
      );

      const [user1Id, user2Id] = gameData.userIds;

      io.to(firstPlayer).emit('eloResults', {
        userId: user1Id,
        xpEarned: eloMatchResult.player1XP,
        matchWinner: eloMatchResult.matchResult,
      });
      io.to(secondPlayer).emit('eloResults', {
        userId: user2Id,
        xpEarned: eloMatchResult.player2XP,
        matchWinner: eloMatchResult.matchResult,
      });

      const updateXP = async (userId, xpGain) => {
        const { data, error } = await supabase
          .from('Users')
          .select('xp')
          .eq('id', userId)
          .single();
        if (error || !data) return;
        const newXP = data.xp + xpGain;
        await supabase.from('Users').update({ xp: newXP }).eq('id', userId);
      };

      await updateXP(user1Id, eloMatchResult.player1XP);
      await updateXP(user2Id, eloMatchResult.player2XP);
    } catch (error) {
      console.error('ELO error:', error);
    }

    matchMap.delete(gameId);
  };

  socket.on('queue', queueForGame);
  socket.on('cancelQueue', cancelQueue);
  socket.on('startMatch', (data) => startMatch(data.game, data.level));
  socket.on('matchComplete', (data) =>
    matchComplete(data.game, data.playerResults, data.socketId, data.userId),
  );

  socket.on('leaveRoom', (roomId) => {
    console.log(`Socket ${socket.id} is leaving room: ${roomId}`);
    socket.leave(roomId);
    const gameData = matchMap.get(roomId);
    if (gameData) {
      gameData.players = gameData.players.filter((id) => id !== socket.id);
      if (gameData.players.length === 0) {
        matchMap.delete(roomId);
      } else {
        matchMap.set(roomId, gameData);
      }
    }
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const gameData = matchMap.get(roomId);
        if (gameData) {
          gameData.players = gameData.players.filter((id) => id !== socket.id);
          if (gameData.players.length === 0) {
            matchMap.delete(roomId);
          } else {
            matchMap.set(roomId, gameData);
          }
        }
      }
    }
  });
};
