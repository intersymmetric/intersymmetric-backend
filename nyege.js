const fs = require('fs');
const http = require('http');
const https = require('https');
const io = require('socket.io');

const port = 49124;
const env = process.argv[2];

let server;
const certStorage = '/root/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/'
const certApplication = 'nyege-server.intersymmetric.xyz/'

if (env == 'live') {
    const privateKey = fs.readFileSync(certStorage + certApplication + 'nyege-server.intersymmetric.xyz.key', 'utf8');
    const certificate = fs.readFileSync(certStorage + certApplication + 'nyege-server.intersymmetric.xyz.crt', 'utf8');
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
            }

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
})
