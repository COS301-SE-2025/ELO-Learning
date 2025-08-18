'use client';

import { io } from 'socket.io-client';

// Single socket instance - import this where you need the raw socket
// But prefer using the useSocket hook for React components
export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: false, // We'll connect manually through useSocket hook
});

//TODO: I don't think this belongs here....
// Add localStorage saving handler
socket.on('saveMatchData', (data) => {
  if (typeof window !== 'undefined') {
    console.log('Saving match data to localStorage:', data);
    localStorage.setItem('multiplayerGameData', JSON.stringify(data));
  }
});

// Export useSocket hook for easy access
export { useSocket } from './hooks/useSocket';
