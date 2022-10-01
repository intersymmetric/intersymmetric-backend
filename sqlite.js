const template = require('./nyegeParams.js');
const PouchDB = require('pouchdb')
const loki = require('lokijs')
const data = template

const db = new loki('db')

const rooms = db.addCollection('rooms')
const dv = rooms.addDynamicView('all the rooms');


rooms.insert(data)

