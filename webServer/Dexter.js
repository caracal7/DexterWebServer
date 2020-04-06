const ws = require('ws');
const { RawSocket } = require('./RawSocket.js');

//------------------------------------------------------------------------------
// TODO: limit connections!
class Dexter {
    constructor(options) {
        const clients = new Map();
        const rawSocket = new RawSocket(clients);
        new ws.Server({ server: options.server })
            .on('connection', socket => {
                clients.set(socket, {}); // Add client
                socket.on('message', data => rawSocket.send2dexter(data));
                socket.on('close', () => clients.delete(socket)); // Remove client
            });
    }
}

module.exports = {
    Dexter
};
