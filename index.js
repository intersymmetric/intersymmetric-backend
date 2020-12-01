// https://stackoverflow.com/questions/13364243/websocketserver-node-js-how-to-differentiate-clients

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let data = {
  "a" : 220,
  "b" : 440,
  "names" : {}
}

const s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

wss.getID = () => {
  return s4() + s4() + '-' + s4();
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(data)); // on connection immediately update
  ws.id = wss.getID();
  ws.on('message', (message) => {
    // Update internal data structure here
    let d = message.split(',')
    let key = d[0]
    if (key === 'name') {
      let val = d[1]  
      data.names[ws.id] = val
    } else {
      let val = parseInt(d[1])
      data[key] = val
    }

    
    // Broadcast to everyone else
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});
