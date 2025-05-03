import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

import { PING_INTERVAL } from './config/constants';
import { handleMessage } from './handlers';
import { createContext, ClientContext } from './ws/context';
import { checkInactivity } from './ws/inactivity';
import { checkPing } from './ws/ping';
import { checkRateLimit } from './ws/rateLimit';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms: Record<string, Record<string, WebSocket>> = {};
const wsContextMap = new WeakMap<WebSocket, ClientContext>();

// Função principal do setInterval
setInterval(() => {
  const now = Date.now();
  wss.clients.forEach((client) => {
    const ctx = wsContextMap.get(client);
    if (!ctx) return;

    // Verifica a inatividade
    if (checkInactivity(client, ctx, now)) return;

    // Verifica o ping/pong
    if (checkPing(client, ctx)) return;

    // Reseta o status de isAlive e envia o ping
    ctx.isAlive = false;
    client.ping();
  });
}, PING_INTERVAL);

wss.on('connection', (ws, req) => {
  const ctx = createContext(ws, rooms);
  // CORS
  const origin = req.headers.origin;

  if (!origin) return ws.terminate();

  const allowedOrigins = ['https://bugs-io.onrender.com', 'http://localhost:3000'];

  if (!allowedOrigins.includes(origin)) {
    ctx.log({
      type: 'DISCONNECT',
      uid: ctx.uid,
      room: ctx.room,
      msg: `Conexão rejeitada por origem não permitida: ${origin}`
    });    
    return ws.terminate();
  }

  wsContextMap.set(ws, ctx);
  ctx.lastMessageAt = ctx.lastMessageAt || 0;

  ws.on('pong', () => {
    const current = wsContextMap.get(ws);
    if (current) {
      current.isAlive = true;
      current.pingAttempts = 0;
    }
  });

  ws.on('message', (message) => {
    const now = Date.now();
    ctx.lastActiveAt = now;

    const { terminate } = checkRateLimit(ctx, message.toString(), now);
    if (terminate) {
      ws.terminate();
      return;
    }

    ctx.lastMessageAt = now;

    handleMessage(message.toString(), ctx);
  });

  ws.on('close', () => {
    ctx.log({ type: 'DISCONNECT', uid: ctx.uid, room: ctx.room, msg: 'Conexão fechada' });

    if (ctx.room && ctx.uid && ctx.rooms[ctx.room]) {
      delete ctx.rooms[ctx.room][ctx.uid];
      if (Object.keys(ctx.rooms[ctx.room]).length === 0) {
        delete ctx.rooms[ctx.room];
        ctx.log({ type: 'INFO', room: ctx.room, msg: 'Sala removida por estar vazia' });
      }
    }

    wsContextMap.delete(ws);
  });

  ws.on('error', (err) => {
    ctx.log({ type: 'ERROR', uid: ctx.uid, msg: 'Erro no WebSocket', error: err });
  });  
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`WebSocket server listening on ${port}`);
});
/*
const playerData = {
  name,
  uid: nextPlayer,
  killer: '',
  position: {
    x: ARENA_SIZE / 2,
    y: ARENA_SIZE / 2,
  },
  size: 30,
  score: scoreCurrent,
  stats: {
    speed: character.stats.speed * 0.5,
    attack: character.stats.attack,
    health: character.stats.health,
    maxHealth: character.stats.health,
  },
  effects: {
    invincible: '',
    speedBoost: '',
    poisonedUntil: '',
    specialAttack: '',
    slow: ''
  },
  poisonNextAttack: false,
  type: character.id,
  ability: character.ability || null
};*/
