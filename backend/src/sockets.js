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
      //Write to the database
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
    console.log('Starting match for game:', gameId, 'with level:', level);
    const gameData = matchMap.get(gameId);
    console.log(gameData);
    if (!gameData) {
      console.log('Game not found:', gameId);
      return;
    }

    // Update player ready count
    if (!gameData.playerReadyCount.includes(socket.id)) {
      gameData.playerReadyCount.push(socket.id);
    }

    // Store user level data
    if (!gameData.levels.includes(level)) {
      gameData.levels.push(level);
    }

    // Update the matchMap with the modified data
    matchMap.set(gameId, gameData);

    if (gameData.playerReadyCount.length === 2) {
      console.log('Both players are ready for game:', gameId);

      console.log('Game levels: ', gameData.levels);

      try {
        // Calculate the average level from all players
        const averageLevel = Math.round(
          gameData.levels.reduce((sum, level) => sum + level, 0) /
            gameData.levels.length,
        );

        console.log(
          `Game ${gameId} - Player levels: ${gameData.levels}, Average level: ${averageLevel}`,
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

  const matchComplete = async (
    gameId,
    playerResults,
    playerID,
    userId = null,
  ) => {
    const gameData = matchMap.get(gameId);
    if (!gameData) {
      console.log('Game not found:', gameId);
      return;
    }

    // Update player done count
    if (!gameData.playerDoneCount.includes(playerID)) {
      gameData.playerDoneCount.push(playerID);
      gameData.playerResults.push(playerResults);

      // Store user ID mapping for database updates
      if (userId) {
        if (!gameData.userIds) {
          gameData.userIds = [];
        }
        gameData.userIds.push(userId);
        console.log('Stored user ID:', userId, 'for player:', playerID);
      }
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

    // ELO Logic Implementation
    try {
      console.log('=== Starting ELO Logic ===');
      console.log('First Player ID:', firstPlayer);
      console.log('Second Player ID:', secondPlayer);
      console.log(
        'First Player Results Length:',
        firstPlayerToFinishResults.length,
      );
      console.log(
        'Second Player Results Length:',
        secondPlayerToFinishResults.length,
      );

      // Get player ratings from database (assuming you have user IDs)
      // For now, using placeholder ratings - you should fetch from Users table
      const player1Rating = 1000; // Replace with actual user XP/rating from firstPlayer
      const player2Rating = 1000; // Replace with actual user XP/rating from secondPlayer

      console.log('Player 1 Rating:', player1Rating);
      console.log('Player 2 Rating:', player2Rating);

      // Use the multiPlayerArray function to calculate XP distribution
      const eloMatchResult = distributeXPFromResults(
        firstPlayerToFinishResults,
        secondPlayerToFinishResults,
        player1Rating,
        player2Rating,
      );

      console.log('=== ELO Match Result ===');
      console.log('ELO Match result:', JSON.stringify(eloMatchResult, null, 2));
      console.log('Player 1 XP Earned:', eloMatchResult.player1XP);
      console.log('Player 2 XP Earned:', eloMatchResult.player2XP);
      console.log('Match Winner:', eloMatchResult.matchResult);

      // Send simplified ELO-based data to players
      const eloData = {
        xpEarned: eloMatchResult.player1XP,
        matchWinner: eloMatchResult.matchResult,
      };

      const eloData2 = {
        xpEarned: eloMatchResult.player2XP,
        matchWinner: eloMatchResult.matchResult,
      };

      console.log('=== Sending ELO Data ===');
      console.log(
        'ELO Data for Player 1 - XP:',
        eloMatchResult.player1XP,
        'Winner:',
        eloMatchResult.matchResult,
      );
      console.log(
        'ELO Data for Player 2 - XP:',
        eloMatchResult.player2XP,
        'Winner:',
        eloMatchResult.matchResult,
      );

      // Emit ELO results to both players
      io.to(firstPlayer).emit('eloResults', eloData);
      io.to(secondPlayer).emit('eloResults', eloData2);

      console.log('ELO results emitted to both players');

      // Update database with XP changes
      try {
        console.log('=== Updating Database with XP ===');

        // We need to get the actual user IDs for the database update
        // For now, we're using socket IDs, but we need to map to user IDs
        // The frontend sends userId in matchComplete, let's use that

        // Get user IDs from the socket rooms or stored data
        const gameData = matchMap.get(gameId);
        if (gameData && gameData.userIds) {
          const [userId1, userId2] = gameData.userIds;

          // Update Player 1 XP
          const { data: user1, error: error1 } = await supabase
            .from('Users')
            .select('XP')
            .eq('id', userId1)
            .single();

          if (!error1 && user1) {
            const newXP1 = user1.XP + eloMatchResult.player1XP;
            const { error: updateError1 } = await supabase
              .from('Users')
              .update({ XP: newXP1 })
              .eq('id', userId1);

            if (updateError1) {
              console.error('Error updating Player 1 XP:', updateError1);
            } else {
              console.log(
                `Player 1 XP updated: ${user1.XP} -> ${newXP1} (+${eloMatchResult.player1XP})`,
              );
            }
          }

          // Update Player 2 XP
          const { data: user2, error: error2 } = await supabase
            .from('Users')
            .select('XP')
            .eq('id', userId2)
            .single();

          if (!error2 && user2) {
            const newXP2 = user2.XP + eloMatchResult.player2XP;
            const { error: updateError2 } = await supabase
              .from('Users')
              .update({ XP: newXP2 })
              .eq('id', userId2);

            if (updateError2) {
              console.error('Error updating Player 2 XP:', updateError2);
            } else {
              console.log(
                `Player 2 XP updated: ${user2.XP} -> ${newXP2} (+${eloMatchResult.player2XP})`,
              );
            }
          }
        } else {
          console.warn(
            'Could not find user IDs for XP update. Game data:',
            gameData,
          );
        }
      } catch (dbError) {
        console.error('=== Database Update Error ===');
        console.error('Error updating XP in database:', dbError);
      }
    } catch (error) {
      console.error('=== ELO ERROR ===');
      console.error('Error processing ELO results:', error);
      console.error('Error stack:', error.stack);
    }

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

  socket.on('queue', queueForGame);
  socket.on('cancelQueue', cancelQueue);
  socket.on('startMatch', (data) => startMatch(data.game, data.level));
  socket.on('matchComplete', (data) => {
    matchComplete(data.game, data.playerResults, data.socketId, data.userId);
  });
};
