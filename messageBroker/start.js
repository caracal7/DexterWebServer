
const fs = require('fs');
const path = require('path');
const { Deepstream } = require( '@deepstream/server' );

const keyUrl = name => path.resolve(__dirname, '../certs', name);
const keyFile = name => fs.readFileSync(keyUrl(name), 'utf8');

const server = new Deepstream({
	logLevel: 'DEBUG',
	httpServer: {
		type: 'default',
		options: {
			port: 6020,
			host: '192.168.0.142',  // TODO CONFIG host/password!!!!!!!!!!!
			allowAllOrigins: true,
			ssl: {
				key: keyFile("privkey.pem"),
				cert: keyFile("fullchain.pem"),
			}
		}
	},
});

//=================================> Plugins <==================================
const Permission = require('./permission.js');
server.set('permission', new Permission({}, server.getServices()));
server.set('authentication', require('./authentication.js'));

server.start()










//##############################################################################
//##############################################################################
//##############################################################################












//---------------------
