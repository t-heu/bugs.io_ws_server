import { ClientContext } from '../ws/context';

export function handleJoin(data: any, ctx: ClientContext) {
  const { uid, room } = data;

  if (!uid || !room) {
    ctx.ws.send(JSON.stringify({ type: 'error', message: 'join requer uid, room e token' }));
    return;
  }

  // Simulação de validação de token (substitua por JWT se quiser)
  /*if (token !== 'valid-token') {
    ctx.ws.send(JSON.stringify({ type: 'error', message: 'Token inválido' }));
    ctx.ws.close();
    return;
  }*/

  ctx.uid = uid;
  ctx.room = room;
  //ctx.token = token;

  if (!ctx.rooms[room]) ctx.rooms[room] = {};
  ctx.rooms[room][uid] = ctx.ws;

  ctx.log({
    type: 'JOIN',
    uid,
    room,
    msg: `Jogador entrou na sala.`,
  });  
}
