'use strict';

var fs = require('fs');
var path = require('path');
var acorn = require('acorn');
var root = path.resolve(__dirname, '..');
var sourceDirectory = path.join(root, 'old_componentes', 'componentes');
var outputPath = path.join(root, 'legacy-migration', 'parity', 'legacy-api.generated.json');

var publicObjects = {
  'Arquivos.js': ['Arquivos.prototype'],
  'ArquivosGC.js': ['ArquivosGC.prototype'],
  'ArquivosJS.js': ['ArquivosJS.prototype'],
  'Confirmacao.js': ['obj.default'],
  'Consulta.js': ['obj_Consulta', 'Consulta.prototype'],
  'ConsultaBootstrap4.js': ['obj_Consulta', 'ConsultaBootstrap4.prototype'],
  'ConsultaBootstrap5.js': ['obj_Consulta', 'ConsultaBootstrap5.prototype'],
  'ConsultaMultipla.js': ['obj_ConsultaMultipla', 'ConsultaMultipla.prototype'],
  'ControllerService.js': ['defaultActions'],
  'FactoryDefault.js': ['obj.default_item'],
  'InputJS.js': ['this.default_input'],
  'SpeechRecognition.js': ['SpeechRecognition.prototype'],
  'TabelaHTML.js': ['this.default_table'],
  'TabelaJS.js': ['this.default_table']
};

function walk(node, visitor, parent) {
  if (!node || typeof node !== 'object') return;
  visitor(node, parent);
  Object.keys(node).forEach(function (key) {
    if (key === 'start' || key === 'end' || key === 'loc') return;
    var value = node[key];
    if (Array.isArray(value)) value.forEach(function (child) { if (child && child.type) walk(child, visitor, node); });
    else if (value && value.type) walk(value, visitor, node);
  });
}

function memberName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'ThisExpression') return 'this';
  if (node.type !== 'MemberExpression') return null;
  var object = memberName(node.object);
  var property = node.computed
    ? (node.property.type === 'Literal' ? String(node.property.value) : null)
    : memberName(node.property);
  return object && property ? object + '.' + property : null;
}

function propertyName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'Literal') return String(node.value);
  return null;
}

function isFunction(node, functionNames) {
  return !!node && (
    node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression' ||
    (node.type === 'Identifier' && functionNames[node.name])
  );
}

function objectEntries(node, prefix, functionNames, output) {
  if (!node || node.type !== 'ObjectExpression') return;
  node.properties.forEach(function (property) {
    if (property.type !== 'Property') return;
    var key = propertyName(property.key);
    if (!key) return;
    var name = prefix ? prefix + '.' + key : key;
    output.push({ path: name, type: isFunction(property.value, functionNames) ? 'method' : 'property' });
    if (property.value.type === 'ObjectExpression') objectEntries(property.value, name, functionNames, output);
  });
}

function unique(entries) {
  var found = {};
  entries.forEach(function (entry) {
    if (!found[entry.path] || entry.type === 'method') found[entry.path] = entry;
  });
  return Object.keys(found).sort().map(function (key) { return found[key]; });
}

function inventory(name) {
  var source = fs.readFileSync(path.join(sourceDirectory, name), 'utf8');
  var ast = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true });
  var functionNames = {};
  var factory = null;
  var candidates = [];
  var targets = publicObjects[name] || [];

  walk(ast, function (node) {
    if (node.type === 'FunctionDeclaration' && node.id) functionNames[node.id.name] = true;
    if (node.type === 'CallExpression' && node.callee && node.callee.type === 'MemberExpression' && propertyName(node.callee.property) === 'factory') {
      if (node.arguments[0] && node.arguments[0].type === 'Literal') factory = String(node.arguments[0].value);
    }
  });

  walk(ast, function (node) {
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && targets.indexOf(node.id.name) !== -1) {
      objectEntries(node.init, '', functionNames, candidates);
    }
    if (node.type === 'AssignmentExpression') {
      var left = memberName(node.left);
      if (targets.indexOf(left) !== -1) objectEntries(node.right, '', functionNames, candidates);
      if (/^(?:this|obj)\.[A-Za-z_$][\w$]*$/.test(left || '')) {
        candidates.push({ path: left.split('.')[1], type: isFunction(node.right, functionNames) ? 'method' : 'property' });
      }
    }
  });

  var entries = unique(candidates);
  var methods = entries.filter(function (entry) { return entry.type === 'method'; }).map(function (entry) { return entry.path; });
  var properties = entries.filter(function (entry) { return entry.type === 'property'; }).map(function (entry) { return entry.path; });
  return {
    factory: factory,
    lines: source.split(/\r?\n/).length,
    methods: methods,
    properties: properties,
    counts: { methods: methods.length, properties: properties.length, publicEntries: entries.length }
  };
}

var report = {
  generatedAt: new Date().toISOString(),
  source: 'old_componentes/componentes',
  files: {},
  totals: { files: 0, methods: 0, properties: 0, publicEntries: 0 }
};

fs.readdirSync(sourceDirectory).filter(function (name) { return /\.js$/.test(name); }).sort().forEach(function (name) {
  var result = inventory(name);
  report.files[name] = result;
  report.totals.files += 1;
  report.totals.methods += result.counts.methods;
  report.totals.properties += result.counts.properties;
  report.totals.publicEntries += result.counts.publicEntries;
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log('Inventario legado: ' + report.totals.files + ' arquivos, ' + report.totals.methods + ' metodos, ' + report.totals.properties + ' propriedades.');
['Consulta.js', 'TabelaJS.js'].forEach(function (name) {
  var counts = report.files[name].counts;
  console.log(name + ': ' + counts.methods + ' metodos, ' + counts.properties + ' propriedades.');
});
