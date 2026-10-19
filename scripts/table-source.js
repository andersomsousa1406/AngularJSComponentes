'use strict';
var fs = require('fs');
var path = require('path');
var acorn = require('acorn');
var crypto = require('crypto');
function visit(node, callback) {
  if (!node || typeof node !== 'object') return;
  callback(node);
  Object.keys(node).forEach(function (key) {
    if (key === 'loc') return;
    var value = node[key];
    if (Array.isArray(value)) value.forEach(function (child) { if (child && child.type) visit(child, callback); });
    else if (value && value.type) visit(value, callback);
  });
}
function read() {
  var file = path.resolve(__dirname, '../old_componentes/componentes/TabelaJS.js');
  var source = fs.readFileSync(file, 'utf8');
  var tree = acorn.parse(source, { ecmaVersion: 'latest', locations: true });
  var defaults, functions = {}, entries = [];
  visit(tree, function (node) {
    if (node.type === 'FunctionDeclaration' && node.id) functions[node.id.name] = node;
    if (node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression' && node.left.object.type === 'ThisExpression' && node.left.property.name === 'default_table') defaults = node.right;
  });
  if (!defaults) throw new Error('default_table original nao localizado.');
  function scan(object, prefix) {
    object.properties.forEach(function (property) {
      var key = property.key.name || property.key.value, name = prefix ? prefix + '.' + key : key;
      var value = property.value, method = /FunctionExpression/.test(value.type) || value.type === 'Identifier' && functions[value.name];
      entries.push({ path: name, type: method ? 'method' : 'property', line: property.loc.start.line, endLine: property.loc.end.line,
        hash: crypto.createHash('sha256').update(source.slice(value.start, value.end)).digest('hex'), node: value });
      if (value.type === 'ObjectExpression') scan(value, name);
      if (value.type === 'ArrayExpression') value.elements.forEach(function (item, index) { if (item && item.type === 'ObjectExpression') scan(item, name + '[' + index + ']'); });
    });
  }
  scan(defaults, '');
  return { source: source, defaults: defaults, functions: functions, entries: entries,
    hash: crypto.createHash('sha256').update(source).digest('hex'), visit: visit };
}
module.exports = read;
