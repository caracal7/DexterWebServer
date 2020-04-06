const url = require('url');
const fs = require('fs');
const { MimeTypes } = require('./MimeTypes.js');

const serveFile = (q, req, res) => {
	const filename = "/srv/samba/share/www/static" + q.pathname;
    fs.readFile(filename, (err, data) => {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader("Content-Type", MimeTypes[ q.pathname.split(".").pop() ] || "application/octet-stream");
        res.writeHead(200)
        res.write(data)
        return res.end()
    })
}


const serveInitJobs = (q, req, res) => {
    fs.readdir("/srv/samba/share/dde_apps/",(err, items) => {
        res.write(JSON.stringify(items));
        res.end();
    });
}

const Serve = (req, res) => {
    const q = url.parse(req.url, true);
    if (q.pathname === "/") q.pathname = "/index.html";
    if (q.pathname === "/init_jobs") return serveInitJobs(q, req, res);
    serveFile(q, req, res);
}


module.exports = {
	Serve,
};
