import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../database/supabaseClient.js';

const queue = [];
const matchMap = new Map();

export default (io, socket) => {
  const queueForGame = async (userData) => {
    console.log('Queueing for game:', socket.id, 'User:', userData?.username);

    // Store user data with the socket
    socket.userData = userData;

    if (!queue.includes(socket)) {
      queue.push(socket);
    }

    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();

      console.log('Starting game between:', player1.id, 'and', player2.id);
      console.log('Player 1:', player1.userData?.username);
      console.log('Player 2:', player2.userData?.username);

      const gameId = uuidv4();
      player1.join(gameId);
      player2.join(gameId);

      // Send game start with opponent data
      io.to(player1.id).emit('startGame', {
        gameId,
        opponent: {
          name: player2.userData?.name,
          username: player2.userData?.username,
          xp: player2.userData?.xp,
        },
      });
      io.to(player2.id).emit('startGame', {
        gameId,
        opponent: {
          name: player1.userData?.name,
          username: player1.userData?.username,
          xp: player1.userData?.xp,
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

        // Fetch 15 random questions for the calculated average level
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

        // Shuffle and pick 15
        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 16);

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

        // Map to clean structure
        // const cleanQuestions = selected.map((q) => ({
        //     id: q.Q_id,
        //     topic: q.topic,
        //     difficulty: q.difficulty,
        //     level: q.level,
        //     question: q.questionText,
        //     xpGain: q.xpGain,
        //     type: q.type,
        // }))

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

  const matchComplete = (gameId, playerResults, playerID) => {
    const gameData = matchMap.get(gameId);
    if (!gameData) {
      console.log('Game not found:', gameId);
      return;
    }

    // Update player done count
    if (!gameData.playerDoneCount.includes(playerID)) {
      gameData.playerDoneCount.push(playerID);
      gameData.playerResults.push(playerResults);
    }

    matchMap.set(gameId, gameData);
    if (gameData.playerDoneCount.length < 2) {
      console.log('Waiting for other player to finish game:', gameId);
      return;
    }

    console.log('Both players have completed the game:', gameId);

    // Process player results and update database or emit events as needed
    console.log('Match complete for game:', gameId);

    const secondPlayer =
      gameData.players[0] === playerID
        ? gameData.players[0]
        : gameData.players[1];
    const firstPlayer =
      gameData.players[0] === secondPlayer
        ? gameData.players[1]
        : gameData.players[0];

    //array with player 1 question objects
    //another array with player 2 question objects
    const firstPlayerToFinishResults = JSON.parse(gameData.playerResults[0]);
    const secondPlayerToFinishResults = JSON.parse(gameData.playerResults[1]);

    console.log('First player results:', firstPlayerToFinishResults);
    console.log('Second player results:', secondPlayerToFinishResults);

    const correctAnswersForFirstPlayer = firstPlayerToFinishResults.filter(
      (question) => question.isCorrect == true,
    );

    const correctAnswersForSecondPlayer = secondPlayerToFinishResults.filter(
      (question) => question.isCorrect == true,
    );

    if (
      correctAnswersForFirstPlayer.length > correctAnswersForSecondPlayer.length
    ) {
      console.log(
        'Player 1 wins:',
        firstPlayer,
        'Player 2 loses:',
        secondPlayer,
      );
      io.to(firstPlayer).emit('matchEnd', {
        isWinner: true,
      });
      io.to(secondPlayer).emit('matchEnd', {
        isWinner: false,
      });
    } else if (
      correctAnswersForFirstPlayer.length < correctAnswersForSecondPlayer.length
    ) {
      console.log(
        'Player 2 wins:',
        secondPlayer,
        'Player 1 loses:',
        firstPlayer,
      );
      io.to(secondPlayer).emit('matchEnd', {
        isWinner: true,
      });
      io.to(firstPlayer).emit('matchEnd', {
        isWinner: false,
      });
    } else {
      console.log('Match is a draw between:', firstPlayer, 'and', secondPlayer);
      io.to(firstPlayer).emit('matchEnd', {
        isWinner: false,
      });
      io.to(secondPlayer).emit('matchEnd', {
        isWinner: false,
      });
    } //@Ntokozo: update the if statement to be in line with ELO

    //TODO: process the results, here is where the elo logic comes in. A object is passed through from the FE with all of the questions and their answers. Can we update the ELO algorithm so that it can give back the amount of XP for each player?

    //I added the multiPlayerArray functionality. Can you see if that will work.

    // Clean up the matchMap entry
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
