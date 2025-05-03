import { ClientContext } from '../ws/context';

export const ARENA_SIZE = 2000

type PositionMessage = {
  type: 'position';
  x: number;
  y: number;
};

export function handlePosition(data: PositionMessage, ctx: ClientContext) {
  const { x, y } = data;

  if (!ctx.room || !ctx.uid) return;

  if (
    typeof data.x !== 'number' || typeof data.y !== 'number' ||
    data.x < 0 || data.x > ARENA_SIZE || data.y < 0 || data.y > ARENA_SIZE
  ) return;

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
