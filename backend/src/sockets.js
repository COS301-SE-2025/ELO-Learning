import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../database/supabaseClient.js';

const queue = [];
const matchMap = new Map();

export default (io, socket) => {
  const queueForGame = async (userData) => {
    console.log('Queueing for game:', socket.id, 'User:', userData?.username);

    // Fetch complete user data from database (including rank)
    const { data: dbUser, error } = await supabase
      .from('Users')
      .select(
        'name, email, id, surname, username, xp, currentLevel, rank, joinDate',
      )
      .eq('id', userData.id)
      .single();

    if (error || !dbUser) {
      console.error('Could not fetch user data from DB:', error);
      return;
    }

    // Merge DB user data (including rank) with incoming userData
    const mergedUserData = { ...userData, ...dbUser, rank: dbUser.rank };

    // 🎯 NEW: Track queue join for achievements
    if (mergedUserData?.id) {
      try {
        console.log(`🎯 QUEUE ACHIEVEMENT: Checking queue achievements for user ${mergedUserData.id}`);
        const { checkQueueAchievements } = await import('./achievementRoutes.js');
        const queueAchievements = await checkQueueAchievements(mergedUserData.id);
        
        if (queueAchievements.length > 0) {
          console.log(`🏆 Queue achievements unlocked:`, queueAchievements.map(a => a.name));
          
          // Emit queue achievements to the user
          socket.emit('achievementsUnlocked', {
            achievements: queueAchievements,
            source: 'queue_join'
          });
        }
      } catch (error) {
        console.error('❌ Error checking queue achievements:', error);
        // Don't fail the queue process if achievements fail
      }
    }

    // Store merged user data with the socket
    socket.userData = mergedUserData;

    if (!queue.includes(socket)) {
      queue.push(socket);
    }

    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();

      console.log('Starting game between:', player1.id, 'and', player2.id);
      console.log('Player 1:', player1.userData?.username);
      console.log('Player 2:', player2.userData?.username);
      console.log('Player 1 rank:', player1.userData.rank);
      console.log('Player 2 rank:', player2.userData.rank);

      const gameId = uuidv4();
      player1.join(gameId);
      player2.join(gameId);

      // Send game start with opponent data (including rank)
      io.to(player1.id).emit('startGame', {
        gameId,
        opponent: {
          name: player2.userData?.name,
          username: player2.userData?.username,
          xp: player2.userData?.xp,
          rank: player2.userData?.rank, // 🎯 Include rank
        },
      });
      io.to(player2.id).emit('startGame', {
        gameId,
        opponent: {
          name: player1.userData?.name,
          username: player1.userData?.username,
          xp: player1.userData?.xp,
          rank: player1.userData?.rank, // 🎯 Include rank
        },
      });

      matchMap.set(gameId, {
        players: [player1.id, player2.id],
        playerData: {
          [player1.id]: player1.userData,
          [player2.id]: player2.userData,
        },
        playerLevels: {},
        playerReadyCount: [],
        playerDoneCount: [],
        playerResults: [],
      });
    }
  };

  const cancelQueue = () => {
    console.log('Cancelling queue for game:', socket.id);
    const index = queue.indexOf(socket);
    //This will potentially cause some issues. Consider integration with the db
    if (index !== -1) {
      queue.splice(index, 1);
      console.log('Cancelled queue for:', socket.id);
    } else {
      console.log('Socket not found in queue:', socket.id);
    }
  };

  const startMatch = async (gameId, level) => {
    console.log(
      'Starting match for game:',
      gameId,
      'with level:',
      level,
      'type:',
      typeof level,
    );
    const gameData = matchMap.get(gameId);
    console.log('Game data:', gameData);
    if (!gameData) {
      console.log('Game not found:', gameId);
      return;
    }

    // Update player ready count
    if (!gameData.playerReadyCount.includes(socket.id)) {
      gameData.playerReadyCount.push(socket.id);
    }

    console.log(
      `Player ${socket.id} is ready. Ready count: ${gameData.playerReadyCount.length}/2`,
    );

    // Store user level data (ensure it's a number)
    const numericLevel = Number(level);
    console.log('Converting level to number:', level, '->', numericLevel);

    // Store level for this specific player (use socket.id as key to avoid duplicates)
    if (!gameData.playerLevels) {
      gameData.playerLevels = {};
    }
    gameData.playerLevels[socket.id] = numericLevel;

    // Update the matchMap with the modified data
    matchMap.set(gameId, gameData);

    if (gameData.playerReadyCount.length === 2) {
      console.log('Both players are ready for game:', gameId);

      // Get levels from all players
      const playerLevels = Object.values(gameData.playerLevels);
      console.log('Player levels:', playerLevels);
      console.log(
        'Player levels data types:',
        playerLevels.map((l) => ({ value: l, type: typeof l })),
      );

      try {
        // Calculate the average level from all players
        const sum = playerLevels.reduce((sum, level) => {
          console.log(`Adding ${level} (type: ${typeof level}) to sum ${sum}`);
          return sum + level;
        }, 0);

        console.log('Sum of levels:', sum);
        console.log('Number of players:', playerLevels.length);

        const rawAverage = sum / playerLevels.length;
        console.log('Raw average:', rawAverage);

        const averageLevel = Math.round(rawAverage);
        console.log('Rounded average level:', averageLevel);

        console.log(
          `Game ${gameId} - Player levels: ${playerLevels}, Average level: ${averageLevel}`,
        );

        // Fetch 6 random questions for the calculated average level
        const { data: questions, error: qError } = await supabase
          .from('Questions')
          .select('*')
          .eq('level', averageLevel);

        if (qError) {
          console.log('Database error:', qError);
          io.to(gameId).emit('gameError', {
            error: 'Failed to fetch questions',
          });
          return;
        }

        if (!questions || questions.length === 0) {
          io.to(gameId).emit('gameError', {
            error: `No questions found for level ${averageLevel}`,
          });
          return;
        }

        // Shuffle and pick 6
        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);

        //fetch the answers for the above questions
        const questionIds = selected.map((q) => q.Q_id);
        const { data: answers, error: aError } = await supabase
          .from('Answers')
          .select('*')
          .in('question_id', questionIds);
        if (aError) {
          console.log('Database error:', aError);
          io.to(gameId).emit('gameError', { error: 'Failed to fetch answers' });
          return;
        }

        // Map answers to respective questions in the selected array
        selected.forEach((q) => {
          q.answers = answers.filter((a) => a.question_id === q.Q_id);
        });

        // Emit the questions to both players
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

  const matchComplete = async (gameId, playerResults, playerID) => {
    const gameData = matchMap.get(gameId);
    if (!gameData) {
      console.log('Game not found:', gameId);
      return;
    }

    // Store player results
    gameData.playerResults = gameData.playerResults || {};
    gameData.playerResults[playerID] = playerResults;

    // Mark player as done
    if (!gameData.playerDoneCount.includes(playerID)) {
      gameData.playerDoneCount.push(playerID);
    }

    matchMap.set(gameId, gameData);

    if (gameData.playerDoneCount.length < 2) {
      console.log('Waiting for other player to finish game:', gameId);
      return;
    }

    // Calculate stats for both players
    const calculateStats = (results) => {
      let xpGain = 0;
      let timeTaken = 0;

      try {
        const parsedResults =
          typeof results === 'string' ? JSON.parse(results) : results;
        if (Array.isArray(parsedResults)) {
          parsedResults.forEach((question) => {
            if (question?.isCorrect && question.question?.xpGain) {
              xpGain += question.question.xpGain;
            }
            timeTaken += question.timeElapsed || 0;
          });
        }
      } catch (e) {
        console.error('Error parsing results:', e);
      }

      return { xpGain, timeTaken };
    };

    const [player1Id, player2Id] = gameData.players;
    const player1Stats = calculateStats(gameData.playerResults[player1Id]);
    const player2Stats = calculateStats(gameData.playerResults[player2Id]);

    // Determine winner based on time (faster wins)
    let score1;
    if (player1Stats.timeTaken < player2Stats.timeTaken) {
      score1 = 1; // Player 1 wins
    } else if (player1Stats.timeTaken > player2Stats.timeTaken) {
      score1 = 0; // Player 2 wins
    } else {
      score1 = 0.5; // Draw
    }

    // Get user IDs
    const user1Id = gameData.playerData[player1Id].id;
    const user2Id = gameData.playerData[player2Id].id;

    console.log('Player 1 id:', user1Id);
    console.log('Player 1 totalXPGain:', player1Stats.xpGain);
    console.log('Player 2 id:', user2Id);
    console.log('Player 2 totalXPGain:', player2Stats.xpGain);

    // Prepare match data for frontend
    const matchResults = {
      players: [user1Id, user2Id],
      player1Results: gameData.playerResults[player1Id],
      player2Results: gameData.playerResults[player2Id],
      score1,
      totalXP: player1Stats.xpGain + player2Stats.xpGain, // Total XP from both players
    };

    // Emit to both players with their results
    io.to(player1Id).emit('matchEnd', {
      matchResults,
      isWinner: score1 === 1,
    });

    io.to(player2Id).emit('matchEnd', {
      matchResults,
      isWinner: score1 === 0,
    });

    // Save to localStorage
    io.to(player1Id).emit('saveMatchData', matchResults);
    io.to(player2Id).emit('saveMatchData', matchResults);

    // Clean up
    matchMap.delete(gameId);
  };

  //end the match still to come

  socket.on('disconnecting', () => {
    // For each room the socket is in (except its own id), check if it should be closed
    console.log(`Socket ${socket.id} is disconnecting, cleaning up rooms...`);
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        // Remove the player from matchMap if present
        const gameData = matchMap.get(roomId);
        if (gameData) {
          // Remove the player from the players array
          gameData.players = gameData.players.filter((id) => id !== socket.id);
          // If no players left, delete the room
          if (gameData.players.length === 0) {
            matchMap.delete(roomId);
            // Optionally, emit a room closed event
            // io.to(roomId).emit("roomClosed");
            console.log(`Room ${roomId} closed because all players left.`);
          } else {
            matchMap.set(roomId, gameData);
          }
        }
      }
    }
  });

  socket.on('leaveRoom', (roomId) => {
    console.log(`Socket ${socket.id} is leaving room: ${roomId}`);
    socket.leave(roomId);
    // Repeat the same logic as above to check if the room is empty and clean up
    const gameData = matchMap.get(roomId);
    if (gameData) {
      gameData.players = gameData.players.filter((id) => id !== socket.id);
      if (gameData.players.length === 0) {
        matchMap.delete(roomId);
        // io.to(roomId).emit("roomClosed");
        console.log(`Room ${roomId} closed because all players left.`);
      } else {
        matchMap.set(roomId, gameData);
      }
    }
  });

  socket.on('queue', (data) => queueForGame(data?.userData));
  socket.on('cancelQueue', cancelQueue);
  socket.on('startMatch', (data) => startMatch(data.game, data.level));
  socket.on('matchComplete', (data) => {
    matchComplete(data.game, data.playerResults, data.socketId);
  });
};