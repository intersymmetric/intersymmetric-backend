// https://stackoverflow.com/questions/13364243/websocketserver-node-js-how-to-differentiate-clients
let fs = require('fs');
let http = require('http')
let https = require('https');
const WebSocket = require('ws');



const env = process.argv[2]
let server;

if (env == 'live') {
    // Cert for SSL
    // This is called in production to make a live server
    let privateKey = fs.readFileSync('ssl-cert/privkey.pem', 'utf8');
    let certificate = fs.readFileSync('ssl-cert/fullchain.pem', 'utf8');
    let credentials = {key : privateKey, cert: certificate}
    server = https.createServer(credentials).listen(8080);
    console.log('Booting SSL/HTTPS Server')

} else {
    // This is called in local production where we just need a http server
    server = http.createServer().listen(8080);
    console.log('Booting HTTP Server')
}

const wss = new WebSocket.Server({server: server})

let grid = {
    id: 'grid',
    value: [
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false}
]}

let numSteps = {
    id: 'numSteps',
    value: 9
}

let play = {
    id: 'play',
    value : false
}

let bpm = {
    id: 'bpm',
    value: 120
}

let users = {
    id: 'users',
    connections : 0
}

// Unique IDs for each connection
const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

wss.getID = () => {
    return s4() + s4() + '-' + s4();
}

wss.on('connection', (ws) => {
    users.connections = wss.clients.size;
    // Update every user about the new connection
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(users))
        }
    })
    ws.send(JSON.stringify(data)); // on connection immediately update
    ws.id = wss.getID();

    //make this shit update the number of users when they close

    // When we get a message from a client
    ws.on('message', (message) => {
        // Update internal data structure here
        console.log(message);
        // client.send(JSON.stringify(grid));
        // client.send(JSON.stringify(numSteps));
        // client.send(JSON.stringify(play));
        // client.send(JSON.stringify(numSteps));
        // client.send(JSON.stringify(bpm));
        // let d = message.split(/,/)
        // let key = d.shift()
        // let val = d.join(',')
        // data[key] = JSON.parse(val)
        // // Broadcast data to everyone else on slider changes
        // wss.clients.forEach((client) => {
        //     if (client !== ws && client.readyState === WebSocket.OPEN) {
        //         client.send(JSON.stringify(data));
        //     }
        // });
    })
})
