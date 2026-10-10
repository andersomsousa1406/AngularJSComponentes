'use strict';

var path = require('path');
var esbuild = require('esbuild');

var projectRoot = path.resolve(__dirname, '..');
var options = {
  entryPoints: [path.join(projectRoot, 'example', 'app.js')],
  outfile: path.join(projectRoot, 'example', 'dist', 'app.bundle.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2017'],
  minify: true,
  sourcemap: false,
  charset: 'utf8',
  legalComments: 'none',
  loader: {
    '.html': 'text',
    '.css': 'text'
  }
};

async function main() {
  if (process.argv.indexOf('--watch') !== -1) {
    var context = await esbuild.context(options);
    await context.watch();
    console.log('Observando JavaScript, HTML e CSS dos componentes...');
    return;
  }

  var result = await esbuild.build(options);
  var output = path.relative(projectRoot, options.outfile);
  console.log('Bundle criado: ' + output + ' (' + result.errors.length + ' erros)');
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
