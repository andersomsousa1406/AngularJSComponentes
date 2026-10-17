#!/usr/bin/env node
'use strict';

var path = require('path');
var tools = require('../lib/project-tools');
var buildProject = require('../lib/build-project').buildProject;

function relative(config, target) {
  return path.relative(config.root, target) || '.';
}

function printCheck(result) {
  result.warnings.forEach(function (message) { console.warn('aviso: ' + message); });
  result.errors.forEach(function (message) { console.error('erro: ' + message); });
  if (result.errors.length) {
    process.exitCode = 1;
    return;
  }
  console.log(result.components.length + ' componentes verificados.');
}

function help() {
  console.log([
    'AngularJS Easy Components CLI',
    '',
    'Uso:',
    '  easy-components create <nome>  cria JS, HTML, CSS e teste',
    '  easy-components sync           atualiza catalogo, metadados HTML e valida',
    '  easy-components registry       atualiza somente o catalogo de imports',
    '  easy-components custom-data    atualiza somente os metadados do VS Code',
    '  easy-components check          valida componentes sem alterar arquivos',
    '  easy-components build          gera bundle, sourcemap e relatorio de orcamento',
    '',
    'Configure caminhos em package.json > easyComponents.'
  ].join('\n'));
}

async function main(argv) {
  var command = argv[2];
  var config = tools.loadConfig(process.cwd());
  var components;

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    help();
    return;
  }

  if (command === 'create') {
    if (!argv[3]) throw new Error('Informe o nome: easy-components create <nome>');
    var created = tools.createComponent(config, argv[3]);
    components = tools.discoverComponents(config);
    tools.generateRegistry(config, components);
    tools.generateCustomData(config, components);
    console.log('Componente criado: ' + relative(config, created.directory));
    console.log('Catalogo e metadados atualizados.');
    return;
  }

  components = tools.discoverComponents(config);
  if (command === 'registry') {
    tools.generateRegistry(config, components);
    console.log('Catalogo atualizado: ' + relative(config, config.registry));
    return;
  }
  if (command === 'custom-data') {
    tools.generateCustomData(config, components);
    console.log('Metadados atualizados: ' + relative(config, config.customData));
    return;
  }
  if (command === 'check') {
    printCheck(tools.checkProject(config, components));
    return;
  }
  if (command === 'sync') {
    tools.generateRegistry(config, components);
    tools.generateCustomData(config, components);
    console.log('Catalogo atualizado: ' + relative(config, config.registry));
    console.log('Metadados atualizados: ' + relative(config, config.customData));
    printCheck(tools.checkProject(config, components));
    return;
  }
  if (command === 'build') {
    tools.generateRegistry(config, components);
    tools.generateCustomData(config, components);
    var result = await buildProject(config, {
      watch: argv.indexOf('--watch') !== -1,
      onReport: function (report) {
        console.log('Bundle: ' + report.bytes + ' bytes (' + report.gzipBytes + ' gzip).');
      }
    });
    if (result.watching) console.log('Observando componentes...');
    else console.log('Relatorio: ' + relative(config, config.build.report));
    return;
  }

  throw new Error('Comando desconhecido: ' + command);
}

main(process.argv).catch(function (error) {
  console.error('erro: ' + error.message);
  process.exitCode = 1;
});
