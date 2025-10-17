import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(token: string) {
  if (socket) return socket;
  const url = (import.meta.env.VITE_WS_URL as string) || (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';
  socket = io(`${url}/chat`, {
    transports: ['websocket'],
    auth: { token },
  });
  return socket;
}

export function getSocket() {
  return socket;
}       
       