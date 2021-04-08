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

let backend = io(server, {
		cors: {
			origin: true, 
			methods: ['GET', 'PATCH', 'PUT', 'POST']
		}
	}
);

const numInstruments = 6;
const numSteps = 16;

let blankGrid = new Array(numInstruments)
    .fill(
        new Array(numSteps)
            .fill(false)
    );

let grid = {}
let params = {}
let clock = {}
let bpm = {};
let play = {}
let euclid = {};
let velocity = {};
let length = {};
let rooms = {};
let users = {};
let enabledStates = {};

const getRoom = id => users[id] // get room that user belongs to

backend.on('connection', socket => {
    console.log(socket.id, 'connected');
    backend.emit('rooms', rooms); // send everyone the rooms
    socket.on('roomJoin', (room) => {
        console.log(socket.id, 'created '   + room)
        if (users[socket.id] !== room) { // Check if user is already in a room
            if (socket.id in users) {
                let prevRoom = getRoom(socket.id)
                socket.leave(prevRoom)
                rooms[prevRoom].numUsers -= 1
            }
            socket.join(room)
            users[socket.id] = room // Now log their room in the users database
    
            // Does this room already exist?
            if (rooms.hasOwnProperty(room)) {
                rooms[room].numUsers += 1
            } else { // No
                rooms[room] = {numUsers : 1}
                grid[room] = blankGrid.map(row => row.map(cell => Math.random() < 0.2))
                params[room] = parameters.base
                bpm[room] = 120
                play[room] = false
                euclid[room] = [0, 0, 0, 0, 0, 0]
                clock[room] = {
                    mode : 'forward', 
                    multiplier: 0, 
                    offset : {
                        start : 1,
                        end : 16
                    }
                }
                velocity[room] = 1.0
                length[room] = 0.1
                enabledStates[room] = {
                    grid: true,
                    bpm: true,
                    euclid: true,
                    offset: true,
                    globalVelocity: true,
                    globalLength: true,
                    multiplier: true,
                    transforms: true
                }
            }
            
            // Update this socket with the new data
            backend.to(room).emit('bpm', bpm[room]);
            backend.to(room).emit('play', play[room]);
            backend.to(room).emit('grid', grid[room]);
            backend.to(room).emit('clock::mode', clock[room].mode);
            backend.to(room).emit('clock::multiplier', clock[room].multiplier);
            backend.to(room).emit('clock::offset', clock[room].offset);
            backend.to(room).emit('params', params[room]);
            backend.to(room).emit('numUsers', rooms[room].numUsers);
            backend.to(room).emit('euclid', euclid[room]);
            backend.to(room).emit('velocity', velocity[room])
            backend.to(room).emit('length', length[room])
            backend.to(room).emit('enabledStates', enabledStates[room])
            backend.emit('rooms', rooms); // send everyone the rooms
        }
    })

    // When a user disconnects update the number of users
    socket.on('disconnect', (user) => {
        console.log(socket.id, 'left')
        let room = getRoom(socket.id)
        socket.leave(room)
        delete users[socket.id]
        if (room !== undefined) {
            rooms[room].numUsers -= 1
        }
        backend.emit('rooms', rooms); // send everyone the rooms
    });

    // KICK
    socket.on('params::kick', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].kick[parameter] = data
        socket.to(room).emit('params::kick::'+parameter, data)
    })

    // METAL 1
    socket.on('params::metal1', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].metal1[parameter] = data
        socket.to(room).emit('params::metal1::'+parameter, data)
    })

    // METAL 2
    socket.on('params::metal2', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].metal2[parameter] = data
        socket.to(room).emit('params::metal2::'+parameter, data)
    })

    // SNARE
    socket.on('params::snare', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].snare[parameter] = data
        socket.to(room).emit('params::snare::'+parameter, data)
    })

    socket.on('params::fm1', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].fm1[parameter] = data
        socket.to(room).emit('params::fm1::'+parameter, data)
    })

    socket.on('params::fm2', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].fm2[parameter] = data
        socket.to(room).emit('params::fm2::'+parameter, data)
    })

    socket.on('bpm', (data) => {
        let room = getRoom(socket.id)
        bpm[room] = data;
        socket.to(room).emit('bpm', data);
    });
    socket.on('grid', (data) => {
        let room = getRoom(socket.id)
        grid[room] = data;
        socket.to(room).emit('grid', data);
    });
    socket.on('play', (data) => {
        let room = getRoom(socket.id)
        play[room] = data
        socket.to(room).emit('play', data);
    });

    socket.on('clock::mode', (data) => {
        let room = getRoom(socket.id)
        clock[room].mode = data;
        socket.to(room).emit('clock::mode', data);
    }); 

    socket.on('clock::multiplier', data => {
        let room = getRoom(socket.id);
        clock[room].multiplier = data;
        socket.to(room).emit('clock::multiplier', data);
    })

    socket.on('clock::offset', data => {
        let room = getRoom(socket.id);
        clock[room].offset = data;
        socket.to(room).emit('clock::offset', data);
    })

    socket.on('euclid', data => {
        let room = getRoom(socket.id)
        euclid[room] = data;
        socket.to(room).emit('euclid', data)
    })

    socket.on('velocity', data => {
        let room = getRoom(socket.id);
        velocity[room] = data;
        socket.to(room).emit('velocity', data);
    })

    socket.on('length', data => {
        let room = getRoom(socket.id);
        length[room] = data;
        socket.to(room).emit('length', data);
    })

    // ADMIN CONTROLS
    socket.on('enabledStates', states => {
        let room = getRoom(socket.id);
        enabledStates[room] = states;
        socket.to(room).emit('enabledStates', states)
    })
})
