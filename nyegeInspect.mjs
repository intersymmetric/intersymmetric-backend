import { open } from 'lmdb';

let db = open({
	path: 'nnnb',
	compression: true
})

db.getKeys().forEach((k) => {
	console.log(k)
})