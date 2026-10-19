'use strict';
// Execute original method bodies only as a test oracle, never in the native bundle.
var assert = require('node:assert/strict');
var vm = require('node:vm');
var path = require('node:path');
var esbuild = require('esbuild');
var read = require('../scripts/table-source');
var original = read();
function copy(value) {
  if (Array.isArray(value)) return value.map(copy);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(function (entry) { return [entry[0], copy(entry[1])]; }));
  return value;
}
var angular = { copy: copy, forEach: function (object, callback) { Object.keys(object).forEach(function (key) { callback(object[key], Array.isArray(object) ? Number(key) : key); }); } };
var oracleContext = vm.createContext({ angular: angular, window: { open: function () {} },
  trim_null: function (value) { return value == null ? '' : String(value).trim(); } });
// Exact helper used by the consuming project, helper/lib/helper.js:344 and :485.
vm.runInContext(`function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
function num_trunc(num, fixed) {
  if (!isNumber(num) || isNaN(num) || !isFinite(num)) num = 0;
  var re = new RegExp('^-?\\\\d+(?:.\\\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(re)[0];
}`, oracleContext);
function oldMethod(name) {
  var entry = original.entries.find(function (entry) { return entry.path === name; });
  assert(entry, name);
  var node = entry.node.type === 'Identifier' ? original.functions[entry.node.name] : entry.node;
  return vm.runInContext('(' + original.source.slice(node.start, node.end) + ')', oracleContext);
}
var bundle = esbuild.buildSync({ entryPoints: [path.resolve(__dirname, '../legacy-migration/services/grid-client.js')], bundle: true, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
var nativeContext = { module: { exports: {} }, exports: {}, angular: angular };
vm.runInNewContext(bundle, nativeContext);
var create = nativeContext.module.exports.createGridClient;
function json(value) { return JSON.parse(JSON.stringify(value)); }
var old = { isValid: oldMethod('isValid'), number_format: oldMethod('number_format'), format: oldMethod('format') };
var native = create({ DADOS: [] });
var count = 0;
var defaultCount = 0;
original.defaults.properties.forEach(function (property) {
  var name = property.key.name || property.key.value, value;
  if (['CallExpression', 'NewExpression', 'FunctionExpression'].includes(property.value.type)) return;
  if (property.value.type === 'Identifier' && property.value.name !== 'undefined') return;
  try { value = vm.runInNewContext('(' + original.source.slice(property.value.start, property.value.end) + ')'); } catch (_) { return; }
  assert(Object.prototype.hasOwnProperty.call(native, name), 'Estado original ausente: ' + name);
  assert.deepEqual(value === undefined ? undefined : json(native[name]), value === undefined ? undefined : json(value), 'Default divergente: ' + name);
  defaultCount++;
});
var values = [null, undefined, '', 'null', 'undefined', 0, false, true, '2026-10-19', '2026.10.19', '2026-10-19 08:32:32', '08:32:32', 1234.56789, -1234.56789, '0001.239', '+1.5', '.7', '1e-7', 'R$ 12,34'];
['string', 'number', 'date', 'timestamp', 'time', 'boolean'].forEach(function (type) {
  [0, 2, 4].forEach(function (decimals) {
    [{}, { PREFIXO: 'R$', SUFIXO: 'kg' }, { PREFIXO: '#MOEDA#', SUFIXO: '#UNIDADE#' }, { PREFIXO: '#AUSENTE#', INPUT: false }].forEach(function (affixes) {
      var column = Object.assign({ CAMPO: 'VALOR', TIPO: type, DECIMAL: decimals }, affixes), row = { MOEDA: 'USD', UNIDADE: 'PC' };
      values.forEach(function (value) { assert.deepEqual(native.format(value, column, row), old.format(value, column, row), JSON.stringify([type, decimals, value, affixes])); count++; });
    });
  });
});
['next', 'previous', 'nextReg', 'previousReg', 'first', 'last'].forEach(function (name) {
  [[], [{ ID: 1 }], [{ ID: 1 }, { ID: 2 }, { ID: 1 }], [{ ID: 1 }, { ID: '1' }, { ID: '' }]].forEach(function (rows) {
    var client = create({ DADOS: copy(rows) });
    rows.concat([{ ID: 1, EXTRA: 1 }, { ID: 999 }, {}]).forEach(function (row) {
      assert.deepEqual(json(client[name](row)), json(oldMethod(name).call({ DADOS: rows }, row)), name + ': ' + JSON.stringify([rows, row])); count++;
    });
  });
});
[-1, 0, 1, 2, '', '1', '01', true, null, undefined].forEach(function (value) { assert.equal(native.setChangeCheck(value), oldMethod('setChangeCheck')(value)); count++; });
var origin = [{ ID: 1, GRUPO: 'A', VALOR: 'antes' }, { ID: 1, GRUPO: 'B' }, { ID: 2 }];
var rows = [{ ID: '1', GRUPO: 'A', VALOR: 'depois' }, { ID: 1, GRUPO: 'A', VALOR: 'nao usar' }];
var oldOrigin = copy(origin), newOrigin = copy(origin);
assert.equal(native.MergeDados(newOrigin, rows, ['ID', 'GRUPO']), newOrigin);
assert.equal(oldMethod('MergeDados').call({}, oldOrigin, rows, ['ID', 'GRUPO']), oldOrigin);
assert.deepEqual(newOrigin, oldOrigin);
var columns = [{ CAMPO: 'A', CHECKED: 1, VISIBLE: false }, { CAMPO: 'B', CHECKED: 0, VISIBLE: true }];
var oldState = { COLUNAS: copy(columns), filtro_visible: true }, nativeState = create({ COLUNAS: copy(columns), filtro_visible: true });
oldMethod('setVisible').call(oldState); nativeState.setVisible();
assert.deepEqual(json(nativeState.COLUNAS), oldState.COLUNAS); assert.deepEqual(json(nativeState.campos_filtro), json(oldState.campos_filtro));
var oldTasks = [], newTasks = [];
oracleContext.$timeout = function (callback, delay) { oldTasks.push({ callback: callback, delay: delay }); return oldTasks.length; };
oracleContext.$timeout.cancel = function () {};
var mergeConfig = { COLUNAS: [{ CAMPO: 'VALOR', TIPO: 'number', URL_LINK: '/registro/#ID#?v=#VALOR#' }], consulta_qtd: 2, infinite_scroll: true, model_tabela: {} };
var oldMergeState = create(copy(mergeConfig)), newMergeState = create(copy(mergeConfig), { schedule: function (callback, delay) { newTasks.push({ callback: callback, delay: delay }); } });
oldMergeState.apagar = oldMethod('apagar');
var oldFinished = 0, newFinished = 0;
oldMergeState.onMergeEnd = function () { oldFinished++; }; newMergeState.onMergeEnd = function () { newFinished++; };
function snapshot(table) { return json({ DADOS: table.DADOS, total_dados: table.total_dados, infinite_end: table.infinite_end,
  consulta_pagina: table.consulta_pagina, array_numericos: table.array_numericos, operacao_merge_gravar: table.operacao_merge_gravar, consultando: table.consultando,
  FILTER: table.FILTRO, MODEL_DADOS: table.model_tabela.DADOS }); }
[
  { page: 0, rows: [{ ID: 1, VALOR: '1.23' }, { ID: 2, VALOR: '2' }] },
  { page: 1, rows: [{ ID: 3, VALOR: '3' }, { ID: 4, VALOR: '4' }] },
  { page: 2, rows: [{ ID: 5, VALOR: '5' }] },
  { page: 3, rows: [{ ID: 6, VALOR: '6' }, { ID: 7, VALOR: '7' }] },
  { page: 1, save: true, rows: [{ ID: 8, VALOR: '8' }] }
].forEach(function (test) {
  oldMergeState.consulta_pagina = newMergeState.consulta_pagina = test.page;
  oldMergeState.operacao_merge_gravar = newMergeState.operacao_merge_gravar = !!test.save;
  oldMethod('merge').call(oldMergeState, copy(test.rows)); newMergeState.merge(copy(test.rows));
  assert.deepEqual(snapshot(newMergeState), snapshot(oldMergeState), 'Estado de merge: ' + JSON.stringify(test));
});
assert.equal(oldFinished, 0); assert.equal(newFinished, 0);
oldTasks.forEach(function (task) { assert.equal(task.delay, 300); task.callback(); });
newTasks.forEach(function (task) { assert.equal(task.delay, 300); task.callback(); });
assert.equal(newFinished, oldFinished); assert.equal(newFinished, 5);
var checklistOld = create({ DADOS: [{ ID: 1 }, { ID: 2 }] }), checklistNew = create({ DADOS: [{ ID: 1 }, { ID: 2 }] });
oracleContext.console = { log: function () {} };
oldMethod('setTableCheckList').call(checklistOld, 'ID', 'item'); checklistNew.setTableCheckList('ID', 'item');
function checklistState(table) { return json({ rows: table.DADOS, marked: table.ITENS_MARCADOS, input: table.input_visible, status: table.status_visible, model: table.campo_model }); }
[true, false, true].forEach(function (checked) {
  checklistOld.DADOS[0].CHECKED = checklistNew.DADOS[0].CHECKED = checked;
  checklistOld.CheckSelect(checklistOld.DADOS[0]); checklistNew.CheckSelect(checklistNew.DADOS[0]);
  assert.deepEqual(checklistState(checklistNew), checklistState(checklistOld));
});
oldMethod('disableTableCheckList').call(checklistOld); checklistNew.disableTableCheckList();
assert.deepEqual(checklistState(checklistNew), checklistState(checklistOld));
[null, undefined, [], ['#fff'], ['#fff', '#000'], Array.from({ length: 7 }, function (_, index) { return '#' + index; })].forEach(function (colors) {
  assert.equal(native.gerar_gradiente(colors), oldMethod('gerar_gradiente')(colors));
});
var oldOpened = [], newOpened = [];
oracleContext.window.open = function (url, target) { oldOpened.push([url, target]); };
var nativeLinks = create({}, { open: function (url, target) { newOpened.push([url, target]); } });
[undefined, [], [{ PARAM: 'ID', CAMPO: 'ID' }], [{ PARAM: 'ID', CAMPO: 'AUSENTE', VALUE: 'fallback' }]].forEach(function (parameters) {
  oldMethod('open_link')('/registro/#ID#', parameters, { ID: 7 }); nativeLinks.open_link('/registro/#ID#', parameters, { ID: 7 });
});
assert.deepEqual(newOpened, oldOpened);
console.log('OK: ' + defaultCount + ' defaults originais, ' + count + ' casos diferenciais e contratos de merge incremental, callback, checklist, MergeDados e setVisible.');
