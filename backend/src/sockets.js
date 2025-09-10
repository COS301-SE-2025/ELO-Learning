import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../database/supabaseClient.js';

const queue = [];
const matchMap = new Map();
let ioServer = null;

const findMatchForPlayer = (player) => {
  if (!player || player.matching) {
    console.log('Tried to match null player');
    return null;
  }
  player.matching = true; // Prevent concurrent matching attempts
  const waitingTime = Date.now() - player.joinedAt;

  // ELO difference allowed
  // Start with 50, increase by 50 every 5 seconds
  let tolerance = 50 + Math.floor(waitingTime / 5000) * 50;
  const maxTolerance = 1000; // Cap tolerance to prevent too wide matches
  if (tolerance > maxTolerance) tolerance = maxTolerance;

  console.log(
    `🔍 Matching ${player.userData.username} (ELO ${player.elo}), tolerance ±${tolerance}`,
  );

  for (let i = 0; i < queue.length; i++) {
    const candidate = queue[i];
    if (candidate.socket.id === player.socket.id || candidate.matching)
      continue;

    console.log(
      `➡️ Checking ${candidate.userData.username} (ELO ${candidate.elo})`,
    );

    if (Math.abs(player.elo - candidate.elo) <= tolerance) {
      console.log(
        `✅ Match success: ${player.userData.username} vs ${candidate.userData.username}`,
      );

      queue.splice(
        queue.findIndex((p) => p.socket.id === candidate.socket.id),
        1,
      );
      queue.splice(
        queue.findIndex((p) => p.socket.id === player.socket.id),
        1,
      );

      candidate.matching = false;
      player.matching = false;

      return candidate;
    }
  }

  console.log(`❌ No opponent found for ${player.userData.username} yet`);
  player.matching = false; // Reset matching flag
  return null; // No match yet
};

// Add startGame helper so setInterval can use it (accepts player wrapper objects)
const startGame = (playerWrapper, opponentWrapper) => {
  try {
    const player1Socket = playerWrapper.socket || playerWrapper;
    const player2Socket = opponentWrapper.socket || opponentWrapper;

    // Clean up any lingering queue entries for these sockets
    const idx1 = queue.findIndex(
      (p) => p.socket && p.socket.id === player1Socket.id,
    );
    if (idx1 !== -1) queue.splice(idx1, 1);
    const idx2 = queue.findIndex(
      (p) => p.socket && p.socket.id === player2Socket.id,
    );
    if (idx2 !== -1) queue.splice(idx2, 1);

    console.log(
      'Starting game between (startGame helper):',
      player1Socket.id,
      'and',
      player2Socket.id,
    );

    const gameId = uuidv4();
    player1Socket.join(gameId);
    player2Socket.join(gameId);

    const p1Data = playerWrapper.userData
      ? playerWrapper.userData
      : player1Socket.userData;
    const p2Data = opponentWrapper.userData
      ? opponentWrapper.userData
      : player2Socket.userData;

    // Use ioServer (set when export default is invoked) so helper can emit
    if (!ioServer) {
      console.error('startGame helper: ioServer is not set');
      return;
    }

    ioServer.to(player1Socket.id).emit('startGame', {
      gameId,
      opponent: {
        name: p2Data?.name,
        username: p2Data?.username,
        xp: p2Data?.xp,
        rank: p2Data?.rank,
      },
    });

    ioServer.to(player2Socket.id).emit('startGame', {
      gameId,
      opponent: {
        name: p1Data?.name,
        username: p1Data?.username,
        xp: p1Data?.xp,
        rank: p1Data?.rank,
      },
    });

    matchMap.set(gameId, {
      players: [player1Socket.id, player2Socket.id],
      playerData: {
        [player1Socket.id]: p1Data,
        [player2Socket.id]: p2Data,
      },
      playerLevels: {},
      playerReadyCount: [],
      playerDoneCount: [],
      playerResults: [],
    });
  } catch (err) {
    console.error('Error in startGame helper:', err);
  }
};

setInterval(() => {
  if (queue.length < 2) return; // Need at least 2 players

  console.log('🔄 Running matchmaking check...');

  for (let i = 0; i < queue.length; i++) {
    const player = queue[i];
    if (!player || player.matching) continue;

    const opponent = findMatchForPlayer(player);
    if (opponent) {
      console.log(
        `🎉 Matched ${player.userData.username} vs ${opponent.userData.username}`,
      );
      startGame(player, opponent);
      break; // stop after a successful match
    }
  }
}, 2000);

