const fs = require('fs');
const http = require('http');
const https = require('https');
const io = require('socket.io');

const port = 48000;
const env = process.argv[2];

let server;

if (env == 'live') {
    let privateKey = fs.readFileSync('/etc/letsencrypt/live/ctrl.intersymmetric.xyz/privkey.pem', 'utf8');
    let certificate = fs.readFileSync('/etc/letsencrypt/live/ctrl.intersymmetric.xyz/fullchain.pem', 'utf8');
    let credentials = {key : privateKey, cert: certificate}
    server = https.createServer(credentials).listen(port);
    console.log('Booting SSL/HTTPS Server')

} else {
    // This is called in local production where we just need a http server
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

// State
let slider0 = 0.5;
let slider1 = 0.5;
let slider2 = 0.5;
let slider3 = 0.5;

backend.on('connection', socket => {
    console.log(socket.id, 'connected')
    backend.emit('slider0', slider0);
    backend.emit('slider1', slider1);
    backend.emit('slider2', slider2);
    backend.emit('slider3', slider3);

    socket.on('disconnect', user => {
        console.log(user.id, 'left');
    });

    socket.on('slider0', data => {
        slider0 = data
        socket.broadcast.emit('slider0', data)
    })

    socket.on('slider1', data => {
        slider1 = data
        socket.broadcast.emit('slider1', data)
    })

    socket.on('slider2', data => {
        slider2 = data
        socket.broadcast.emit('slider2', data)
    })

    socket.on('slider3', data => {
        slider3 = data
        socket.broadcast.emit('slider3', data)
    })
})
