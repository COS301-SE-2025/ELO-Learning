'use client';
import { connectSocket, socket } from '@/socket';
import { CircleSmall } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [isQueueing, setIsQueueing] = useState(false);
  const [color, setColor] = useState('#FF6666');
  const [opponent, setOpponent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [gameId, setGameId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Connect socket with user data
    const userData = connectSocket();
    setCurrentUser(userData);

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setColor('#40E001');
    }

    function onDisconnect() {
      setIsConnected(false);
      setColor('#FF6666');
    }

    function matchFound(data) {
      setIsQueueing(false);
      console.log('Match found! Opponent:', data.opponent);
      setOpponent(data.opponent);
      // Store the game ID for later use
      setGameId(data.gameId);
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

  const startQueue = () => {
    // If we have an opponent and gameId, start the game
    if (opponent && gameId) {
      router.push(`/game/${gameId}`);
      return;
    }

    // Otherwise, start the queue
    if (isConnected && currentUser) {
      socket.emit('queue', { userData: currentUser });
      setIsQueueing(true);
    } else {
      console.error('Socket is not connected or user data not available');
    }
  };

  const cancel = () => {
    if (isQueueing) {
      setIsQueueing(false);
      setOpponent(null);
      setGameId(null);
      socket.emit('cancelQueue');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center gap-15">
      <div>
        <h2 className="text-2xl font-bold">Ready to start a match?</h2>
      </div>

      {/* Connection Status */}
      {!opponent && (
        <div className="flex flex-row items-center gap-2">
          <CircleSmall size={24} fill={color} stroke={color} />
          <span className={`ml-2 text-[${color}]`}>
            {!isQueueing && (isConnected ? 'Connected' : 'Connecting...')}
            {isQueueing && 'Searching for an opponent...'}
          </span>
        </div>
      )}

      {/* Opponent Information */}
      {opponent && (
        <div className="bg-[#1D1A34] p-6 rounded-lg max-w-md w-full">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xl">
              {/* <span className="font-medium text-black">Username:</span> */}
              <span>{opponent.username}</span>
              <span className="text-[#FF6E99] font-bold">{opponent.xp} XP</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-300 mt-4">
            Click "Start Game" when ready!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-10">
        <button
          className={`${
            isQueueing ? 'disabled_button' : 'main-button-landing'
          } uppercase`}
          onClick={startQueue}
          disabled={isQueueing}
        >
          {opponent ? 'Start Game' : 'Start a match'}
        </button>
        <button className="secondary-button uppercase" onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
