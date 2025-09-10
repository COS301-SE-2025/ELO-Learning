'use client';

import { io } from 'socket.io-client';

// Single socket instance - import this where you need the raw socket
// But prefer using the useSocket hook for React components
export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: false, // We'll connect manually through useSocket hook
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000, // Increased timeout
});

//TODO: I don't think this belongs here....
// Add localStorage saving handler
socket.on('saveMatchData', (data) => {
  if (typeof window !== 'undefined') {
    try {
      console.log('Saving match data to localStorage:', data);

      // Validate the data before saving
      if (!data || typeof data !== 'object') {
        console.error('Invalid match data received:', data);
        return;
      }

      // Ensure it has the required fields
      if (
        !data.players ||
        !Array.isArray(data.players) ||
        data.players.length !== 2
      ) {
        console.error('Match data missing players array:', data);
        // Try to reconstruct missing fields with fallbacks
        data.players = data.players || [];
      }

      localStorage.setItem('multiplayerGameData', JSON.stringify(data));
      console.log('Successfully saved match data to localStorage');
    } catch (error) {
      console.error('Error saving match data to localStorage:', error);
    }
  }
});

// Export useSocket hook for easy access
export { useSocket } from './hooks/useSocket';
