import fs from 'fs';
import http from 'http';
import https from 'https';
// import { open } from 'lmdb';
import { Server } from 'socket.io';
import { template } from './aaaParams.mjs';
import { clone, getNumUsers } from './core.mjs';

const port = 49123;
const env = process.argv[2];

let server;
const certStorage =
  "/root/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/";
const certApplication = "aaa.intersymmetric.xyz/";

if (env == "live") {
  const privateKey = fs.readFileSync(
    certStorage + certApplication + "aaa.intersymmetric.xyz.key",
    "utf8"
  );
  const certificate = fs.readFileSync(
    certStorage + certApplication + "aaa.intersymmetric.xyz.crt",
    "utf8"
  );
  const credentials = { key: privateKey, cert: certificate };
  server = https.createServer(credentials).listen(port);
  console.log("Booting SSL/HTTPS Server");
} else {
  server = http.createServer().listen(port);
  console.log("Booting HTTP Server");
}

const backend = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
console.log("Created Backend");

// let db = open({
//   path: 'aaa',
//   compression: true
// })

let users = new Map();
let state = {};

backend.on("connection", (socket) => {
  socket.on("join_room", async(room) => {
    if (users.has(socket.id)) { // Does the user belong to a room?
      socket.leave(users.get(socket.id))
    }
    users.set(socket.id, room);
    socket.join(room);
    backend.to(room).emit("users", getNumUsers(room, users));

    if (!state.hasOwnProperty(room)) {
      state[room] = clone(template);
    } 

    Object.entries(state[room]).forEach(([k, v]) => {
      (() => {
        backend.to(room).emit(k, v);
      })();
    })
  });

  Object.keys(template).forEach((key) => {
    //stackoverflow.com/questions/19586137/addeventlistener-using-for-loop-and-passing-values
    (() => {
      socket.on(key, async(data) => {
        const room = users.get(socket.id)
        // await db.transaction(async() => {
        //   const update = await db.get(room)
        //   update[key] = data
        //   await db.put(room, update)
        // })
        state[room][key] = data;
        socket.to(room).emit(key, data);
      });
    })();
  });

  // When a user disconnects update the number of users
  socket.on("disconnect", (user) => {
    const room = users.get(socket.id);
    socket.leave(room);
    users.delete(socket.id)
    backend.to(room).emit("users", getNumUsers(room, users));
  });
});
