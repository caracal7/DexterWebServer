const http = require('http');
const url = require('url');
const ws = require('ws');

const { Dexter } = require('./js/Dexter.js');

const { serve_file, serve_init_jobs } = require('./js/serve.js');

const server = http.createServer((req, res) => {
    const q = url.parse(req.url, true);
    if (q.pathname === "/") q.pathname = "/index.html";
    if (q.pathname === "/init_jobs") return serve_init_jobs(q, req, res);
    serve_file(q, req, res);
}).listen(80);
console.log("Listening on port 80");


const { serve_job_button_click, serve_show_window_call_callback } = require('./js/job/serve_job_button_click.js');


const wss = new ws.Server({ port: 3001 });

wss.on('connection', function(socket, req) {
    socket.on('message', message => {
        const msg = JSON.parse(message);
        console.log('MESSAGE', msg)
        switch(msg.kind) {
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
