import _ from 'lodash';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { open } from 'lmdb';
import { Server } from 'socket.io';
import { template } from './nyegeParams.mjs'
import { clone, getNumUsers } from './core.mjs';

const port = 49124;
const env = process.argv[2];

let server;
const certStorage =
  "/root/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/";
const certApplication = "nyege-server.intersymmetric.xyz/";

if (env == "live") {
  const privateKey = fs.readFileSync(
    certStorage + certApplication + "nyege-server.intersymmetric.xyz.key",
    "utf8"
  );
  const certificate = fs.readFileSync(
    certStorage + certApplication + "nyege-server.intersymmetric.xyz.crt",
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

let db = open({
  path: 'nnnb',
  compression: true
})

let users = new Map();

setInterval(async() => {
  if (await db.doesExist('nnnb.room1')) {
    await db.transaction(async() => {
      // Get Snapshot
      const state = await db.get('nnnb.room1');
      const payload = {
        time: new Date().toString(),
        state: state
      }
      if (await db.doesExist('snapshots')) {
        const snapshots = await db.get('snapshots')
        snapshots.push(payload)
        const dedup = snapshots.reduce((unique, o) => {
          if(!unique.some(obj => _.isEqual(obj.state, o.state))) {
            unique.push(o);
          }
          return unique;
        },[]);
        await db.put('snapshots', dedup)
      } else {
        await db.put('snapshots', [payload])
      }
    })
  }
}, 300000)

backend.on("connection", (socket) => {
  socket.on("join_room", async(room) => {
    if (users.has(socket.id)) { // Does the user belong to a room?
      socket.leave(users.get(socket.id))
    }
    users.set(socket.id, room);
    socket.join(room);
    backend.to(room).emit("users", getNumUsers(room, users));

    if (await !db.doesExist(room)) {
      await db.put(room, clone(template))
    }

    Object.entries(await db.get(room)).forEach(([k, v]) => {
      (() => {
        backend.to(room).emit(k, v);
      })();
    })
  });

  // When a user disconnects update the number of users
  socket.on("disconnect", async() => {
    const room = users.get(socket.id);
    socket.leave(room);
    users.delete(socket.id)
    backend.to(room).emit("users", getNumUsers(room, users));
  });

  socket.on('getSnapshots', async() => {
    socket.emit('snapshots', await db.get('snapshots'))
  })

  Object.keys(template).forEach((key) => {
    //stackoverflow.com/questions/19586137/addeventlistener-using-for-loop-and-passing-values
    (() => {
      socket.on(key, async(data) => {
        const room = users.get(socket.id);
        if (await db.doesExist(room)) {
          await db.transaction(async() => {
            const update = await db.get(room)
            update[key] = data
            await db.put(room, update)
          })
          socket.to(room).emit(key, data);
        }
      });
    })();
  });
});
