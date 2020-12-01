const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let data = {
  "a" : 5,
  "b" : 9
}

wss.on('connection', (ws) => {
  console.log('new connection')
  ws.send(JSON.stringify(data));
  ws.on('message', function incoming(message) {
    // console.log('received: %s', message);
    // Update internal data structure here
    data = JSON.parse(message);
    console.log(data);
    wss.broadcast(JSON.stringify(data));
  });
});

wss.broadcast = (msg) => {
  console.log("broadcasting ", msg);
  wss.clients.forEach((client) => {
    client.send(msg);
  });
}
