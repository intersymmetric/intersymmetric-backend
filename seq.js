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
    socket.emit('sync', 0);
    socket.emit('play', play);
    socket.emit('grid', grid);
    socket.emit('chat', chat);
    socket.emit('clock::mode', clockMode);
    socket.emit('params', params);

    // KICK
    socket.on('params::kick', (parameter, data) => {
        params.kick[parameter] = data
        socket.broadcast.emit('params::kick::'+parameter, data)
    })

    // METAL 1
    socket.on('params::metalOne', (parameter, data) => {
        params.metalOne[parameter] = data
        socket.broadcast.emit('params::metalOne::'+parameter, data)
    })

    // METAL 2
    socket.on('params::metalTwo', (parameter, data) => {
        params.metalTwo[parameter] = data
        socket.broadcast.emit('params::metalTwo::'+parameter, data)
    })

    // LOW TOM
    socket.on('params::tomLow', (parameter, data) => {
        params.tomLow[parameter] = data
        socket.broadcast.emit('params::tomLow::'+parameter, data)
    })

    // HIGH TOM
    socket.on('params::tomHi', (parameter, data) => {
        params.tomHi[parameter] = data
        socket.broadcast.emit('params::tomHi::'+parameter, data)
    })

    // SNARE
    socket.on('params::snare', (parameter, data) => {
        params.snare[parameter] = data
        socket.broadcast.emit('params::snare::'+parameter, data)
    })

    // Now respond to individual clients messages then broadcast changes to every other client
    // Update internal data too
    socket.on('bpm', (e) => {
        bpm = e;
        socket.broadcast.emit('bpm', e);
    });
    socket.on('grid', (e) => {
        grid = e;
        socket.broadcast.emit('grid', e);
    });
    socket.on('play', (e) => {
        play = e;
        socket.broadcast.emit('play', e);
    });
    socket.on('sync', (e) => {
        socket.broadcast.emit('sync', e);
    });

    socket.on('clock::mode', (e) => {
        clockMode = e;
        socket.broadcast.emit('clock::mode', e);
    }); 
})
