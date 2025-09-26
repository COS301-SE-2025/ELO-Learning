'use client';

import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { useSocket } from '@/socket';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GameClient({ game, level }) {
  const { socket, session, status } = useSocket();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [isWaitingForOpponentStart, setIsWaitingForOpponentStart] =
    useState(true);
  const [isWaitingForOpponentFinish, setIsWaitingForOpponentFinish] =
    useState(false);
  const [error, setError] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [gameErrorMessage, setGameErrorMessage] = useState('');

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (socket && game) {
        socket.emit('playerQuit', game);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, game]);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }

    console.log('GameClient mounted with:', { game, level });

    if (!game || !level) {
      console.error('Missing game or level data:', { game, level });
      setError('Missing game data');
      return;
    }

    if (!socket || !socket.connected) {
      console.error('Socket not connected');
      setError('Connection error');
      return;
    }

    console.log('Emitting startMatch event');
    socket.emit('startMatch', { game, level });

    function onGameReady(data) {
      console.log('Game is ready:', data);
      setQuestions(data.questions);
      setIsWaitingForOpponentStart(false);
    }

    function onGameError(data) {
      setGameErrorMessage(
        data?.error || 'Something went wrong with the match.',
      );
      setTimeout(() => router.push('/dashboard'), 2000);
    }

    function onOpponentQuit(data) {
      if (data?.gameId === game) {
        setGameErrorMessage(
          'Your opponent quit the game. Returning to dashboard...',
        );
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    }

    function onMatchEnd(data) {
      console.log('Match ended:', data);
      // Prevent multiple navigations
      if (hasNavigated) {
        console.log(
          'Already navigated to end screen, ignoring duplicate event',
        );
        return;
      }
      setHasNavigated(true);

      // Use router.push for client-side navigation
      const result = data.isWinner ? 'winner' : 'loser';
      router.push(`/match-endscreen?result=${result}`);
    }

    socket.on('gameReady', onGameReady);
    socket.on('gameError', onGameError);
    socket.on('opponentQuit', onOpponentQuit);
    socket.on('matchEnd', onMatchEnd);

    return () => {
      socket.off('gameReady', onGameReady);
      socket.off('gameError', onGameError);
      socket.off('opponentQuit', onOpponentQuit);
      socket.off('matchEnd', onMatchEnd);
    };
  }, [game, level, socket, status, hasNavigated, router]);

  const submitCallback = () => {
    console.log('Submit callback triggered - Match ended');
    // Prevent submitting multiple times
    if (isWaitingForOpponentFinish) {
      console.log('Already submitted results, ignoring duplicate submission');
      return;
    }
    setIsWaitingForOpponentFinish(true);

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
      {gameErrorMessage && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg font-bold">
            {gameErrorMessage}
          </div>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg font-bold">Error: {error}</div>
          <div className="text-sm mt-2">
            Game: {game}, Level: {level}
          </div>
        </div>
      )}

      {!error && questions.length > 0 && !isWaitingForOpponentFinish && (
        <div>
          <QuestionsTracker
            questions={questions}
            submitCallback={submitCallback}
            lives={20}
            mode="multiplayer"
          />
        </div>
      )}

      {!error && isWaitingForOpponentStart && !gameErrorMessage && (
        <div>
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
        </div>
      )}

      {!error && isWaitingForOpponentFinish && !gameErrorMessage && (
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
