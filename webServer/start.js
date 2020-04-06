require('colors');
const https = require('https');
const ws = require('ws');
const fs = require('fs');

const { Dexter } = require('./Dexter.js');
const { Serve } = require('./Serve.js');
const {
    myJob,
    serve_job_button_click,
    serve_show_window_call_callback
} = require('./job/serve_job_button_click.js');

const PORT = 443;

const options = {
    key: fs.readFileSync( __dirname+'/../certs/privkey.pem'),
    cert: fs.readFileSync( __dirname+'/../certs/fullchain.pem')
};

const server = https.createServer(options, Serve).listen(PORT);

/*----------------------------------------------------------------------------*/

        const server2 = https.createServer(options, Serve).listen(3001);
        const wss = new ws.Server({ server: server2 });
        wss.on('connection', function(socket, req) {
            console.log('3001 connection');

            socket.on('message', message => {
                const msg = JSON.parse(message);

                console.log(msg);

                switch(msg.kind) {
                    case 'myJob':
                        myJob(socket, msg.options);
                        break;
                    case 'keep_alive_click':
                        serve_job_button_click(socket, msg);
                        break;
                    case 'job_button_click':
                        serve_job_button_click(socket, msg);
                        break;
                    case 'show_window_call_callback':
                        serve_show_window_call_callback(socket, msg);
                        break;
                    default:
                        console.log(`WSS server received invalid message kind: ${msg.kind}`);
                }
            });
            socket.send('WebSocket connected.\n');
        })
        console.log(`Old jobs server on 3001`.yellow);
/*----------------------------------------------------------------------------*/

const dexter = new Dexter({ server });

console.log(`Static server started on port ${PORT}`.yellow);
