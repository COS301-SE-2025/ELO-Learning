'use client';
import { socket } from '@/socket';
import { CircleSmall } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isQueueing, setIsQueueing] = useState<boolean>(false);
  const [color, setColor] = useState<string>('#FF6666');

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect(): void {
      setIsConnected(true);
      setColor('#40E001');
    }

    function onDisconnect(): void {
      setIsConnected(false);
      setColor('#FF6666');
    }

    function matchFound(gameId: string): void {
      setIsQueueing(false);
      console.log('Match found! Redirecting to game...');
      redirect('/game/' + gameId);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('startGame', matchFound);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('startGame', matchFound);
    };
  }, []);

  const startQueue = (): void => {
    if (isConnected) {
      socket.emit('queue');
    } else {
      console.error('Socket is not connected');
    }
    setIsQueueing(true);
  };

  const cancel = (): void => {
    if (isQueueing) {
      setIsQueueing(false);
      socket.emit('cancelQueue');
    } else {
      redirect('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center gap-15">
      <div>
        <h2 className="text-2xl font-bold">Ready to start a match?</h2>
      </div>
      <div className="flex flex-row items-center gap-2">
        <CircleSmall size={24} fill={color} stroke={color} />
        <span className={`ml-2 text-[${color}]`}>
          {!isQueueing && (isConnected ? 'Connected' : 'Connecting...')}
          {isQueueing && 'Searching for an opponent...'}
        </span>
      </div>
      <div className="flex flex-col items-center gap-10">
        <button
          className={`${
            isQueueing ? 'disabled_button' : 'main-button'
          } uppercase`}
          onClick={startQueue}
          disabled={isQueueing}
        >
          Start a match
        </button>
        <button className="secondary-button uppercase" onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
