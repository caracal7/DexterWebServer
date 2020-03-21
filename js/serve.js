const fs = require('fs');
const { mimeTypes } = require('./mimeTypes.js');

function serve_file(q, req, res) {
	const filename = "/srv/samba/share/www/static" + q.pathname;
    fs.readFile(filename, (err, data) => {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
        }
        const mimeType = mimeTypes[ q.pathname.split(".").pop() ] || "application/octet-stream";
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader("Content-Type", mimeType);
        res.writeHead(200)
        res.write(data)
        return res.end()
    })
}


function serve_init_jobs(q, req, res){
    console.log("serve_init_jobs()");
    fs.readdir("/srv/samba/share/dde_apps/",(err, items) => {
        res.write(JSON.stringify(items));
        res.end();
    });
}

module.exports = {
    serve_file,
    serve_init_jobs,
};
