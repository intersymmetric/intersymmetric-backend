const fs = require('fs');
const http = require('http');
const https = require('https');
const io = require('socket.io');

const port = 49123;
const env = process.argv[2];

let server;
const certStorage = '/root/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/'
const certApplication = 'aaa.intersymmetric.xyz/'

if (env == 'live') {
    const privateKey = fs.readFileSync(certStorage + certApplication + 'aaa.intersymmetric.xyz.key', 'utf8');
    const certificate = fs.readFileSync(certStorage + certApplication + 'aaa.intersymmetric.xyz.crt', 'utf8');
    const credentials = {key : privateKey, cert: certificate}
    server = https.createServer(credentials).listen(port);
    console.log('Booting SSL/HTTPS Server')
} else {
    server = http.createServer().listen(port);
    console.log('Booting HTTP Server')
};

const backend = io(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST']
		}
    }
);
console.log('Created Backend')

const get_room = id => users[id] // get room that user belongs to

// State
let users = {};
let rooms = {};

let speed = {};

let fm1_listener = {};
let fm2_listener = {};
let perc_listener = {};

// Modes/Direction
let a_mode = {}, 
    b_mode = {},
    c_mode = {};

// Duration/Pattern
let a_steps_0 = {},
    a_steps_1 = {},
    a_steps_2 = {},
    b_steps_0 = {},
    b_steps_1 = {},
    b_steps_2 = {},
    c_steps_0 = {},
    c_steps_1 = {},
    c_steps_2 = {};

// Synth Interface
let fm1_freq_preset = {};
let fm1_mod_preset = {};
let fm1_shape_preset = {};
let fm2_freq_preset = {};
let fm2_mod_preset = {};
let fm2_shape_preset = {};
let perc_sound_preset = {};
let perc_transpose_preset = {};
let perc_shape_preset = {};

