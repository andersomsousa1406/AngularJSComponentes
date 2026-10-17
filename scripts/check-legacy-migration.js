'use strict';

var fs = require('fs');
var path = require('path');
var tools = require('../lib/project-tools');
var root = path.resolve(__dirname, '..');
var componentsDir = path.join(root, 'legacy-migration/components');
var config = { root: root, componentsDir: componentsDir };
var result = tools.checkProject(config);
var expected = [
  'gc-confirm-dialog', 'gc-data-grid', 'gc-file-import', 'gc-file-manager',
  'gc-history-panel', 'gc-legacy-host', 'gc-lookup', 'gc-multi-lookup', 'gc-operation-flow', 'gc-smart-input'
];
var selectors = result.components.map(function (component) { return component.selector; }).sort();

if (JSON.stringify(selectors) !== JSON.stringify(expected.slice().sort())) {
  result.errors.push('Catalogo migrado inesperado: ' + selectors.join(', ') + '.');
}

result.components.forEach(function (component) {
  var source = fs.readFileSync(component.filePath, 'utf8');
  ['$compile', 'AngularFindModule', "$('#main", 'gScope.childScopes'].forEach(function (pattern) {
    if (source.indexOf(pattern) !== -1) result.errors.push(component.relativePath + ': ainda usa o padrao legado ' + pattern + '.');
  });
});

result.warnings.forEach(function (warning) { console.warn('aviso: ' + warning); });
if (result.errors.length) {
  result.errors.forEach(function (error) { console.error('erro: ' + error); });
  process.exitCode = 1;
} else {
  console.log(result.components.length + ' componentes migrados validados sem padroes legados.');
}
