import _ from 'lodash';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import { template } from './nyegeParams.mjs'
import { getNumUsers, conformTemplate } from './core.mjs';
import { initializeApp } from 'firebase/app';
import { setDoc, doc, getDocs, getFirestore, collection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from './core.mjs';
import * as dotenv from 'dotenv';
dotenv.config()

const email = process.env.FIREBASE_USERNAME;
const password = process.env.FIREBASE_PASSWORD;
const port = 49124;
const env = process.argv[2];

//////////// DATABASE //////////////
let users = new Map();
let state = {};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);
const authenticate = async() => {
    await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // console.log(errorCode, errorMessage)
    });
}

await authenticate()

const query = await getDocs(collection(db, "rooms"));
query.forEach((doc) => {
    state[doc.id] = doc.data(); 
});
//////////// DATABASE //////////////

let server;
const certStorage = "/root/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/";
const certApplication = "nyege-server.intersymmetric.xyz/";

if (env == "live") {
    const privateKey = fs.readFileSync(
        certStorage + certApplication + "nyege-server.intersymmetric.xyz.key",
        "utf8");
        
    const certificate = fs.readFileSync(
        certStorage + certApplication + "nyege-server.intersymmetric.xyz.crt",
        "utf8");

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

const writeToFirestore = () => {
    const now = performance.now();
    Object.entries(state)
        .forEach(async([room, data]) => {
            await setDoc(doc(db, "rooms", room), data)
        })
    const done = performance.now();
    console.log(`time taken to write ${done - now}`)
}
setInterval(writeToFirestore, 1000 * 60 * 60 * 1)
        
backend.on("connection", (socket) => {
    socket.on("join_room", async(room) => {
        if (users.has(socket.id)) { // Does the user belong to a room?
            socket.leave(users.get(socket.id))
        }
        users.set(socket.id, room);
        socket.join(room);
        backend.to(room).emit("users", getNumUsers(room, users));
        
        if (!state.hasOwnProperty(room)) {
            let formattedTemplate = {};
            Object.entries(template).forEach(([k, v]) => {
                formattedTemplate[k] = v.value;
            });
            state[room] = formattedTemplate; 
        }
        
        Object.entries(state[room]).forEach(([k, v]) => {
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
    
    // socket.on('getSnapshots', async() => {
    //     socket.emit('snapshots', await db.get('snapshots'))
    // })
    
    Object.keys(template).forEach(key => {
        //stackoverflow.com/questions/19586137/addeventlistener-using-for-loop-and-passing-values
        (() => {
            socket.on(key, async(data) => {
                const room = users.get(socket.id);
                const isValid = state.hasOwnProperty(room) && room !== undefined && 
                conformTemplate(data, template[key])
                
                if (isValid) {
                    state[room][key] = data
                    socket.to(room).emit(key, data);
                }
            });
        })();
    });
});