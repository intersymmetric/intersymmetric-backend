const PouchDB = require('pouchdb');
let db = new PouchDB('intersymmetric');

db.compact()
    .then(d => console.log(d))
    .catch(err => console.log(err))