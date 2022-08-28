const fs = require("fs");
const http = require("http");
const https = require("https");
const io = require("socket.io");
const template = require("./nyegeParams.js");

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

const backend = io(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
console.log("Created Backend");

const getRoom = (id) => users[id]; // get room that user belongs to

// State
let users = {};
let rooms = {};
let state = {};

Object.keys(template).forEach((key) => {
  state[key] = {};
});

backend.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    if (users[socket.id] !== room) {
      // Check if user is already in a room
      if (socket.id in users) {
        const prev_room = getRoom(socket.id);
        socket.leave(prev_room);
        rooms[prev_room].num_users -= 1;
      }
      socket.join(room);
      users[socket.id] = room; // Now log their room in the users database

      // Does this room already exist?
      if (rooms.hasOwnProperty(room)) {
        rooms[room].num_users += 1;
      } else {
        rooms[room] = { num_users: 1 };
        Object.keys(state).forEach((x) => {
          state[x][room] = template[x];
        });
      }

      backend.to(room).emit("num_users", rooms[room].num_users);
      Object.keys(state).forEach((x) => {
        (() => {
          backend.to(room).emit(x, state[x][room]);
        })();
      });
    }
  });

  // When a user disconnects update the number of users
  socket.on("disconnect", (user) => {
    console.log(socket.id, "left");
    let room = getRoom(socket.id);
    socket.leave(room);
    delete users[socket.id];
    if (room) {
      rooms[room].num_users -= 1;
      backend.to(room).emit("num_users", rooms[room].num_users);
    }
  });

  Object.keys(state).forEach((x) => {
    //stackoverflow.com/questions/19586137/addeventlistener-using-for-loop-and-passing-values
    https: (() => {
      socket.on(x, (data) => {
        const room = getRoom(socket.id);
        state[x][room] = data;
        socket.to(room).emit(x, data);
      });
    })();
  });
});
