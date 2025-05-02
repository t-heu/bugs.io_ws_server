import { handleJoin } from './join';
import { handlePosition } from './position';
import { ClientContext } from '../context';

const handlers: Record<string, (data: any, ctx: ClientContext) => void> = {
  join: handleJoin,
  position: handlePosition,
};

export function handleMessage(message: string, ctx: ClientContext) {
  try {
    const data = JSON.parse(message);
    const handler = handlers[data.type];

    if (handler) {
      handler(data, ctx);
    } else {
      ctx.ws.send(JSON.stringify({ type: 'error', message: 'Tipo inválido' }));
    }
  } catch (err) {
    ctx.ws.send(JSON.stringify({ type: 'error', message: 'JSON inválido' }));
  }
}
