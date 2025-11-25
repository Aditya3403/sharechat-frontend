// socket.js (New file to manage the socket instance)
import { io } from 'socket.io-client';

const socket = io("http://localhost:3000", {
  autoConnect: false, // Prevents auto connection
});

export default socket;