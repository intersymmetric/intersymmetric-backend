let parameters = require('./parameters.js')

const ignoredKeys = ['_id', '_rev'];

function createBlankGrid(rows, columns) {
    return new Array(rows).fill(
        new Array(columns).fill(false)
    );
}

function createNewRoom(id) {
    return {
        _id : id,
        numUsers : 1,
        grid : createBlankGrid(6, 16),
        params : JSON.parse(JSON.stringify(parameters.base)),
        mirrorPoint :  8,
        pitchOffset :  0,
        bpm :  120,
        play :  false,
        euclid :  [0, 0, 0, 0, 0, 0],
        clock :  {
            mode : 'forward', 
            multiplier: 0, 
            offset : {
                start : 1,
                end : 16
            }
        },
        length :  1.0,
        enabledStates :  {
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
        maxCells :  32,
        prevInsertions :  [],
        sampleSelectors :  new Array(6).fill(0),
        trackGains :  new Array(6).fill(1.0),
        trackRates :  new Array(6).fill(1.0),
        trackLengths :  new Array(6).fill(3.0),
        trackPitch :  new Array(6).fill(0.0),
        trackSound :  new Array(6).fill(0.5),
        trackShape :  new Array(6).fill(1.0),
        playbackRate :  1.0,
        velocityPattern :  0,
        userMessage :  ''
    }
}

function extract(d) {
    let t = {};
    for (const [k, v] of Object.entries(d)) {
        if (!ignoredKeys.includes(k)) {
            t[k] = v
        }
    }
    return t
}

module.exports = { extract, createNewRoom };