import { io } from 'socket.io-client';

const rawSocketUrl =
  import.meta.env.VITE_SOCKET_URL ;

const SOCKET_URL = rawSocketUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  transports: ['websocket', 'polling'],
});

export default socket;