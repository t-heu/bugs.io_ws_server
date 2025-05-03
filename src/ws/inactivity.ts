import { INACTIVITY_TIMEOUT } from '../config/constants';
import WebSocket from 'ws';
import { ClientContext } from './context';

// Função para verificar inatividade e desconectar se necessário
export function checkInactivity(client: WebSocket, ctx: ClientContext, now: number) {
  if (now - (ctx.lastActiveAt || 0) > INACTIVITY_TIMEOUT) {
    ctx.log({
      type: 'DISCONNECT',
      uid: ctx.uid,
      room: ctx.room,
      msg: `Desconectado por inatividade (sem enviar posição). Último ativo: ${ctx.lastActiveAt}, agora: ${now}`,
    });
    return client.terminate();
  }
  return false;
}
