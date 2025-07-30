'use client';

import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { socket } from '@/socket';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GameClient({ game, level }) {
  const [questions, setQuestions] = useState([]);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('GameClient mounted with:', { game, level });

    if (!game || !level) {
      console.error('Missing game or level data:', { game, level });
      setError('Missing game data');
      return;
    }

    console.log('Emitting startMatch event');
    socket.emit('startMatch', { game, level });

    function onGameReady(data) {
      console.log('Game is ready:', data);
      setQuestions(data.questions);
    }

    function onGameError(data) {
      console.error('Game error:', data);
      setError(data.error || 'Unknown game error');
    }
    function onGameReady(data) {
      console.log('Game is ready:', data);
      setQuestions(data.questions);
    }

    function onMatchEnd(data) {
      console.log('Match ended:', data);
      // Redirect to match endscreen with the result
      const result = data.isWinner ? 'winner' : 'loser';
      redirect(`/match-endscreen?result=${result}`);
    }

    socket.on('gameReady', onGameReady);
    socket.on('gameError', onGameError);
    socket.on('matchEnd', onMatchEnd);

    return () => {
      socket.off('gameReady', onGameReady);
      socket.off('gameError', onGameError);
      socket.off('matchEnd', onMatchEnd);
    };
  }, []);

  const submitCallback = () => {
    console.log('Submit callback triggered - Match ended');
    setIsWaitingForOpponent(true);
    // Emit an event to the server to handle the end of the match
    const userAnswers = localStorage.getItem('questionsObj');
    socket.emit('matchComplete', {
      game,
      playerResults: userAnswers,
      socketId: socket.id,
    });
    // Clear local storage for questions
    // localStorage.removeItem('questionsObj');
    // redirect('/match-endscreen');
  };

  return (
    <div>
      {error && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg font-bold">Error: {error}</div>
          <div className="text-sm mt-2">
            Game: {game}, Level: {level}
          </div>
        </div>
      )}

      {!error && !isWaitingForOpponent && (
        <div>
          {questions.length > 0 ? (
            <QuestionsTracker
              questions={questions}
              submitCallback={submitCallback}
              lives={15}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <div className="flex flex-row items-center justify-center gap-5">
                <div
                  className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
              <div className="text-lg font-bold text-center">
                Both players need to be ready before the game starts
              </div>
            </div>
          )}
        </div>
      )}

      {!error && isWaitingForOpponent && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="flex flex-row items-center justify-center gap-5">
            <div
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
          <div className="text-lg font-bold">
            Waiting for your opponent to finish...
          </div>
        </div>
      )}
    </div>
  );
}
