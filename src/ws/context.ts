import type WebSocket from 'ws';

interface LogDTO {
  type: 'INFO' | 'WARN' | 'ERROR' | 'DISCONNECT' | 'SECURITY' | 'JOIN';
  uid?: string;
  room?: string;
  msg: string;
  error?: any;
}

export interface ClientContext {
  ws: WebSocket;
  uid: string;
  room: string;
  isAlive: boolean;
  rooms: Record<string, Record<string, WebSocket>>;
  log: (logs: LogDTO) => void;
  token?: string;
  pingAttempts: number
  lastActiveAt: number
  lastMessageAt: number
}

export function createContext(ws: WebSocket, rooms: Record<string, Record<string, WebSocket>>): ClientContext {
  return {
    ws,
    uid: '',
    room: '',
    isAlive: true,
    pingAttempts: 0,
    lastActiveAt: 0,
    lastMessageAt: 0,
    rooms,
    log: ({type, uid, room, msg, error}: LogDTO) => {
        const time = new Date().toISOString();
        const prefix = `[${type}]`;
        const user = uid ? ` UID: ${uid}` : '';
        const sala = room ? ` ROOM: ${room}` : '';
        const fullMessage = `${prefix}${user}${sala} - ${msg}`;
      
        if (type === 'ERROR' && error) {
          console.error(`${time} ${fullMessage}`, error);
        } else if (type === 'WARN') {
          console.warn(`${time} ${fullMessage}`);
        } else {
          console.log(`${time} ${fullMessage}`);
        }
    },
  };
}
