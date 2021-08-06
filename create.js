const PouchDB = require('pouchdb');
let db = new PouchDB('intersymmetric');
let parameters = require('./parameters.js')


db.put({
    _id : 'fake',
    grid : new Array(6).fill(new Array(24).fill(1)),
    params : JSON.parse(JSON.stringify(parameters.base)),
    clock : {
        mode : 'forward', 
        multiplier: 0, 
        offset : {
            start : 1,
            end : 16
        }
    },
    bpm : 120,
    play : false,
    euclid : [0,0,0,0,0,0],
    length : 1.0,
    users : [],
    enabledStates : {
        maxCells: true,
        pitchOffset: true,
        mirrorPoint: true,
        grid: true,
        bpm: true,
        euclid: true,
        offset: true,
        globalVelocity: true,
        globalLength: true,
        multiplier: true,
        transforms: true,
        velocityPattern: true,
    },
    pitchOffset : 0,
    maxCells : 32,
    prevInsertions : [],
    mirrorPoint : 8,
    userMessage : '',
    sampleSelectors : [0, 1, 2, 3, 4, 5].map(sample => 0),
    trackGains : new Array(6).fill(1.0),
    trackRates : new Array(6).fill(1.0),
    trackLengths : new Array(6).fill(3.0),
    trackPitch : new Array(6).fill(0.0),
    trackSound : new Array(6).fill(0.5),
    trackShape : new Array(6).fill(1.0),
    playbackRate : 1.0,
    velocityPattern : 0
})