backend.on('connection', socket => {
    socket.on('join_room', room => {
        if (users[socket.id] !== room) { // Check if user is already in a room
            if (socket.id in users) {
                const prev_room = get_room(socket.id);
                socket.leave(prev_room);
                rooms[prev_room].num_users -= 1;
            }
            socket.join(room)
            users[socket.id] = room // Now log their room in the users database
    
            // Does this room already exist?
            if (rooms.hasOwnProperty(room)) {
                rooms[room].num_users += 1
            } else {
                rooms[room] = { num_users : 1 };
                speed[room] = 3;
                fm1_listener[room] = 0;
                fm2_listener[room] = 0;
                perc_listener[room] = 0;
                a_mode[room] = 0;
                b_mode[room] = 0;
                c_mode[room] = 0;
                a_steps_0[room] = 5;
                a_steps_1[room] = 2;
                a_steps_2[room] = 3;
                b_steps_0[room] = 4;
                b_steps_1[room] = 4;
                b_steps_2[room] = 4;
                c_steps_0[room] = 2;
                c_steps_1[room] = 4;
                c_steps_2[room] = 8;
                fm1_freq_preset[room] = 0;
                fm1_mod_preset[room] = 0;
                fm1_shape_preset[room] = 0;
                fm2_freq_preset[room] = 0;
                fm2_mod_preset[room] = 0;
                fm2_shape_preset[room] = 0;
                perc_sound_preset[room] = 0;
                perc_transpose_preset[room] = 0
                perc_shape_preset[room] = 0;
            }

            backend.to(room).emit('speed', speed[room]);
            backend.to(room).emit('fm1_listener', fm1_listener[room]);
            backend.to(room).emit('fm2_listener', fm2_listener[room]);
            backend.to(room).emit('perc_listener', perc_listener[room]);
            backend.to(room).emit('a_mode', a_mode[room]);
            backend.to(room).emit('b_mode', b_mode[room]);
            backend.to(room).emit('c_mode', c_mode[room]);
            backend.to(room).emit('a_steps_0', a_steps_0[room]);
            backend.to(room).emit('a_steps_1', a_steps_1[room]);
            backend.to(room).emit('a_steps_2', a_steps_2[room]);
            backend.to(room).emit('b_steps_0', b_steps_0[room]);
            backend.to(room).emit('b_steps_1', b_steps_1[room]);
            backend.to(room).emit('b_steps_2', b_steps_2[room]);
            backend.to(room).emit('c_steps_0', c_steps_0[room]);
            backend.to(room).emit('c_steps_1', c_steps_1[room]);
            backend.to(room).emit('c_steps_2', c_steps_2[room]);
            backend.to(room).emit('fm1_freq_preset', fm1_freq_preset[room]);
            backend.to(room).emit('fm1_mod_preset', fm1_mod_preset[room]);
            backend.to(room).emit('fm1_shape_preset', fm1_shape_preset[room]);
            backend.to(room).emit('fm2_freq_preset', fm2_freq_preset[room]);
            backend.to(room).emit('fm2_mod_preset', fm2_mod_preset[room]);
            backend.to(room).emit('fm2_shape_preset', fm2_shape_preset[room]);
            backend.to(room).emit('perc_sound_preset', perc_sound_preset[room]);
            backend.to(room).emit('perc_transpose_preset', perc_transpose_preset[room]);
            backend.to(room).emit('perc_shape_preset', perc_shape_preset[room]);
            backend.to(room).emit('num_users', rooms[room].num_users);
        }
    })

    // When a user disconnects update the number of users
    socket.on('disconnect', (user) => {
        console.log(socket.id, 'left');
        let room = get_room(socket.id);
        socket.leave(room);
        delete users[socket.id];
        if (room) {
            rooms[room].num_users -= 1
            backend.to(room).emit('num_users', rooms[room].num_users);
        };
    });

    socket.on('speed', data => {
        let room = get_room(socket.id);
        speed[room] = data;
        socket.to(room).emit('speed', data)
    });

    socket.on('fm1_listener', data => {
        let room = get_room(socket.id);
        fm1_listener[room] = data;
        socket.to(room).emit('fm1_listener', data)
    });

    socket.on('fm2_listener', data => {
        let room = get_room(socket.id);
        fm2_listener[room] = data;
        socket.to(room).emit('fm2_listener', data)
    });

    socket.on('perc_listener', data => {
        let room = get_room(socket.id);
        perc_listener[room] = data;
        socket.to(room).emit('perc_listener', data)
    });

    socket.on('a_mode', data => {
        let room = get_room(socket.id);
        a_mode[room] = data;
        socket.to(room).emit('a_mode', data)
    });

    socket.on('b_mode', data => {
        let room = get_room(socket.id);
        b_mode[room] = data;
        socket.to(room).emit('b_mode', data)
    });

    socket.on('c_mode', data => {
        let room = get_room(socket.id);
        c_mode[room] = data;
        socket.to(room).emit('c_mode', data)
    });

    socket.on('a_steps_0', data => {
        let room = get_room(socket.id);
        a_steps_0[room] = data;
        socket.to(room).emit('a_steps_0', data)
    });

    socket.on('a_steps_1', data => {
        let room = get_room(socket.id);
        a_steps_1[room] = data;
        socket.to(room).emit('a_steps_1', data)
    });

    socket.on('a_steps_2', data => {
        let room = get_room(socket.id);
        a_steps_2[room] = data;
        socket.to(room).emit('a_steps_2', data)
    });

    socket.on('b_steps_0', data => {
        let room = get_room(socket.id);
        b_steps_0[room] = data;
        socket.to(room).emit('b_steps_0', data)
    });

    socket.on('b_steps_1', data => {
        let room = get_room(socket.id);
        b_steps_1[room] = data;
        socket.to(room).emit('b_steps_1', data)
    });

    socket.on('b_steps_2', data => {
        let room = get_room(socket.id);
        b_steps_2[room] = data;
        socket.to(room).emit('b_steps_2', data)
    });

    socket.on('c_steps_0', data => {
        let room = get_room(socket.id);
        c_steps_0[room] = data;
        socket.to(room).emit('c_steps_0', data)
    });

    socket.on('c_steps_1', data => {
        let room = get_room(socket.id);
        c_steps_1[room] = data;
        socket.to(room).emit('c_steps_1', data)
    });

    socket.on('c_steps_2', data => {
        let room = get_room(socket.id);
        c_steps_2[room] = data;
        socket.to(room).emit('c_steps_2', data)
    });

    socket.on('fm1_freq_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            fm1_freq_preset[room] = data;
            socket.to(room).emit('fm1_freq_preset', data)
        } else {
            console.log('fm1_freq_preset', data)
        }
    });

    socket.on('fm1_mod_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            fm1_mod_preset[room] = data;
            socket.to(room).emit('fm1_mod_preset', data)
        } else {
            console.log('fm1_mod_preset', data)
        }
    });

    socket.on('fm1_shape_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            fm1_shape_preset[room] = data;
            socket.to(room).emit('fm1_shape_preset', data)
        } else {
            console.log('fm1_shape_preset', data)
        }
    });

    socket.on('fm2_freq_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            fm2_freq_preset[room] = data;
            socket.to(room).emit('fm2_freq_preset', data)
        } else {
            console.log('fm2_freq_preset', data)
        }
    });

    socket.on('fm2_mod_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            fm2_mod_preset[room] = data;
            socket.to(room).emit('fm2_mod_preset', data)
        } else {
            console.log('fm2_mod_preset', data)
        }
    });

    socket.on('fm2_shape_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            fm2_shape_preset[room] = data;
            socket.to(room).emit('fm2_shape_preset', data)
        } else {
            console.log('fm2_shape_preset', data)
        }
    });

    socket.on('perc_sound_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            perc_sound_preset[room] = data;
            socket.to(room).emit('perc_sound_preset', data)
        } else {
            console.log('perc_sound_preset', data)
        }
    });

    socket.on('perc_transpose_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            perc_transpose_preset[room] = data;
            socket.to(room).emit('perc_transpose_preset', data)
        } else {
            console.log('perc_transpose_preset', data)
        }
    });

    socket.on('perc_shape_preset', data => {
        if (typeof data === 'number') {
            let room = get_room(socket.id);
            perc_shape_preset[room] = data;
            socket.to(room).emit('perc_shape_preset', data)
        } else {
            console.log('perc_shape_preset', data);
        }
    });
})
