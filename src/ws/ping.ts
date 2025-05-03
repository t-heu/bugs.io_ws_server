import { MAX_PING_ATTEMPTS } from '../config/constants';
import WebSocket from 'ws';
import { ClientContext } from './context';

// Função para verificar falha no ping/pong e desconectar se necessário
export function checkPing(client: WebSocket, ctx: ClientContext) {
  if (!ctx.isAlive) {
    ctx.pingAttempts = (ctx.pingAttempts || 0) + 1;
    if (ctx.pingAttempts >= MAX_PING_ATTEMPTS) {
      ctx.log({ type: 'DISCONNECT', uid: ctx.uid, room: ctx.room, msg: 'Desconectado por falha no ping/pong' });
      return client.terminate();
    }
  } else {
    ctx.pingAttempts = 0;
  }
  return false;
}
