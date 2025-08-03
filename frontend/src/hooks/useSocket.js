'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { socket } from '../socket'; // Use the shared socket instance

// Hook to initialize socket with session data
export function useSocket() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Add socket event listeners for debugging
    const onConnect = () => {
      // Socket connected successfully
    };

    const onDisconnect = (reason) => {
      // Socket disconnected
    };

    const onConnectError = (error) => {
      console.error('🚫 Socket connection error:', error);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (status === 'authenticated' && session?.user) {
      // Set user data for socket connection
      socket.auth = {
        userId: session.user.id,
        username: session.user.username,
        email: session.user.email,
      };

      // Connect socket if not already connected
      if (!socket.connected) {
        socket.connect();
      }

      // Store user data on socket for backward compatibility
      socket.userData = session.user;
    } else if (status === 'unauthenticated') {
      // Disconnect socket if user is not authenticated
      if (socket.connected) {
        socket.disconnect();
      }
    }

    return () => {
      // Cleanup event listeners
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [session, status]);

  return { socket, session, status, isConnected: socket.connected };
}
