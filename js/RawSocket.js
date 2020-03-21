const net = require('net');

const _LOG = (...args) => console.log(process.hrtime()[1], ...args);

class RawSocket {
    constructor(clients) {
        _LOG("RawSocket.constructor()");
        this.clients = clients;
        this.dexter = new net.Socket();
        this.dexter.connect(50000, "127.0.0.1"); // TODO: error handling?

        this.send2dexter = data => {
            console.log('send2dexter', data)
            this.dexter.write(data.toString())
        };
        this.send2clients = data => this.clients.forEach(
            (options, socket) => socket.send(data, { binary: true })
        );

        ['connect', 'close', 'end', 'error', 'data']
            .forEach(method =>
                this.dexter.on( method, this[method].bind(this) ));
    }

    connect() {
        _LOG("RawSocket.connect()");
    }

    close() {
        _LOG("RawSocket.close()");
    }

    end() {
        _LOG("RawSocket.end()");
        this.dexter.end();
    }

    error(msg) {
        _LOG("RawSocket.error()", msg); //this.dexter.destroy(); // Why ????
        this.send2clients(null);
    }

    data(data) {
        //for(let i = 0; i<8*4; i+=4) {console.log(i, data[i])}
        _LOG("RawSocket.data()", "#" + data[1*4] + " op:" + String.fromCharCode(data[4*4]));
        if (data[5*4]) _LOG("ERROR", data[5*4]);
        this.send2clients(data);
    }
}

module.exports = {
    RawSocket
};
