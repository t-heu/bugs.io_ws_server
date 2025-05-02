import { ClientContext } from '../context';

export function handlePosition(data: any, ctx: ClientContext) {
  const { x, y } = data;

  if (!ctx.room || !ctx.uid) return;

  const payload = JSON.stringify({
    type: 'position',
    uid: ctx.uid,
    x,
    y,
  });

  const roomSockets = ctx.rooms[ctx.room];
  Object.entries(roomSockets).forEach(([id, socket]) => {
    if (id !== ctx.uid) {
      socket.send(payload);
    }
  });
}
