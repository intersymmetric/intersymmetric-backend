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

export const conformTemplate = (data, constraints) => {
	if ("enum" in constraints) {
		return constraints.enum.includes(data) && data !== null;
	} else {
		return (data >= constraints.min && data <= constraints.max) && data !== null
	}
}

export const firebaseConfig = {
    apiKey: "AIzaSyBQ-SUfm2OZ_i4UCSK4qGfqZeflaewS004",
    authDomain: "intersymmetric-7e851.firebaseapp.com",
    databaseURL: "https://intersymmetric-7e851-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "intersymmetric-7e851",
    storageBucket: "intersymmetric-7e851.appspot.com",
    messagingSenderId: "500933689703",
    appId: "1:500933689703:web:dd664fc065f7b9cce22fc2",
    measurementId: "G-Q9HCJJXHGM"
};