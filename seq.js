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

let blankEuclid = new Array(numInstruments)
    .fill(0);


let grid = {}
let params = {}
let clockMode = {}
let bpm = {};
let play = {}
let euclid = {};

let rooms = {};
let users = {}

const getRoom = id => users[id]

backend.on('connection', socket => {

    socket.on('roomJoin', (room) => {
        // Check if user is already in a room
        if (users[socket.id] !== room) {
            if (socket.id in users) {
                let prevRoom = getRoom(socket.id)
                socket.leave(prevRoom)
                rooms[prevRoom].numUsers -= 1
            }
            socket.join(room)
            // Now log their room in the users database
            users[socket.id] = room
    
            // Does this room already exist?
            if (rooms.hasOwnProperty(room)) {
                rooms[room].numUsers += 1
            } else { // No
                rooms[room] = {numUsers : 1}
                grid[room] = blankGrid.map(row => row.map(cell => Math.random() < 0.2))
                params[room] = parameters.base
                bpm[room] = 120
                play[room] = false
                euclid[room] = new Array(numInstruments).fill(new Array(numSteps).fill(0))
                clockMode[room] = "forward"
            }
            
            // Update this socket with the new data
            backend.to(room).emit('bpm', bpm[room]);
            backend.to(room).emit('play', play[room]);
            backend.to(room).emit('grid', grid[room]);
            backend.to(room).emit('clock::mode', clockMode[room]);
            backend.to(room).emit('params', params[room]);
            backend.to(room).emit('numUsers', rooms[room].numUsers)
            backend.to(room).emit('euclid', euclid[room])
        }
    })

    // When a user disconnects update the number of users
    socket.on('disconnect', (user) => {
        let room = getRoom(socket.id)
        socket.leave(room)
        delete users[socket.id]
        if (room !== undefined) {
            rooms[room].numUsers -= 1
            // if (rooms[room].numUsers <= 0) {
            //     delete rooms[room]
            //     delete grid[room]
            //     delete params[room]
            //     delete bpm[room]
            //     delete play[room]
            //     delete euclid[room]
            // }
        }
        console.log(rooms)
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

    socket.on('params::fm3', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].fm3[parameter] = data
        socket.to(room).emit('params::fm3::'+parameter, data)
    })    
    socket.on('params::fm4', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].fm4[parameter] = data
        socket.to(room).emit('params::fm4::'+parameter, data)
    })

    // Now respond to individual clients messages then broadcast changes to every other client
    // Update internal data too
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
        clockMode[room] = data;
        socket.to(room).emit('clock::mode', data);
    }); 

    socket.on('euclid', data => {
        let room = getRoom(socket.id)
        euclid[room] = data;
        socket.to(room).emit('euclid', data)
    })
})