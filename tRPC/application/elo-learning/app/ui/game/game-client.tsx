'use client';

import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { socket } from '@/socket';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Question } from '@/services/api';

interface GameReadyData {
  questions: Question[];
}

interface MatchEndData {
  isWinner: boolean;
}

interface GameClientProps {
  game: string;
  level: string | number;
}

export default function GameClient({ game, level }: GameClientProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isWaitingForOpponent, setIsWaitingForOpponent] =
    useState<boolean>(false);

  useEffect(() => {
    console.log('Game: ', game);
    console.log('Level: ', level);
    socket.emit('startMatch', { game, level });

    function onGameReady(data: GameReadyData) {
      console.log('Game is ready:', data);
      setQuestions(data.questions);
    }

    function onMatchEnd(data: MatchEndData) {
      console.log('Match ended:', data);
      // Redirect to match endscreen with the result
      const result = data.isWinner ? 'winner' : 'loser';
      redirect(`/match-endscreen?result=${result}`);
    }

    socket.on('gameReady', onGameReady);
    socket.on('matchEnd', onMatchEnd);

    return () => {
      socket.off('gameReady', onGameReady);
      socket.off('matchEnd', onMatchEnd);
    };
  }, [game, level]);

  const submitCallback = (): void => {
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
      {!isWaitingForOpponent ? (
        <div>
          {questions.length > 0 && (
            <QuestionsTracker
              questions={questions}
              submitCallback={submitCallback}
              lives={15}
              mode="multiplayer"
            />
          )}
        </div>
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
          <div className="text-lg font-bold">
            Waiting for your opponent to finish...
          </div>
        </div>
      )}
    </div>
  );
}
