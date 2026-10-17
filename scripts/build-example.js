'use strict';

var path = require('path');
var tools = require('../lib/project-tools');
var buildProject = require('../lib/build-project').buildProject;

var config = tools.loadConfig(path.resolve(__dirname, '..'));
var watch = process.argv.indexOf('--watch') !== -1;

buildProject(config, {
  watch: watch,
  onReport: function (report) {
    console.log(
      'Bundle criado: ' + report.output +
      ' (' + report.bytes + ' bytes, ' + report.gzipBytes + ' gzip, ' +
      report.embeddedTemplates + ' templates incorporados)'
    );
  }
}).then(function () {
  if (watch) console.log('Observando JavaScript, HTML e CSS dos componentes...');
}).catch(function (error) {
  console.error(error.message || error);
  process.exitCode = 1;
});
