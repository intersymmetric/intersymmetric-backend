import { open } from 'lmdb';
import { template } from './nyegeParams.mjs';

let db = open({
	path: 'nnnb',
	compression: true
})

// await db.getKeys().forEach(async(k) => {

let snapshots = await db.get('snapshots')

snapshots.forEach((x, i) => {
	const params = x.state
	for (const [k, v] of Object.entries(params)) {
		if (v === null) {
			snapshots[i].state[k] = template[k].value
		}
	}
})

await db.put('snapshots', snapshots)


