'use strict';
var path = require('path');
var build = require('../lib/build-project').buildProject;
var root = path.resolve(__dirname, '..');
build({ root: root, build: {
  entry: path.join(root, 'ui-kit/demo/app.js'), outfile: path.join(root, 'ui-kit/dist/catalog.bundle.js'), report: path.join(root, 'ui-kit/dist/report.json'),
  target: ['es2017'], minify: true, sourcemap: true, budgets: { bundle: 100000, gzip: 25000 }
} }, { onReport: function (report) { console.log('Component Studio: ' + report.bytes + ' bytes; ' + report.gzipBytes + ' gzip; ' + report.embeddedTemplates + ' templates.'); } }).catch(function (error) { console.error(error.message); process.exitCode = 1; });
