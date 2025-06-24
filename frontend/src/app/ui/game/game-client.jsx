'use client';

import QuestionsTracker from '@/app/ui/questions/questions-tracker';
import { socket } from '@/socket';
import { useEffect, useState } from 'react';

export default function GameClient({ game, level }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    console.log('Game: ', game);
    console.log('Level: ', level);
    socket.emit('startMatch', { game, level });

    function onGameReady(data) {
      console.log('Game is ready:', data);
      setQuestions(data.questions);
    }

    socket.on('gameReady', onGameReady);

    return () => {
      socket.off('gameReady', onGameReady);
    };
  }, []);

  const submitCallback = () => {
    console.log('Submit callback triggered - Match ended');
    // We need to emit an event to the server to handle the end of the match
  };

  return (
    <div>
      <div>
        {questions.length > 0 && <QuestionsTracker questions={questions} />}
      </div>
    </div>
  );
}
