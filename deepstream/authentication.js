const users = {};

const logUser = username => {
	users[ username ] = true;
	console.log(`[${username}] logged in`);
	return {
		isValid: true,
		id: username,
		clientData: { msgFromAuthServer: `I am ${username} and i logged in` },
		serverData: { anonymous: true },
	}
}

const restrictUser = (username, error = 'Incorrect login/password') => {
	console.log(`[${username}] restricted: ${error}`);
	return {
		isValid: false,
		id: username,
		clientData: { error }
	}
}

module.exports = {

	async isValidUser( handshakeData, authData ) {
		if( users[ authData.username ] ) return restrictUser(authData.username, 'Already logged in');

		if(authData.username === 'server') {
			if(authData.password === 'serverklg') return logUser(authData.username);
			else return restrictUser(authData.username);
		}

		if(authData.password !== 'klg') return restrictUser(authData.username);

		return logUser(authData.username);
	},

	async onClientDisconnect( username ) {
		console.log( 'onClientDisconnect *******************************************', username )
		if(username == null) {
			console.log( 'onClientDisconnect', username, 'NULL ********************************!!!!!!' );
            console.log(Object.keys(users));
		}
		delete users[ username ];
	},

	async whenReady () {
		console.log('[authentication.js ready]:::whenReady()');
	},

};
