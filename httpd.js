const http = require('http');
const ws = require('ws');
const { Dexter } = require('./js/Dexter.js');
const { serve } = require('./js/serve.js');
const {
    myJob,
    serve_job_button_click,
    serve_show_window_call_callback
} = require('./js/job/serve_job_button_click.js');

const server = http.createServer(serve).listen(80);
const wss = new ws.Server({ port: 3001 });
console.log("Listening on port 80 and 3001");

wss.on('connection', function(socket, req) {
    socket.on('message', message => {
        const msg = JSON.parse(message);
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
                console.log(`wss server received invalid message kind: ${msg.kind}`);
        }
    });
    socket.send('WebSocket connected.\n');
})

const dexter = new Dexter({ server });
