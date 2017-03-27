var http = require('http');
var fs = require('fs');
var path = require('path');
var parse = require('url').parse;

var pkgConfig = require('./package.json').config || {};
var port = process.env.PORT || pkgConfig.PORT || 1337;
var host = process.env.HOST || pkgConfig.HOST || '0.0.0.0';

var mimeMap = {
  '.htm':      'text/html',
  '.html':     'text/html',
  '.css':      'text/css',
  '.js':       'application/javascript',
  '.png':      'image/png',
  '.jpg':      'image/jpeg',
  '.jpeg':     'image/jpeg',
  '.gif':      'image/gif',
  '.manifest': 'text/cache-manifest',
};

function mimeType(ext) {
  return mimeMap[ext.toLowerCase()] || 'application/octet-stream';
}

http.createServer(function (req, res) {
  console.log(new Date(), req.url);

  var url = parse(req.url);
  var pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  var filePath = path.join(__dirname, pathname);

  try {
    var stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': mimeType(path.extname(pathname)),
      'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    console.error(new Date(), (err && err.message) || 'Unknown error');

    var statusCode = 500;
    if (err.code === 'ENOENT') {
      statusCode = 404;
    }

    res.writeHead(statusCode, { 'Content-Type': 'text/html' });
    res.end(http.STATUS_CODES[statusCode]);
  }
}).listen(port, host);

console.log('Server running at http://'+host+':'+port+'/');
