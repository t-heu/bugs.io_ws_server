import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { handleMessage } from './handlers';
import { createContext, ClientContext } from './context';

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms: Record<string, Record<string, WebSocket>> = {};
const wsContextMap = new WeakMap<WebSocket, ClientContext>();

const PING_INTERVAL = 30000;  // Intervalo de ping em ms
const MAX_PING_ATTEMPTS = 3; // Tentativas antes de desconectar
const INACTIVITY_TIMEOUT = 10000; // 10 segundos

setInterval(() => {
  const now = Date.now();
  wss.clients.forEach((client) => {
    const ctx = wsContextMap.get(client);
    if (!ctx) return;

    // ❌ Desconecta por inatividade de jogo (sem enviar posição)
    if (now - (ctx.lastActiveAt || 0) > INACTIVITY_TIMEOUT) {
      console.log(`❌ [${ctx.uid}] Desconectando por inatividade (sem enviar posição). Último ativo: ${ctx.lastActiveAt}, agora: ${now}`);
      return client.terminate();
    }

    // ✅ Verifica o ping/pong
    if (!ctx.isAlive) {
      ctx.pingAttempts = (ctx.pingAttempts || 0) + 1;
      if (ctx.pingAttempts >= MAX_PING_ATTEMPTS) {
        console.log(`⚠️ Cliente ${ctx.uid} desconectado por falha no ping/pong`);
        return client.terminate();
      }
    } else {
      ctx.pingAttempts = 0;
    }

    ctx.isAlive = false;
    client.ping();
  });
}, PING_INTERVAL);

wss.on('connection', (ws) => {
  const ctx = createContext(ws, rooms);
  wsContextMap.set(ws, ctx);

  ws.on('pong', () => {
    const current = wsContextMap.get(ws);
    if (current) {
      current.isAlive = true;
      current.pingAttempts = 0;
    }
  });

  ws.on('message', (message) => {
    ctx.lastActiveAt = Date.now();
    handleMessage(message.toString(), ctx);
  });

  ws.on('close', () => {
    console.log(`🔌 Conexão fechada: ${ctx.uid} da sala ${ctx.room}`);

    if (ctx.room && ctx.uid && ctx.rooms[ctx.room]) {
      delete ctx.rooms[ctx.room][ctx.uid];
      if (Object.keys(ctx.rooms[ctx.room]).length === 0) {
        delete ctx.rooms[ctx.room];
        console.log(`🧹 Sala ${ctx.room} removida por estar vazia`);
      }
    }

    wsContextMap.delete(ws);
  });

  ws.on('error', (err) => {
    console.warn(`Erro no WebSocket do cliente ${ctx.uid}:`, err.message);
  });  
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`WebSocket server listening on ws://localhost:${port}`);
});
