'use client';
import { useSocket } from '@/socket';
import { initializeAchievementTracking } from '@/utils/gameplayAchievementHandler';
import { CircleSmall } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { socket, session, status, isConnected } = useSocket();
  const [isQueueing, setIsQueueing] = useState(false);
  const [color, setColor] = useState('#FF6666');
  const [opponent, setOpponent] = useState(null);
  const [gameId, setGameId] = useState(null);
  const router = useRouter();

  // Initialize achievement tracking when user logs in (no notifications)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      initializeAchievementTracking(session.user.id);
    }
  }, [status, session?.user?.id]);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    function onConnect() {
      console.log('🔌 Socket connected');
      // Force state update on connection
      setColor('#40E001');
    }

    function onDisconnect() {
      console.log('🔌 Socket disconnected');
      // Force state update on disconnection
      setColor('#FF6666');
    }

    function matchFound(data) {
      setIsQueueing(false);
      console.log('Match found! Opponent:', data.opponent);
      setOpponent(data.opponent);
      // Store the game ID for later use
      setGameId(data.gameId);
    }

    if (socket) {
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('startGame', matchFound);

      // Check if socket is already connected when component mounts
      if (socket.connected) {
        onConnect();
      }
    }

    return () => {
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('startGame', matchFound);
      }
    };
  }, [socket, status, router]);

  const startQueue = () => {
    // If we have an opponent and gameId, start the game
    if (opponent && gameId) {
      router.push(`/game/${gameId}`);
      return;
    }

    // Otherwise, start the queue
    if (isConnected && session?.user) {
      socket.emit('queue', { userData: session.user });
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

      {/* Loading State */}
      {status === 'loading' && (
        <div className="text-center">
          <p>Loading...</p>
        </div>
      )}

      {/* Unauthenticated State */}
      {status === 'unauthenticated' && (
        <div className="text-center">
          <p>Please sign in to access matchmaking.</p>
        </div>
      )}

      {/* Normal UI - only show when authenticated and connected */}
      {status === 'authenticated' && (
        <>
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
                  <span>{opponent.username}</span>
                  <span className="text-[#FF6E99] font-bold">
                    Rank: {opponent.rank}
                  </span>
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
                isQueueing || !isConnected
                  ? 'disabled_button'
                  : 'main-button-landing'
              } uppercase`}
              onClick={startQueue}
              disabled={isQueueing || !isConnected}
            >
              {opponent ? 'Start Game' : 'Start a match'}
            </button>
            <button className="secondary-button uppercase" onClick={cancel}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
