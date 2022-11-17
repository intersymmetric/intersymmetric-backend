import { template } from './nyegeParams.mjs';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { setDoc, doc } from "firebase/firestore"; 
import { open } from 'lmdb';

let ldb = open({
    path: 'nnnb',
    // any options go here, we can turn on compression like this:
    compression: true,
});

const firebaseConfig = {
    apiKey: "AIzaSyBQ-SUfm2OZ_i4UCSK4qGfqZeflaewS004",
    authDomain: "intersymmetric-7e851.firebaseapp.com",
    databaseURL: "https://intersymmetric-7e851-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "intersymmetric-7e851",
    storageBucket: "intersymmetric-7e851.appspot.com",
    messagingSenderId: "500933689703",
    appId: "1:5009336897 03:web:dd664fc065f7b9cce22fc2",
    measurementId: "G-Q9HCJJXHGM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const keys = await ldb.getKeys().filter(x => x !== 'snapshots')
keys.forEach(async(room) => {
    const data = ldb.get(room);
    try {
        await setDoc(doc(db, "rooms", room), data);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
})
    

    