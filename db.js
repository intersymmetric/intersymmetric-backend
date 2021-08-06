const ignoredKeys = ['_id', '_rev'];

function setProp(db, key, property, value) {
    db.get(key)
    .then(doc => {
        doc[property] = value
        return db.put(doc)
    })
    .catch(err => {
        console.log(err, 'room did not exist doing setProp')
    })
}

function set(db, key, data) {
    db.get(key)
    .then(doc => {
        // Update
        for (const [k, v] of Object.entries(data)) {
            doc[k] = v
        }
        return db.put(doc)
    })
    .catch(err => {
        data['_id'] = key;
        db.put(data)
    })
}

function get(db, key) {
    db.get(key)
    .then(doc => {
        console.log(extract(doc));
    })
    .catch(err => {
        console.log(err, 'doesnt exist')
    })
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

module.exports = { get, set, setProp, extract };

// setter('flamble', room)
// getter('flamble')
// getter('flooble')