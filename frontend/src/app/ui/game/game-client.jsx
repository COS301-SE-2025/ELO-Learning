'use client';

import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { socket } from '@/socket';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GameClient({ game, level }) {
  const [questions, setQuestions] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    console.log('Game: ', game);
    console.log('Level: ', level);
    socket.emit('startMatch', { game, level });

    function onGameReady(data) {
      console.log('Game is ready:', data);
      setQuestions(data.questions);
    }

    function onMatchEnd(data) {
      console.log('Match ended:', data);
      console.log('Game finished state:', gameFinished);
      // Only redirect if this player has finished their own game
      if (gameFinished) {
        const result = data.isWinner ? 'winner' : 'loser';
        console.log('Redirecting to match-endscreen with result:', result);
        redirect(`/match-endscreen?result=${result}`);
      } else {
        console.log(
          'Other player finished first, waiting for this player to finish...',
        );
        // Store the match result for when this player finishes
        localStorage.setItem('pendingMatchResult', JSON.stringify(data));
      }
    }

    function onEloResults(data) {
      console.log('ELO Results received:', data);
      console.log('Received by socket ID:', socket.id);
      // Store ELO data for the endscreen
      localStorage.setItem('eloResults', JSON.stringify(data));
    }

    socket.on('gameReady', onGameReady);
    socket.on('matchEnd', onMatchEnd);
    socket.on('eloResults', onEloResults);

    return () => {
      socket.off('gameReady', onGameReady);
      socket.off('matchEnd', onMatchEnd);
      socket.off('eloResults', onEloResults);
    };
  }, [gameFinished]);

  const submitCallback = () => {
    console.log('Submit callback triggered - This player finished');
    console.log('Current socket ID:', socket.id);
    console.log('Game ID:', game);

    // Mark that this player has finished
    setGameFinished(true);

    // Check what user info we have
    const userToken = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User token exists:', !!userToken);
    console.log('User info:', userInfo);
    console.log('User ID:', userInfo.id);

    // Emit an event to the server to handle the end of the match
    const userAnswers = localStorage.getItem('questionsObj');
    socket.emit('matchComplete', {
      game,
      playerResults: userAnswers,
      socketId: socket.id,
      userId: userInfo.id, // Add the actual user ID
    });

    // Check if there's a pending match result (other player finished first)
    const pendingResult = localStorage.getItem('pendingMatchResult');
    if (pendingResult) {
      console.log('Using pending match result');
      const data = JSON.parse(pendingResult);
      const result = data.isWinner ? 'winner' : 'loser';
      localStorage.removeItem('pendingMatchResult');
      console.log('Redirecting with pending result:', result);
      redirect(`/match-endscreen?result=${result}`);
    }
    // If no pending result, wait for matchEnd event

    // Clear local storage for questions
    // localStorage.removeItem('questionsObj');
  };

  return (
    <div>
      <div>
        {questions.length > 0 && (
          <QuestionsTracker
            questions={questions}
            submitCallback={submitCallback}
            lives={15}
            isMultiplayer={true}
          />
        )}
      </div>
    </div>
  );
}
