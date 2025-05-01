import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

type Room = {
  [uid: string]: WebSocket;
};

const rooms: Record<string, Room> = {};

const server = http.createServer();
const wss = new WebSocketServer({ server });

// 🔁 Mantém conexões vivas com ping a cada 30 segundos (PING-PONG)
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.ping();
    }
  });
}, 30000); // 30 segundos

wss.on('connection', (ws) => {
  let currentRoom = '';
  let uid = '';

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'join') {
        currentRoom = data.room;
        uid = data.uid;

        if (!rooms[currentRoom]) rooms[currentRoom] = {};
        rooms[currentRoom][uid] = ws;

        console.log(`✅ Jogador ${uid} entrou na sala ${currentRoom}`);;
        return;
      }

      if (data.type === 'position' && currentRoom && uid) {
        const { x, y } = data;

        //console.log(`📍 Posição recebida de ${uid} na sala ${currentRoom}: (${x}, ${y})`);

        const payload = JSON.stringify({
          type: 'position',
          uid,
          x,
          y
        });

        Object.entries(rooms[currentRoom]).forEach(([playerId, socket]) => {
          if (playerId !== uid) {
            socket.send(payload);
          }
        });
      }
    } catch (err) {
      console.error('Invalid message', err);
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Conexão fechada: ${uid} da sala ${currentRoom}`);

    if (currentRoom && uid && rooms[currentRoom]) {
      delete rooms[currentRoom][uid];
      if (Object.keys(rooms[currentRoom]).length === 0) {
        delete rooms[currentRoom];
        console.log(`🧹 Sala ${currentRoom} removida por estar vazia`);
      }
    }
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`WebSocket server listening on ws://localhost:${port}`);
});
