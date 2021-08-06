const PouchDB = require('pouchdb');
let db = new PouchDB('intersymmetric');

db.allDocs({include_docs: true, attachments: true})
.then(d => {
    d.rows.forEach(p => console.log(p.doc))
})