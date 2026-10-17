'use strict';

var path = require('path');
var fs = require('fs');
var zlib = require('zlib');
var esbuild = require('esbuild');
var buildProject = require('../lib/build-project').buildProject;
var root = path.resolve(__dirname, '..');

var config = {
  root: root,
  build: {
    entry: path.join(root, 'legacy-migration/app.js'),
    outfile: path.join(root, 'legacy-migration/dist/app.bundle.js'),
    report: path.join(root, 'legacy-migration/dist/easy-components-report.json'),
    target: ['es2017'],
    minify: true,
    sourcemap: true,
    budgets: { bundle: 60000, gzip: 15000 }
  }
};

function buildEngine() {
  var outfile = path.join(root, 'legacy-migration/dist/legacy-engine.bundle.js');
  return esbuild.build({
    entryPoints: [path.join(root, 'legacy-migration/engine/entry.js')],
    outfile: outfile,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2017'],
    minify: true,
    sourcemap: true,
    legalComments: 'none'
  }).then(function () {
    var contents = fs.readFileSync(outfile);
    var report = { bytes: contents.length, gzipBytes: zlib.gzipSync(contents, { level: 9 }).length };
    fs.writeFileSync(
      path.join(root, 'legacy-migration/dist/legacy-engine-report.json'),
      JSON.stringify(report, null, 2) + '\n',
      'utf8'
    );
    console.log('Motor legado integral: ' + report.bytes + ' bytes, ' + report.gzipBytes + ' gzip.');
  });
}

buildProject(config, {
  onReport: function (report) {
    console.log('Migracao compilada: ' + report.bytes + ' bytes, ' + report.gzipBytes + ' gzip, ' + report.embeddedTemplates + ' templates.');
  }
}).then(buildEngine).catch(function (error) {
  console.error(error.message || error);
  process.exitCode = 1;
});
