// https://stackoverflow.com/questions/13364243/websocketserver-node-js-how-to-differentiate-clients

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let data = {
    "type" : "data",
    "a" : 1000,
    "b" : 1001,
}

let users = {
    "type" : "users",
    "connections" : 0
}

// Unique IDs for each connection
const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

wss.getID = () => {
    return s4() + s4() + '-' + s4();
}

wss.on('connection', (ws) => {
    users["connections"] = users.connections + 1;
    // Update every user about the new connection
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(users))
        }
    })
    ws.send(JSON.stringify(data)); // on connection immediately update
    ws.id = wss.getID();

    // When we get a message from a client
    ws.on('message', function(message){
        // Update internal data structure here
        let d = message.split(',')
        let key = d[0]
        let val = parseInt(d[1])
        data[key] = val
        // Broadcast data to everyone else on slider changes
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    })

})
