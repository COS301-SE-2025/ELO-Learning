// classroomWarsSocket.js
import { io } from 'socket.io-client';

// You may want to set the URL dynamically based on environment
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;
