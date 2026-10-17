'use strict';

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var esbuild = require('esbuild');

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function sizeReport(config, result) {
  var contents = fs.readFileSync(config.build.outfile);
  var bytes = contents.length;
  var gzipBytes = zlib.gzipSync(contents, { level: 9 }).length;
  var inputs = Object.keys(result.metafile.inputs);
  var report = {
    output: path.relative(config.root, config.build.outfile).split(path.sep).join('/'),
    bytes: bytes,
    gzipBytes: gzipBytes,
    embeddedTemplates: inputs.filter(function (input) { return /\.html$/.test(input); }).length,
    embeddedStyles: inputs.filter(function (input) { return /\.css$/.test(input); }).length,
    inputCount: inputs.length,
    budgets: {
      bundle: config.build.budgets.bundle || null,
      gzip: config.build.budgets.gzip || null
    }
  };

  var failures = [];
  if (report.budgets.bundle && bytes > report.budgets.bundle) {
    failures.push('bundle: ' + bytes + ' > ' + report.budgets.bundle + ' bytes');
  }
  if (report.budgets.gzip && gzipBytes > report.budgets.gzip) {
    failures.push('gzip: ' + gzipBytes + ' > ' + report.budgets.gzip + ' bytes');
  }
  report.passed = failures.length === 0;
  report.failures = failures;
  ensureDirectory(config.build.report);
  fs.writeFileSync(config.build.report, JSON.stringify(report, null, 2) + '\n', 'utf8');
  if (failures.length) throw new Error('Orcamento de build excedido: ' + failures.join('; '));
  return report;
}

function buildOptions(config, onReport) {
  return {
    entryPoints: [config.build.entry],
    outfile: config.build.outfile,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: config.build.target,
    minify: config.build.minify,
    sourcemap: config.build.sourcemap,
    sourcesContent: true,
    metafile: true,
    charset: 'utf8',
    legalComments: 'none',
    loader: { '.html': 'text', '.css': 'text' },
    plugins: [{
      name: 'easy-components-report',
      setup: function (build) {
        build.onEnd(function (result) {
          if (!result.errors.length) onReport(sizeReport(config, result));
        });
      }
    }]
  };
}

async function buildProject(config, options) {
  options = options || {};
  ensureDirectory(config.build.outfile);
  var latestReport;
  var esbuildOptions = buildOptions(config, function (report) {
    latestReport = report;
    if (options.onReport) options.onReport(report);
  });

  if (options.watch) {
    var context = await esbuild.context(esbuildOptions);
    await context.watch();
    return { watching: true, context: context };
  }

  await esbuild.build(esbuildOptions);
  return latestReport;
}

module.exports = { buildProject: buildProject, sizeReport: sizeReport };
