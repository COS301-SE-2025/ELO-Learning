'use client';

import { io } from 'socket.io-client';

// Function to get user data from cookie/localStorage
function getUserData() {
  try {
    // Try to get from localStorage first
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      return JSON.parse(userFromStorage);
    }

    // Fallback to cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/user=([^;]+)/);
      if (match) {
        return JSON.parse(decodeURIComponent(match[1]));
      }
    }
  } catch (error) {
    console.error('Error getting user data:', error);
  }
  return null;
}

export const socket = io('http://localhost:3000', {
  autoConnect: false, // We'll connect manually when needed
});

// Function to connect with user data
export const connectSocket = () => {
  const userData = getUserData();
  if (userData && !socket.connected) {
    socket.connect();
    // Store user data for socket events
    socket.userData = userData;
  }
  return userData;
};

// Auto-connect if user data is available (for other components)
if (typeof window !== 'undefined') {
  const userData = getUserData();
  if (userData && !socket.connected) {
    socket.connect();
    socket.userData = userData;
  }
}