export default (io, socket) => {
  // assign io to a top-level variable so top-level helpers can use it
  ioServer = io;

  const queueForGame = async (userData) => {
    console.log('Queueing for game:', socket.id, 'User:', userData?.username);

    // Fetch complete user data from database (including rank)
    const { data: dbUser, error } = await supabase
      .from('Users')
      .select(
        'name, email, id, surname, username, xp, currentLevel, elo_rating, rank, joinDate',
      )
      .eq('id', userData.id)
      .single();

    if (error || !dbUser) {
      console.error('Could not fetch user data from DB:', error);
      return;
    }

    // Merge DB user data (including rank) with incoming userData
    const mergedUserData = {
      ...userData,
      ...dbUser,
      elo: dbUser.elo_rating,
      rank: dbUser.rank,
    };

    // 🎯 NEW: Track queue join for achievements
    if (mergedUserData?.id) {
      try {
        console.log(
          `🎯 QUEUE ACHIEVEMENT: Checking queue achievements for user ${mergedUserData.id}`,
        );
        const { checkQueueAchievements } = await import(
          './achievementRoutes.js'
        );
        const queueAchievements = await checkQueueAchievements(
          mergedUserData.id,
        );

        if (queueAchievements.length > 0) {
          console.log(
            `🏆 Queue achievements unlocked:`,
            queueAchievements.map((a) => a.name),
          );

          // Emit queue achievements to the user
          socket.emit('achievementsUnlocked', {
            achievements: queueAchievements,
            source: 'queue_join',
          });
        }
      } catch (error) {
        console.error('❌ Error checking queue achievements:', error);
        // Don't fail the queue process if achievements fail
      }
    }

    // Store merged user data with the socket
    socket.userData = mergedUserData;

    // Create a player wrapper so matchmaking functions can rely on consistent shape
    const playerWrapper = {
      socket,
      userData: mergedUserData,
      elo: mergedUserData.elo || mergedUserData.elo_rating,
      joinedAt: Date.now(),
      matching: false,
    };

    // Only add if not already present (compare by socket id)
    if (!queue.some((p) => p.socket && p.socket.id === socket.id)) {
      queue.push(playerWrapper);
    }

    // Try to match using the ELO-aware matcher
    if (queue.length >= 2) {
      const opponent = findMatchForPlayer(playerWrapper);
      if (opponent) {
        console.log(
          'Starting game between:',
          playerWrapper.socket.id,
          'and',
          opponent.socket.id,
        );

        const player1 = playerWrapper.socket;
        const player2 = opponent.socket;

        const gameId = uuidv4();
        player1.join(gameId);
        player2.join(gameId);

        // Send game start with opponent data (including rank)
        io.to(player1.id).emit('startGame', {
          gameId,
          opponent: {
            name: opponent.userData?.name,
            username: opponent.userData?.username,
            xp: opponent.userData?.xp,
            rank: opponent.userData?.rank,
          },
        });
        io.to(player2.id).emit('startGame', {
          gameId,
          opponent: {
            name: playerWrapper.userData?.name,
            username: playerWrapper.userData?.username,
            xp: playerWrapper.userData?.xp,
            rank: playerWrapper.userData?.rank,
          },
        });

        matchMap.set(gameId, {
          players: [player1.id, player2.id],
          playerData: {
            [player1.id]: playerWrapper.userData,
            [player2.id]: opponent.userData,
          },
          playerLevels: {},
          playerReadyCount: [],
          playerDoneCount: [],
          playerResults: [],
        });
      }
    }
  };

  const cancelQueue = () => {
    console.log('Cancelling queue for game:', socket.id);
    // Find by socket id since queue stores wrapper objects
    const index = queue.findIndex((p) => p.socket && p.socket.id === socket.id);
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

    // Prevent duplicate submissions from same player
    if (gameData.playerResults && gameData.playerResults[playerID]) {
      console.log('Player', playerID, 'already submitted results');
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
          console.log('Calculating XP for results:', parsedResults);

          // Calculate XP from correct answers
          parsedResults.forEach((question) => {
            if (question?.isCorrect && question.question?.xpGain) {
              const gainedXP = parseInt(question.question.xpGain) || 0;
              console.log(
                `Question ${question.q_index}: isCorrect=${question.isCorrect}, xpGain=${gainedXP}`,
              );
              xpGain += gainedXP;
            }
          });

          // Get total session time from localStorage data
          const totalTime =
            parsedResults[0]?.totalSessionTime ||
            parsedResults.reduce((total, q) => total + (q.timeElapsed || 0), 0);
          timeTaken = totalTime;
        }
      } catch (e) {
        console.error('Error parsing results:', e);
        console.error('Raw results:', results);
      }

      console.log('Final calculated stats:', { xpGain, timeTaken });
      return { xpGain, timeTaken };
    };

    const [player1Id, player2Id] = gameData.players;
    const player1Stats = calculateStats(gameData.playerResults[player1Id]);
    const player2Stats = calculateStats(gameData.playerResults[player2Id]);

    // Determine winner based on time (faster wins)
    let score1;
    // First compare XP
    if (player1Stats.xpGain > player2Stats.xpGain) {
      score1 = 1;
    } else if (player1Stats.xpGain < player2Stats.xpGain) {
      score1 = 0;
    } else {
      // XP tie - use time as tiebreaker
      if (player1Stats.timeTaken < player2Stats.timeTaken) {
        console.log('Player1 won..... =======================');
        score1 = 1;
      } else if (player1Stats.timeTaken > player2Stats.timeTaken) {
        console.log('Player2 won..... =======================');
        score1 = 0;
      } else {
        console.log('Players tied..... =======================');
        //TODO: smooth crime happened here...hehehe
        score1 = 1; // Complete tie
      }
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

    // Emit to both players with their results - wrap in try/catch for safety
    try {
      io.to(player1Id).emit('matchEnd', {
        matchResults,
        isWinner: score1 === 1,
      });

      io.to(player2Id).emit('matchEnd', {
        matchResults,
        isWinner: score1 === 0,
      });

      // Save to localStorage - wait a brief moment before sending this data
      // This ensures matchEnd is processed first
      setTimeout(() => {
        io.to(player1Id).emit('saveMatchData', matchResults);
        io.to(player2Id).emit('saveMatchData', matchResults);
      }, 300);
    } catch (emitError) {
      console.error('Error emitting match results:', emitError);
    }

    // Add a small delay to ensure both clients receive the events
    setTimeout(() => {
      console.log(`Cleaning up game ${gameId} after results sent`);
      matchMap.delete(gameId);
    }, 1000);
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
