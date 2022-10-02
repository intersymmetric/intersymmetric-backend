export const clone = obj => {
	return JSON.parse(JSON.stringify(obj))
}

export const getNumUsers = (room, users) => {
	let count = 0;
	for (const [k, v] of users) {
		if (v === room) {
			count ++
		}
	}
	return count
}