import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    socket = io(`${base}/chat`, {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
