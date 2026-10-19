'use strict';
var fs = require('fs');
var path = require('path');
var read = require('./table-source');
var root = path.resolve(__dirname, '..'), original = read();
var destination = fs.readFileSync(path.join(root, 'legacy-migration/services/grid-client.js'), 'utf8');
var methods = new Set();
var acorn = require('acorn');
original.visit(acorn.parse(destination, { ecmaVersion: 'latest', sourceType: 'module' }), function (node) {
  if (node.type === 'Property' && node.value && (/FunctionExpression/.test(node.value.type) || node.value.type === 'Identifier')) methods.add(node.key.name || node.key.value);
});
// Presence is deliberately not parity approval. Every original entry is retained.
var report = { source: 'old_componentes/componentes/TabelaJS.js', sourceHash: original.hash, complete: false,
  entries: original.entries.map(function (entry) {
    var result = Object.assign({}, entry); delete result.node;
    result.status = result.type === 'method' ? methods.has(result.path) ? 'presente-sem-aprovacao-integral' : 'sem-correspondencia-direta' : 'default-a-conferir';
    return result;
  }) };
report.totals = { entries: report.entries.length, methods: report.entries.filter(function (entry) { return entry.type === 'method'; }).length,
  withoutDirectMethod: report.entries.filter(function (entry) { return entry.status === 'sem-correspondencia-direta'; }).length };
fs.writeFileSync(path.join(root, 'legacy-migration/parity/table-conversion.generated.json'), JSON.stringify(report, null, 2) + '\n');
var lines = ['# Conversao direta de TabelaJS', '', 'Fonte integral: `' + report.source + '`; SHA256 `' + original.hash + '`.', '',
  '**Incompleta.** Presenca de metodo ou estado nao comprova equivalencia. O inventario inclui todos os membros de default_table, objetos aninhados e colunas padrao; metodos dinamicos criados durante execucao exigem verificacao adicional.', '',
  '| Membro original | Tipo | Linhas | Situacao |', '| --- | --- | --- | --- |'];
report.entries.forEach(function (entry) { lines.push('| `' + entry.path + '` | ' + entry.type + ' | ' + entry.line + '–' + entry.endLine + ' | ' + entry.status + ' |'); });
fs.writeFileSync(path.join(root, 'legacy-migration/parity/TABLE-CONVERSION.generated.md'), lines.join('\n') + '\n');
console.log(JSON.stringify(report.totals));
if (process.argv.includes('--require-complete')) { console.error('Conversao direta de TabelaJS ainda nao concluida.'); process.exitCode = 1; }
