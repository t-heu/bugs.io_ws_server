import type WebSocket from 'ws';

export interface ClientContext {
  ws: WebSocket;
  uid: string;
  room: string;
  isAlive: boolean;
  rooms: Record<string, Record<string, WebSocket>>;
  log: (msg: string) => void;
  token?: string;
  pingAttempts: number
  lastActiveAt: any
}

export function createContext(ws: WebSocket, rooms: Record<string, Record<string, WebSocket>>): ClientContext {
  return {
    ws,
    uid: '',
    room: '',
    isAlive: true,
    pingAttempts: 0,
    lastActiveAt: new Date(),
    rooms,
    log: (msg: string) => {
      const now = new Date().toISOString();
      console.log(`[${now}] ${msg}`);
    },
  };
}
