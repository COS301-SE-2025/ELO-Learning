'use client';

import { io } from 'socket.io-client';

// Single socket instance - import this where you need the raw socket
// But prefer using the useSocket hook for React components
export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: false, // We'll connect manually through useSocket hook
});

// Export useSocket hook for easy access
export { useSocket } from './hooks/useSocket';
