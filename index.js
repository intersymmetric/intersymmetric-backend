const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let data = {
  "a" : 220,
  "b" : 440
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(data));
  ws.on('message', (message) => {
    // Update internal data structure here
    data = JSON.parse(message);
    // Broadcast to everyone else
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
