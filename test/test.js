const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const assert = require('chai').assert;

let parameters = require('../parameters.js')

const port = 4300;

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
let enabledStates = {};
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

describe("Intersymmetric Testing", () => {
    let io, serverSocket, clientSocket;

    before((done) => {
        let httpServer = http.createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            clientSocket = new Client();
            io.on("connection", socket => {
                serverSocket = socket;
            })
            clientSocket.on("connect", done);
        })
    })

    after(() => {
        io.close();
        clientSocket.close();
    })
})

    // When a user disconnects update the number of users
    // socket.on('disconnect', (user) => {
    //     console.log(socket.id, 'left');
    //     let room = getRoom(socket.id);
    //     socket.leave(room);
    //     delete users[socket.id];
    //     if (room !== undefined) {
    //         rooms[room].numUsers -= 1
    //         backend.to(room).emit('numUsers', rooms[room].numUsers);
    //     };
    //     backend.emit('rooms', rooms); // send everyone the rooms
    // });

    // // KICK
    // socket.on('params::kick', (parameter, data) => {
    //     let room = getRoom(socket.id)
    //     params[room].kick[parameter] = data
    //     socket.to(room).emit('params::kick::'+parameter, data)
    // })

    // // METAL 1
    // socket.on('params::metal1', (parameter, data) => {
    //     let room = getRoom(socket.id)
    //     params[room].metal1[parameter] = data
    //     socket.to(room).emit('params::metal1::'+parameter, data)
    // })

    // // METAL 2
    // socket.on('params::metal2', (parameter, data) => {
    //     let room = getRoom(socket.id)
    //     params[room].metal2[parameter] = data
    //     socket.to(room).emit('params::metal2::'+parameter, data)
    // })

    // // SNARE
    // socket.on('params::snare', (parameter, data) => {
    //     let room = getRoom(socket.id)
    //     params[room].snare[parameter] = data
    //     socket.to(room).emit('params::snare::'+parameter, data)
    // })

    // socket.on('params::fm1', (parameter, data) => {
    //     let room = getRoom(socket.id)
    //     params[room].fm1[parameter] = data
    //     socket.to(room).emit('params::fm1::'+parameter, data)
    // })

    // socket.on('params::fm2', (parameter, data) => {
    //     let room = getRoom(socket.id)
    //     params[room].fm2[parameter] = data
    //     socket.to(room).emit('params::fm2::'+parameter, data)
    // })

    // socket.on('bpm', (data) => {
    //     let room = getRoom(socket.id)
    //     bpm[room] = data;
    //     socket.to(room).emit('bpm', data);
    // });
    // socket.on('grid', data => {
    //     let room = getRoom(socket.id)
    //     if (data !== null) {
    //         if (data.length === 6) {
    //             grid[room] = data;
    //             socket.to(room).emit('grid', data);
    //         }
    //     }
    // });
    // socket.on('play', (data) => {
    //     let room = getRoom(socket.id)
    //     play[room] = data
    //     socket.to(room).emit('play', data);
    // });

    // socket.on('clock::mode', (data) => {
    //     let room = getRoom(socket.id)
    //     clockMode[room] = data;
    //     socket.to(room).emit('clock::mode', data);
    // }); 

    // socket.on('clock::multiplier', data => {
    //     let room = getRoom(socket.id);
    //     clockMultiplier[room] = data;
    //     socket.to(room).emit('clock::multiplier', data);
    // })

    // socket.on('clock::offset', data => {
    //     let room = getRoom(socket.id);
    //     clockOffset[room] = data;
    //     socket.to(room).emit('clock::offset', data);
    // })

    // socket.on('euclid', data => {
    //     let room = getRoom(socket.id)
    //     euclid[room] = data;
    //     socket.to(room).emit('euclid', data)
    // })

    // socket.on('velocity', data => {
    //     let room = getRoom(socket.id);
    //     velocity[room] = data;
    //     socket.to(room).emit('velocity', data);
    // })

    // socket.on('length', data => {
    //     let room = getRoom(socket.id);
    //     length[room] = data;
    //     socket.to(room).emit('length', data);
    // })

    // // ADMIN CONTROLS
    // socket.on('enabledStates', states => {
    //     let room = getRoom(socket.id);
    //     enabledStates[room] = states;
    //     socket.to(room).emit('enabledStates', states)
    // })

    // socket.on('velocityList', (id, data) => {
    //     let room = getRoom(socket.id);
    //     socket.to(room).emit('velocityList', id, data);
    // })

    // socket.on('maxCells', data => {
    //     let room = getRoom(socket.id);
    //     maxCells[room] = data;
    //     socket.to(room).emit('maxCells', data);
    // })

    // socket.on('prevInsertions', data => {
    //     let room = getRoom(socket.id);
    //     prevInsertions[room] = data;
    //     socket.to(room).emit('prevInsertions', data);
    // })

    // socket.on('mirrorPoint', data => {
    //     let room = getRoom(socket.id);
    //     mirrorPoint[room] = data;
    //     socket.to(room).emit('mirrorPoint', data);
    // })

    // socket.on('pitchOffset', data => {
    //     let room = getRoom(socket.id);
    //     pitchOffset[room] = data;
    //     socket.to(room).emit('pitchOffset', data)
    // })

    // socket.on('sampleSelectors', data => {
    //     let room = getRoom(socket.id);
    //     sampleSelectors[room] = data;
    //     socket.to(room).emit('sampleSelectors', data);
    // })

    // socket.on('trackGains', data => {
    //     let room = getRoom(socket.id);
    //     trackGains[room] = data;
    //     socket.to(room).emit('trackGains', data);
    // })

    // socket.on('trackRates', data => {
    //     let room = getRoom(socket.id);
    //     trackRates[room] = data;
    //     socket.to(room).emit('trackRates', data);
    // })

    // socket.on('trackLengths', data => {
    //     let room = getRoom(socket.id);
    //     trackLengths[room] = data;
    //     socket.to(room).emit('trackLengths', data);
    // })

    // // No Bounds Meta Data
    // socket.on('trackPitch', data => {
    //     let room = getRoom(socket.id);
    //     trackPitch[room] = data;
    //     socket.to(room).emit('trackPitch', data);
    // })

    // socket.on('trackShape', data => {
    //     let room = getRoom(socket.id);
    //     trackShape[room] = data;
    //     socket.to(room).emit('trackShape', data);
    // });

    // socket.on('trackSound', data => {
    //     let room = getRoom(socket.id);
    //     trackSound[room] = data;
    //     socket.to(room).emit('trackSound', data);
    // });

    // socket.on('playbackRate', data => {
    //     let room = getRoom(socket.id);
    //     playbackRate[room] = data;
    //     socket.to(room).emit('playbackRate', data);
    // });

    // socket.on('velocityPattern', data => {
    //     let room = getRoom(socket.id);
    //     velocityPattern[room] = data;
    //     socket.to(room).emit('velocityPattern', data);
    // });

    // socket.on('userMessage', data => {
    //     let room = getRoom(socket.id);
    //     userMessage[room] = data;
    //     socket.to(room).emit('userMessage', data);
    // });
