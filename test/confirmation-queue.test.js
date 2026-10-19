'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var esbuild = require('esbuild');
var root = path.resolve(__dirname, '..');
function copy(value) {
  if (Array.isArray(value)) return value.map(copy);
  if (value && typeof value === 'object') {
    var result = {};
    Object.keys(value).forEach(function (key) { result[key] = copy(value[key]); });
    return result;
  }
  return value;
}
function clock() {
  var tasks = new Map();
  var id = 0;
  function schedule(callback, delay) { tasks.set(++id, { callback: callback, delay: delay || 0 }); return id; }
  schedule.cancel = function (timer) { return tasks.delete(timer); };
  return {
    schedule: schedule,
    count: function () { return tasks.size; },
    tick: function (delay) {
      Array.from(tasks).forEach(function (entry) {
        if (entry[1].delay === delay && tasks.delete(entry[0])) entry[1].callback();
      });
    }
  };
}
var compiled = esbuild.buildSync({
  entryPoints: [path.join(root, 'legacy-migration/components/gc-confirm-dialog/confirmation-queue.js')],
  bundle: true, write: false, format: 'cjs', platform: 'node'
}).outputFiles[0].text;
var context = { exports: {}, module: { exports: {} }, angular: { copy: copy } };
vm.runInNewContext(compiled, context);
var createQueue = context.module.exports.createConfirmationQueue;

function original(timer) {
  var factory;
  var angularStub = { copy: copy, forEach: function (items, fn) { items.forEach(fn); } };
  var scope = { $new: function () { return { $on: function () {}, $destroy: function () {} }; } };
  var element = {
    length: 1, find: function () { return element; }, first: function () { return element; },
    append: function () {}, scope: function () { return scope; }, html: function () {},
    contents: function () { return []; }, remove: function () {}, focus: function () {},
    val: function () {}, css: function () {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'old_componentes/componentes/Confirmacao.js'), 'utf8'), {
    window: { angular: angularStub }, AngularFindModule: { factory: function (name, value) { factory = value; } },
    angular: angularStub,
    $: function () { return element; }, setTimeout: function () {}, showErro: function (message) { throw new Error(message); }
  });
  var Constructor = factory({}, {}, {}, function () { return function () { return element; }; }, {}, {}, timer.schedule, {}, { childScopes: [] });
  return new Constructor().getNew('vm.confirmacao');
}
function scenario(create) {
  var timer = clock();
  var errors = [];
  var queue = create(timer, errors);
  queue.model = 'vm.confirmacao';
  var calls = [];
  var buttons = [copy(queue.obtn_sim), copy(queue.obtn_nao)];
  buttons[0].aguardar2 = true;
  buttons[0].TEMPO_AGUARDAR = 3;
  var callbacks = [function (event, button) { calls.push([event.marker, button.ret]); }, function () {}];
  var dialog = queue.add(2, 'Titulo', '#MODEL# e #MODEL#', buttons, callbacks, 'N', 'classe', 'modal-lg');
  var result = {
    model: dialog.model, pergunta: dialog.pergunta, tipo: dialog.tipo, titulo: dialog.titulo,
    autoClose: dialog.alto_fechar,
    buttons: buttons.map(function (button) {
      return { desc: button.desc, ret: button.ret, wait: button.TEMPO_AGUARDAR, aguardar: button.aguardar, aguardar2: button.aguardar2 };
    })
  };
  timer.tick(1000); timer.tick(1000);
  buttons[1].executar({ marker: 'evento', target: { focus: function () {} } }, buttons[1]);
  timer.tick(0);
  result.calls = calls;
  result.waitAfter = buttons[1].TEMPO_AGUARDAR;
  assert.strictEqual(errors.length, 0);
  return JSON.parse(JSON.stringify(result));
}
assert.deepStrictEqual(scenario(function (timer) { return original(timer); }), scenario(function (timer, errors) {
  return createQueue(timer.schedule, timer.schedule.cancel, function () {}, function (error) { errors.push(error); });
}));
console.log('OK: contrato diferencial de ordem, callbacks, modelo, defaults e contagem regressiva.');

var timer = clock();
var errors = [];
var queue = createQueue(timer.schedule, timer.schedule.cancel, function () {}, function (error) { errors.push(error); });
var button = copy(queue.obtn_ok);
button.aguardar2 = true; button.TEMPO_AGUARDAR = 3;
var calls = 0;
var dialog = queue.add(2, 'Titulo', 'Pergunta', [button], [function () { calls++; }]);
dialog.botao[0].executar({}, dialog.botao[0]);
timer.tick(0);
assert.strictEqual(calls, 0, 'Botao bloqueado nao pode executar callback.');
dialog.hide(); assert.strictEqual(dialog.hidden, true);
dialog.show(); assert.strictEqual(dialog.hidden, false);
queue.closeAll(); assert.strictEqual(dialog.closed, true);
assert.strictEqual(timer.count(), 0, 'Fechar deve cancelar timers do dialogo.');
var failure = new Error('callback');
var failing = queue.add(1, '', '', [queue.obtn_ok], [function () { throw failure; }]);
failing.botao[0].executar({}, failing.botao[0]); timer.tick(0);
assert.strictEqual(errors[0], failure);
queue.add(1, '', '', [button], [function () {}]);
queue.destroy(); assert.strictEqual(timer.count(), 0);
assert.throws(function () { queue.add(1, '', '', [], []); }, /destruida/);
console.log('OK: bloqueio, visibilidade, fechamento, erros e descarte de timers.');
