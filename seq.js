const fs = require('fs');
const http = require('http');
const https = require('https');
const io = require('socket.io');
let parameters = require('./parameters.js')

const port = 4300;
const env = process.argv[2];

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
};

let backend = io(server, 
	{
		cors: {
			origin: true, 
			methods: ['GET', 'PATCH', 'PUT', 'POST']
		}
	}
);
let numUsers = 0;

let chat = [];

const numInstruments = 6;
const numSteps = 16;

// Grid
let grid = []; // 4 instruments

for (let i=0; i < numInstruments; i++) {
    grid.push([]);
    for (let j=0; j < numSteps; j++) {
        grid[i].push(
            Math.random() > 0.5
        );
    }
}

let play = false;
let bpm = 120;
let clockMode = "forward";
let params = parameters.base;


backend.on('connection', (socket) => {
    numUsers += 1;
    backend.sockets.emit('numUsers', numUsers);

    // When a user disconnects update the number of users
    socket.on('disconnect', (user) => {
        numUsers -= 1;
        backend.sockets.emit('numUsers', numUsers);
    });

    // update each user with the current data
    socket.emit('bpm', bpm);
    socket.emit('play', play);
    socket.emit('grid', grid);
    socket.emit('chat', chat)

    // Now respond to individual clients messages
    // Broadcast changes to every other client
    // Update internal data
    socket.on('bpm', (e) => {
        socket.broadcast.emit('bpm', e);
        bpm = e;
    });
    socket.on('grid', (e) => {
        socket.broadcast.emit('grid', e);
        grid = e;
    });
    socket.on('play', (e) => {
        socket.broadcast.emit('play', e);
        play = e;
    });
    socket.on('sync', (e) => {
        socket.broadcast.emit('sync', e);
    });

    socket.on('chat', (e) => {
        if (chat.length >= 10) {
            chat = chat.slice(1, 10);
        }
        chat.push(socket.id.slice(0, 3) + ': ' + e);
        backend.sockets.emit('chat', chat);
    })
    
})
