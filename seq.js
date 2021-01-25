const fs = require('fs');
const http = require('http')
const https = require('https');
const io = require('socket.io')

const port = 4300;
const env = process.argv[2]

let server;

if (env == 'live') {
    // Cert for SSL
    // This is called in production to make a live server
    let privateKey = fs.readFileSync('ssl-cert/privkey.pem', 'utf8');
    let certificate = fs.readFileSync('ssl-cert/fullchain.pem', 'utf8');
    let credentials = {key : privateKey, cert: certificate}
    server = https.createServer(credentials).listen(port);
    console.log('Booting SSL/HTTPS Server')

} else {
    // This is called in local production where we just need a http server
    server = http.createServer().listen(port);
    console.log('Booting HTTP Server')
}

let backend = io(server, {cors: {origin: "*"}});

let numUsers = 0;

let grid = [
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false},
    {state: false, emph: false}
]

let play = false;
let bpm = 120;

backend.on('connection', (socket) => {
	
    numUsers += 1
    backend.sockets.emit('numUsers', numUsers);

    // When a user disconnects update the number of users

    socket.on('disconnect', (user) => {
        numUsers += -1
        backend.sockets.emit('numUsers', numUsers)
    })

    // update each user with the current data
    socket.emit('bpm', bpm);
    socket.emit('play', play);
    socket.emit('grid', grid);

    // Now respond to individual clients messages
    socket.on('bpm', (e) => {socket.broadcast.emit('bpm', e)});
    socket.on('grid', (e) => {socket.broadcast.emit('grid', e)});
    socket.on('play', (e) => {socket.broadcast.emit('play', e)});
    
})
