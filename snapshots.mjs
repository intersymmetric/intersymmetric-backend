import { open } from 'lmdb';

let db = open({
	path: 'nnnb',
	compression: true
})



const snaps = await db.get('snapshots')
console.log(snaps.length)
