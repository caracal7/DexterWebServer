require('colors');
const net = require('net');

const _LOG = (...args) => console.log(new Date().toISOString().split('T')[1].green, ...args);

class RawSocket {
    constructor(clients) {
        _LOG("RawSocket.constructor()");
        this.clients = clients;
        this.dexter = new net.Socket();

        ['connect', 'close', 'end', 'error', 'data']
            .forEach(method =>
                this.dexter.on(
                    method,
                    this[`on${method[0].toUpperCase()}${method.slice(1)}`].bind(this)
                ));

        this.connect();
    }

    connect() {
        this.dexter.connect(50000, "127.0.0.1"); // TODO: error handling?
        this.dexter.connected = true;
    }

    send2dexter(data) {
        if(!this.dexter.connected) {
            _LOG('Reconnect');
            this.connect();
            //setTimeout(
            //    () =>
                this.send2dexter(data)
            //, 1000);
        }
        else {
            _LOG("RawSocket.send2dexter()");
            this.dexter.write(data.toString());
        }
    };

    send2clients(data) {
        this.clients.forEach(
            (options, socket) => socket.send(data, { binary: true })
        );
    }

    //--------------------- net.Socket() events
    onConnect() {
        _LOG("RawSocket.connect()");
    }

    onClose(hadError) {
        _LOG(`RawSocket.close(${hadError})`);
        this.dexter.connected = false;
    }

    onEnd() {
        _LOG("RawSocket.end()");
        this.dexter.connected = false;
        this.dexter.end();
    }

    onError(msg) {
        _LOG("RawSocket.error()", msg); //this.dexter.destroy(); // Why ????
        this.dexter.connected = false;
        this.send2clients(null);
    }

    onData(data) {
        //for(let i = 0; i<8*4; i+=4) {console.log(i, data[i])}
        _LOG("RawSocket.data()", "#" + data[1*4] + " op:" + String.fromCharCode(data[4*4]));
        if (data[5*4]) _LOG("ERROR", data[5*4]);
        this.send2clients(data);
    }
}

module.exports = {
    RawSocket
};
