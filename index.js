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
    let privateKey = fs.readFileSync('/etc/letsencrypt/live/api.intersymmetric.xyz/privkey.pem', 'utf8');
    let certificate = fs.readFileSync('/etc/letsencrypt/live/api.intersymmetric.xyz/fullchain.pem', 'utf8');
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
			origin: '*',
			methods: ['GET', 'POST']
		}
	}
);
console.log('Created backend')

const numInstruments = 6;
const numSteps = 16;

let blankGrid = new Array(numInstruments)
    .fill(
        new Array(numSteps)
            .fill(false)
    );

let grid = {}
let params = {}
let clockMode = {};
let clockMultiplier = {};
let clockOffset = {};
let bpm = {};
let play = {}
let euclid = {};
let velocity = {};
let length = {};
let rooms = {};
let users = {};
let pitchOffset = {};
let maxCells = {};
let prevInsertions = {};
let mirrorPoint = {};
let userMessage = {};

// Sample Stuff
let sampleSelectors = {};
let trackGains = {};
let trackRates = {};
let trackLengths = {};
let playbackRate = {};

// No Bounds stuff
let trackPitch = {};
let trackSound = {};
let trackShape = {};
let velocityPattern = {};

const getRoom = id => users[id] // get room that user belongs to

backend.on('connection', socket => {
    backend.emit('rooms', rooms); // send everyone the rooms
    socket.on('roomJoin', room => {
        console.log(socket.id.slice(0, 5), 'created '+ room)
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
                rooms[room] = {numUsers : 1};
                grid[room] = blankGrid.map(row => row.map(cell => false));
                params[room] = JSON.parse(JSON.stringify(parameters.base));
                mirrorPoint[room] = 8;
                pitchOffset[room] = 0;
                bpm[room] = 120;
                play[room] = false;
                euclid[room] = [0, 0, 0, 0, 0, 0];
                clockMode[room] = 'forward';
                clockMultiplier[room] = 0;
                clockOffset[room] = {
                	start: 1,
                	end: 16
                };
                velocity[room] = 1.0;
                length[room] = 1.0;
                maxCells[room] = 32,
                prevInsertions[room] = [];
                sampleSelectors[room] = [0, 1, 2, 3, 4, 5].map(sample => 0);
                trackGains[room] = new Array(6).fill(1.0);
                trackRates[room] = new Array(6).fill(1.0);
                trackLengths[room] = new Array(6).fill(3.0);
                trackPitch[room] = new Array(6).fill(0.0);
                trackSound[room] = new Array(6).fill(0.5);
                trackShape[room] = new Array(6).fill(1.0);
                playbackRate[room] = 1.0;
                velocityPattern[room] = 0;
                userMessage[room] = '';
            }
            
            // Update this socket with the new data
            backend.to(room).emit('bpm', bpm[room]);
            backend.to(room).emit('play', play[room]);
            backend.to(room).emit('grid', grid[room]);
            backend.to(room).emit('clock::mode', clockMode[room]);
            backend.to(room).emit('clock::multiplier', clockMultiplier[room]);
            backend.to(room).emit('clock::offset', clockOffset[room]);
            backend.to(room).emit('params', params[room]);
            backend.to(room).emit('numUsers', rooms[room].numUsers);
            backend.to(room).emit('euclid', euclid[room]);
            backend.to(room).emit('velocity', velocity[room]);
            backend.to(room).emit('length', length[room]);
            backend.to(room).emit('maxCells', maxCells[room]);
            backend.to(room).emit('prevInsertions', prevInsertions[room]);
            backend.to(room).emit('pitchOffset', pitchOffset[room]);
            backend.to(room).emit('sampleSelectors', sampleSelectors[room]);
            backend.to(room).emit('trackGains', trackGains[room]);
            backend.to(room).emit('trackRates', trackRates[room]);
            backend.to(room).emit('trackShape', trackShape[room]);
            backend.to(room).emit('trackSound', trackSound[room]);
            backend.to(room).emit('trackPitch', trackPitch[room]);
            backend.to(room).emit('velocityPattern', velocityPattern[room]);
            backend.to(room).emit('playbackRate', playbackRate[room])
            backend.to(room).emit('userMessage', userMessage[room]);
            backend.emit('rooms', rooms); // send everyone the rooms
        }
    })

    // When a user disconnects update the number of users
    socket.on('disconnect', (user) => {
        console.log(socket.id, 'left');
        let room = getRoom(socket.id);
        socket.leave(room);
        delete users[socket.id];
        if (room !== undefined) {
            rooms[room].numUsers -= 1
            backend.to(room).emit('numUsers', rooms[room].numUsers);
        };
        backend.emit('rooms', rooms); // send everyone the rooms
    });

    // KICK
    socket.on('params::kick', (parameter, data) => {
        let room = getRoom(socket.id)
        params[room].kick[parameter] = data
        socket.to(room).emit('params::kick::'+parameter, data)
    })

    socket.on('pattern', (instrument, parameter, pattern) => {
        let room = getRoom(socket.id);
        socket.to(room).emit('pattern', instrument, parameter, pattern);
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
    socket.on('grid', data => {
        let room = getRoom(socket.id)
        if (data !== null) {
            if (data.length === 6) {
                grid[room] = data;
                socket.to(room).emit('grid', data);
            }
        }
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

    socket.on('clock::multiplier', data => {
        let room = getRoom(socket.id);
        clockMultiplier[room] = data;
        socket.to(room).emit('clock::multiplier', data);
    })

    socket.on('clock::offset', data => {
        let room = getRoom(socket.id);
        clockOffset[room] = data;
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

    socket.on('velocityList', (id, data) => {
        let room = getRoom(socket.id);
        socket.to(room).emit('velocityList', id, data);
    })

    socket.on('maxCells', data => {
        let room = getRoom(socket.id);
        maxCells[room] = data;
        socket.to(room).emit('maxCells', data);
    })

    socket.on('prevInsertions', data => {
        let room = getRoom(socket.id);
        prevInsertions[room] = data;
        socket.to(room).emit('prevInsertions', data);
    })

    socket.on('mirrorPoint', data => {
        let room = getRoom(socket.id);
        mirrorPoint[room] = data;
        socket.to(room).emit('mirrorPoint', data);
    })

    socket.on('pitchOffset', data => {
        let room = getRoom(socket.id);
        pitchOffset[room] = data;
        socket.to(room).emit('pitchOffset', data)
    })

    socket.on('sampleSelectors', data => {
        let room = getRoom(socket.id);
        sampleSelectors[room] = data;
        socket.to(room).emit('sampleSelectors', data);
    })

    socket.on('trackGains', data => {
        let room = getRoom(socket.id);
        trackGains[room] = data;
        socket.to(room).emit('trackGains', data);
    })

    socket.on('trackRates', data => {
        let room = getRoom(socket.id);
        trackRates[room] = data;
        socket.to(room).emit('trackRates', data);
    })

    socket.on('trackLengths', data => {
        let room = getRoom(socket.id);
        trackLengths[room] = data;
        socket.to(room).emit('trackLengths', data);
    })

    // No Bounds Meta Data
    socket.on('trackPitch', data => {
        let room = getRoom(socket.id);
        trackPitch[room] = data;
        socket.to(room).emit('trackPitch', data);
    })

    socket.on('trackShape', data => {
        let room = getRoom(socket.id);
        trackShape[room] = data;
        socket.to(room).emit('trackShape', data);
    });

    socket.on('trackSound', data => {
        let room = getRoom(socket.id);
        trackSound[room] = data;
        socket.to(room).emit('trackSound', data);
    });

    socket.on('playbackRate', data => {
        let room = getRoom(socket.id);
        playbackRate[room] = data;
        socket.to(room).emit('playbackRate', data);
    });

    socket.on('velocityPattern', data => {
        let room = getRoom(socket.id);
        velocityPattern[room] = data;
        socket.to(room).emit('velocityPattern', data);
    });

    socket.on('userMessage', data => {
        let room = getRoom(socket.id);
        userMessage[room] = data;
        socket.to(room).emit('userMessage', data);
    });

    socket.on('send', (instrument, parameters) => {
        let room = getRoom(socket.id);
        socket.to(room).emit('send', instrument, parameters)
    })
})
