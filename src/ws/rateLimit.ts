import { RATE_LIMIT_MS } from '../config/constants';
import {  ClientContext } from './context';

export function checkRateLimit(ctx: ClientContext, message: any, now: number) {
  const data = JSON.parse(message);

  if (now - ctx.lastMessageAt < RATE_LIMIT_MS) {
    if (data.type === 'position') {
      return { terminate: false };
    }

    ctx.log({ 
      type: 'SECURITY', 
      uid: ctx.uid, 
      room: ctx.room, 
      msg: 'Rate limit excedido. Conexão encerrada.' 
    });
    return { terminate: true };
  }
  
  return { terminate: false };
}
