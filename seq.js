const fs = require('fs');
const http = require('http');
const https = require('https');
const io = require('socket.io');
// DB
const PouchDB = require('pouchdb');
let helper = require('./helper.js')
let db = new PouchDB('db', {revs_limit: 0, auto_compaction: true});

const port = 4300;
const env = process.argv[2];
let server;

if (env == 'live') {
    // Cert for SSL
    // This is called in production to make a live server
    let privateKey = fs.readFileSync('/etc/letsencrypt/live/interbackend.xyz/privkey.pem', 'utf8');
    let certificate = fs.readFileSync('/etc/letsencrypt/live/interbackend.xyz/fullchain.pem', 'utf8');
    let credentials = {key : privateKey, cert: certificate}
    server = https.createServer(credentials).listen(port);
    console.log('Booting SSL/HTTPS Server')

} else {
    // This is called in local production where we just need a http server
    server = http.createServer().listen(port);
    console.log('Booting HTTP Server')
};
const serverOpts = {cors: {
    origin: '*',
    methods: ['GET', 'POST']
}}
let backend = io(server, serverOpts);

async function getRoom() {

}

users = {}
rooms = {}

// process.exit()
backend.on('connection', socket => {
    socket.on('roomJoin', async room => {

        if (users[socket.id] !== room && users[socket.id] !== undefined) {
            socket.leave(users[socket.id]);
        }
        users[socket.id] = room
        socket.join(room)


        let r; // r is a room
        db.get(room).then(doc => {
            r = doc;
        }).catch(err => {
            if (err.reason === 'missing') {
                r = helper.createNewRoom(room)
                return db.put(r)
            }
        }).then(() => {
            // Update this socket with the n ew data
            backend.to(room).emit('bpm', r.bpm);
            backend.to(room).emit('play', r.play); 
            backend.to(room).emit('grid', r.grid);
            backend.to(room).emit('clock::mode', r.clock.mode);
            backend.to(room).emit('clock::multiplier', r.clock.multiplier);
            backend.to(room).emit('clock::offset', r.clock.offset);
            backend.to(room).emit('params', r.params);
            backend.to(room).emit('numUsers', r.numUsers);
            backend.to(room).emit('euclid', r.euclid);
            backend.to(room).emit('length', r.length);
            backend.to(room).emit('enabledStates', r.enabledStates);
            backend.to(room).emit('maxCells', r.maxCells);
            backend.to(room).emit('prevInsertions', r.prevInsertions);
            backend.to(room).emit('pitchOffset', r.pitchOffset);
            backend.to(room).emit('sampleSelectors', r.sampleSelectors);
            backend.to(room).emit('trackGains', r.trackGains);
            backend.to(room).emit('trackRates', r.trackRates);
            backend.to(room).emit('trackShape', r.trackShape);
            backend.to(room).emit('trackSound', r.trackSound);
            backend.to(room).emit('trackPitch', r.trackPitch);
            backend.to(room).emit('velocityPattern', r.velocityPattern);
            backend.to(room).emit('playbackRate', r.playbackRate)
            backend.to(room).emit('userMessage', r.userMessage);
        })
    })

    // When a user disconnects update the number of users
    socket.on('disconnect', user => {
        console.log(socket.id, 'left');
        socket.leave(users[socket.id]);
        delete users[socket.id];
        // if (room !== undefined) {
        //     rooms[room].numUsers -= 1
        //     backend.to(room).emit('numUsers', rooms[room].numUsers);
        // };
        // backend.emit('rooms', rooms); // send everyone the rooms
    });

    // KICK
    socket.on('params::kick', (parameter, data) => {
        let room = users[socket.id];
        socket.to(room).emit('params::kick::'+parameter, data)

        db.get(room).then(doc => {
            doc.params.kick[parameter] = data;
            return db.put(doc)
        }).catch(err => console.log(err))
    })

    // METAL 1
    socket.on('params::metal1', (parameter, data) => {
        let room = users[socket.id];
        socket.to(room).emit('params::metal1::'+parameter, data)

        db.get(room).then(doc => {
            doc.params.metal1[parameter] = data;
            return db.put(doc)
        }).catch(err => console.log(err))
    })

    socket.on('params::metal2', (parameter, data) => {
        let room = users[socket.id];
        socket.to(room).emit('params::metal2::'+parameter, data)

        db.get(room).then(doc => {
            doc.params.metal2[parameter] = data;
            return db.put(doc)
        }).catch(err => console.log(err))
    });

    socket.on('params::snare', (parameter, data) => {
        let room = users[socket.id];
        socket.to(room).emit('params::snare::'+parameter, data)

        db.get(room).then(doc => {
            doc.params.snare[parameter] = data;
            return db.put(doc)
        }).catch(err => console.log(err))
    });

    socket.on('params::fm1', (parameter, data) => {
        let room = users[socket.id];
        socket.to(room).emit('params::fm1::'+parameter, data)

        db.get(room).then(doc => {
            doc.params.fm1[parameter] = data;
            return db.put(doc)
        }).catch(err => console.log(err))
    });

    socket.on('params::fm2', (parameter, data) => {
        let room = users[socket.id];
        socket.to(room).emit('params::fm2::'+parameter, data)

        db.get(room).then(doc => {
            doc.params.fm1[parameter] = data;
            return db.put(doc)
        }).catch(err => console.log(err))
    });

    socket.on('bpm', data => {
        let room = users[socket.id];
        socket.to(room).emit('bpm', data);

        db.get(room).then(doc => {
            doc.bpm = data;
            return db.put(doc)
        }).catch(err => console.log(err))
    });

    socket.on('grid', data => {
        let room = users[socket.id];
        if (data !== null && data.length === 6) {
            db.get(room).then(doc => {
                doc.grid = data;
                return db.put(doc)
            }).catch(err => console.log(err))
        } 
        socket.to(room).emit('grid', data);
    }); 

    // socket.on('play', (data) => {
    //     let room = getRoom(socket.id)
    //     play[room] = data
    //     socket.to(room).emit('play', data);
    // });

    // socket.on('clock::mode', (data) => {
    //     let room = getRoom(socket.id)
    //     clock[room].mode = data;
    //     socket.to(room).emit('clock::mode', data);
    // }); 

    // socket.on('clock::multiplier', data => {
    //     let room = getRoom(socket.id);
    //     clock[room].multiplier = data;
    //     socket.to(room).emit('clock::multiplier', data);
    // })

    // socket.on('clock::offset', data => {
    //     let room = getRoom(socket.id);
    //     clock[room].offset = data;
    //     socket.to(room).emit('clock::offset', data);
    // })

    // socket.on('euclid', data => {
    //     let room = getRoom(socket.id)
    //     euclid[room] = data;
    //     socket.to(room).emit('euclid', data)
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
})
