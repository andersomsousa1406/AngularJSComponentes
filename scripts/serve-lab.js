'use strict';

var fs = require('node:fs');
var path = require('node:path');
var http = require('node:http');
var root = path.resolve(__dirname, '..');
var allowed = ['legacy-migration', 'AngularJS184', 'src', 'node_modules/bootstrap/dist'];
var types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
var server = http.createServer(function (request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
  var pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/\\/g, '/'); }
  catch (_) { response.writeHead(400).end(); return; }
  if (pathname === '/') { response.writeHead(302, { Location: '/legacy-migration/lab.html' }).end(); return; }
  var file = path.resolve(root, '.' + pathname);
  var relative = path.relative(root, file).split(path.sep).join('/');
  if (relative.startsWith('..') || path.isAbsolute(relative) || !allowed.some(function (directory) { return relative === directory || relative.startsWith(directory + '/'); })) { response.writeHead(403).end(); return; }
  fs.readFile(file, function (error, contents) {
    if (error) { response.writeHead(404).end('Arquivo nao encontrado.'); return; }
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? undefined : contents);
  });
});
server.on('error', function (error) { console.error(error.message); process.exitCode = 1; });
server.listen(Number(process.env.LAB_PORT || 4173), '127.0.0.1', function () {
  console.log('Laboratorio local: http://127.0.0.1:' + server.address().port + '/legacy-migration/lab.html');
  console.log('Encerrar: Ctrl+C. Dados e requisicoes do laboratorio sao simulados.');
});
