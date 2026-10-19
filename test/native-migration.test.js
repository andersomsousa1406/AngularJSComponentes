'use strict';

var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');
var esbuild = require('esbuild');
var root = path.resolve(__dirname, '..');
function copy(value) {
  if (Array.isArray(value)) return value.map(copy);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(function (entry) { return [entry[0], copy(entry[1])]; }));
  return value;
}
function load(name) {
  var code = esbuild.buildSync({ entryPoints: [path.join(root, 'legacy-migration/services', name + '.js')], bundle: true, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
  var context = { module: { exports: {} }, exports: {}, angular: { copy: copy }, URL: URL };
  vm.runInNewContext(code, context); return context.module.exports;
}
function json(value) { return JSON.parse(JSON.stringify(value)); }
function deferred() { var resolve, reject; var promise = new Promise(function (yes, no) { resolve = yes; reject = no; }); return { resolve: resolve, reject: reject, promise: promise }; }
async function main() {
  var deviceModule = load('device-client');
  var calls = [];
  var client = deviceModule.createDeviceClient(function (options) { calls.push(options); return Promise.resolve({ result: [JSON.stringify({ OK: 1 })] }); });
  assert.deepEqual(json(await client.imprimirEtiqueta(42)), { valido: true, retorno: { OK: 1 } });
  assert(calls[0].url.endsWith('/imprimirEtiqueta/' + encodeURIComponent('{"CODIGO":42}')));
  var originalFactory;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'old_componentes/componentes/Devices.js'), 'utf8'), {
    window: { angular: {} }, AngularFindModule: { factory: function (_, factory) { originalFactory = factory; } }
  });
  var Constructor = originalFactory(null, null, function (executor) { return new Promise(executor); });
  var original = new Constructor();
  var commands = ['imprimirEtiqueta', 'imprimirCupom', 'imprimirCheque', 'imprimirEspelhoPonto', 'imprimirRelatorio', 'htmlToPDF', 'ligarBalanca', 'desligarBalanca', 'pesoBalanca', 'conectarHenry', 'conectarInner', 'lerPedidoBihands', 'getImpressoras', 'postImpressoras1'];
  for (var name of commands) {
    function invoke(owner) {
      var request;
      ['execComando', 'execComando2', 'execComandoProgress'].forEach(function (method) {
        owner[method] = function (url, payload) { request = { method: method, url: url, payload: payload }; return Promise.resolve({ valido: true }); };
      });
      owner[name]({ ID: 7 }); return json(request);
    }
    assert.deepEqual(invoke(original), invoke(deviceModule.createDeviceClient(function () {})), name);
  }
  console.log('OK: 14 contratos de comandos comparados com Devices original.');
  var progress = [];
  client = deviceModule.createDeviceClient(function () { return Promise.resolve({ error: 'falha' }); }, { onProgress: function (value) { progress.push(value); } });
  assert.equal((await client.htmlToPDF('documento')).valido, false);
  assert.deepEqual(progress, [100, 0]);
  client = deviceModule.createDeviceClient(function () { return Promise.reject({ status: 0 }); });
  assert.equal((await client.execComando('url')).valido, false);
  var requests = load('device-requests').createDeviceRequests(function (request) {
    calls.push(request); return Promise.resolve({ status: 'success', data: { peso: '1.25' } });
  }, { post: function () { return Promise.resolve({ VERSAO: 12 }); } });
  assert.equal(await requests.balanca.lerPeso(), '1.25');
  assert.equal(await requests.digital.digitaisVersao(2), 12);
  console.log('OK: envelope de dispositivos, progresso, erros e contratos de balanca/digitais.');

  var csv = load('csv');
  var parsed = csv.parseCsv('\uFEFFA;B\r\n1;"duas\nlinhas"\r\n2;"uma ""aspas"""', ';', true);
  assert.equal(parsed.rows[0].B, 'duas\nlinhas'); assert.equal(parsed.rows[1].B, 'uma "aspas"');
  assert.throws(function () { csv.parseCsv('A;A\n1;2', ';', true); }, /duplicados/);
  assert.throws(function () { csv.parseCsv('A;B\n1', ';', true); }, /divergente/);
  assert.throws(function () { csv.parseCsv('A\n"aberto', ';', true); }, /fechamento/);
  assert.throws(function () { csv.mapImportRows(parsed.rows, [{ CAMPO: 'ID', OBRIGATORIO: true }], {}); }, /obrigatórios/);
  assert.equal(csv.mapImportRows(parsed.rows, [{ CAMPO: 'ID', OBRIGATORIO: true }], { ID: 'A' })[0].ID, '1');
  console.log('OK: CSV com BOM, aspas escapadas, multiplas linhas, erros e mapeamento obrigatorio.');

  var lookupModule = load('lookup-client');
  var lookup = lookupModule.createLookupClient({ post: function (url, data) { calls.push({ url: url, data: data }); return Promise.resolve([{ ID: 1 }, { ID: 2 }]); } }, {
    cache: false, option: { obj_consulta: '/consulta', consulta_qtd: 2, infinite_scroll: true, obj_ret: ['ID'] }
  });
  lookup.Input.value = "O'Neil";
  await lookup.filtrar();
  var sent = calls[calls.length - 1].data;
  assert.equal(sent.FILTRO, "O''Neil"); assert.equal(sent.CONSULTA.PAGINA, 0);
  await lookup.onScrollEnd();
  assert.equal(calls[calls.length - 1].data.CONSULTA.PAGINA, 2); assert.equal(lookup.dados.length, 4);
  lookup.setDataRequest({ CLIENTE: [{ codigo: 7 }, 'codigo'] });
  assert.deepEqual(json(lookupModule.lookupRequest(lookup)), { FILTRO: "O''Neil", CLIENTE: 7 });
  var selected;
  lookup.onSelect = function (row) { selected = row.ID; };
  lookup.selecionarItem({ ID: 3 }); assert.equal(selected, 3); assert.equal(lookup.item.selected, true);
  lookup.apagar(false); assert.equal(lookup.item.selected, false);
  var first = deferred(), second = deferred(), count = 0;
  lookup = lookupModule.createLookupClient({ post: function () { return (++count === 1 ? first : second).promise; } }, { cache: false });
  var a = lookup.filtrar(); await Promise.resolve(); var b = lookup.filtrar(); await Promise.resolve();
  second.resolve([{ ID: 2 }, { ID: 3 }]); await b;
  first.resolve([{ ID: 1 }]); await a; assert.equal(lookup.dados[0].ID, 2);
  console.log('OK: payload de consulta, dependencias, selecao, paginacao e respostas fora de ordem.');

  var gridModule = load('grid-client');
  var columns = gridModule.normalizeColumns([{ CAMPO: 'ID' }, { CAMPO: 'ID', HIDDEN: true }, { CAMPO: 'NOME', VISIBLE: false }]);
  assert.notEqual(columns[0].id, columns[1].id);
  assert.equal(columns[1].visible, false); assert.equal(columns[2].visible, false);
  var grid = gridModule.createGridClient({ DADOS: [{ ID: 1, NOME: '<Ana>', VALOR: 2 }, { ID: 2, NOME: 'Bruno', VALOR: 3 }],
    COLUNAS: [{ CAMPO: 'NOME', DESCRICAO: 'Nome', VISIBLE: true }, { CAMPO: 'VALOR', DESCRICAO: 'Valor', TOTAL: true }] });
  assert.equal(grid.TotalTabela().VALOR, 5); grid.MarcarItens(); assert.equal(grid.counter_selected, 2);
  grid.DesmarcarItens(); assert.equal(grid.counter_selected, 0);
  assert(grid.exportHTML().includes('&lt;Ana&gt;')); assert(!grid.exportHTML().includes('<Ana>'));
  grid.filtro = 'bruno'; grid.FiltrarTabela(); assert.equal(grid.DADOS_RENDER.length, 1);
  assert(grid.exportCsv().includes('Bruno')); assert(!grid.exportCsv().includes('Ana'));
  grid.filtro = ''; grid.FiltrarTabela(); grid.groupBy = ['VALOR']; assert.equal(grid.groups().length, 2);
  assert.deepEqual(json(grid.next(grid.DADOS[0])), { ITEM: json(grid.DADOS[1]), POS: 2, PRIMEIRO: false, ULTIMO: true });
  console.log('OK: tabela filtra, agrupa, totaliza, marca, exporta e navega.');
  var menu = gridModule.gridMenu({ menu_drop: { GRUPOS: [{ DESC: 'Grupo A', OPCAO: [{ desc: 'Primeira' }] }, { DESC: 'Grupo B', OPCAO: [{ desc: 'Segunda' }] }] } });
  assert.deepEqual(json(menu).map(function (item) { return [item._MENU_TIPO, item._MENU_NUMERO || 0]; }), [['CABECALHO', 0], ['OPCAO', 1], ['CABECALHO', 0], ['OPCAO', 2]]);
  var style = gridModule.gridCellStyle({ CAMPO: 'VALOR', STYLE_OPT: { funcao: function (row) { return row.BLOQ_PED ? 'color:red' : ''; } }, STYLE_OPT_PARAM: { funcao: function (row, value) { return 'opacity:' + value; } }, PARAM_STYLE: 0.5 }, { BLOQ_PED: 1, ESTILOS_CALCULADOS: { VALOR: 'background:pink' } });
  assert(style.includes('color:red')); assert(style.includes('opacity:0.5')); assert(style.includes('background:pink'));
  var pageCalls = [], failPage = true;
  var pagedGrid = gridModule.createGridClient({ consulta_qtd: 2, infinite_scroll: true }, { load: function (request) {
    pageCalls.push(request.PAGINA);
    if (request.PAGINA === 2 && failPage) { failPage = false; return Promise.reject(new Error('sem rede')); }
    return Promise.resolve(request.PAGINA === 0 ? [{ ID: 1 }, { ID: 2 }] : [{ ID: 3 }]);
  } });
  await pagedGrid.loadPage(0, false); await assert.rejects(pagedGrid.NextPage(), /sem rede/);
  assert.equal(pagedGrid.consulta_pagina, 0); await pagedGrid.NextPage();
  assert.deepEqual(pageCalls, [0, 2, 2]); assert.equal(pagedGrid.DADOS.length, 3); assert.equal(pagedGrid.infinite_end, true);
  await pagedGrid.NextPage(); assert.equal(pageCalls.length, 3);
  console.log('OK: BTN3 agrupa e numera menus; estilos condicionais e pagina com falha preservam contratos.');

  var crudCalls = [];
  var crud = load('crud-client').createCrudClient({ post: function (url, data) {
    crudCalls.push({ url: url, data: copy(data) });
    if (url === '/listar') return Promise.resolve([{ ID: 1, DESCRICAO: 'Antes' }]);
    return Promise.resolve({ ID_RETURN: 1, DATA_RETURN: [{ ID: 1, DESCRICAO: data.DADOS.DESCRICAO }] });
  } }, { url_consultar: '/listar', url_gravar: '/gravar', url_excluir: '/excluir', confirmar_gravar: false, confirmar_cancelar: false, confirmar_excluir: false });
  await crud.consultar(); crud.SELECTED = crud.DADOS[0]; crud.alterar(); crud.SELECTED.DESCRICAO = 'Depois';
  await crud.cancelar(); assert.equal(crud.SELECTED.DESCRICAO, 'Antes');
  crud.alterar(); crud.SELECTED.DESCRICAO = 'Gravado'; await crud.gravar();
  assert.equal(crudCalls[1].url, '/gravar'); assert.equal(crud.DADOS[0].DESCRICAO, 'Gravado'); assert.equal(crud.ALTERANDO, false);
  await crud.excluir(); assert.equal(crud.DADOS.length, 0);
  crud.onValidarIncluir = function () { crud.validar_incluir = false; }; crud.incluir(); assert.equal(crud.INCLUINDO, false);
  console.log('OK: CRUD consulta, backup, cancelamento, gravacao, exclusao e veto por hook.');

  var filesModule = load('file-client'), revoked = [];
  var fileRequests = [];
  var files = filesModule.createFileClient({ post: function (url, data) { fileRequests.push(data); return Promise.resolve([{ ID: 9, ARQUIVO: 'teste.txt', EXTENSAO: 'txt', CAMINHO: '/teste.txt' }]); } }, { TABELA: 'LAB' }, {
    createObjectURL: function () { return 'blob:local-' + fileRequests.length; }, revokeObjectURL: function (url) { revoked.push(url); }
  });
  await files.getFiles('LAB', 7);
  assert.deepEqual(json(fileRequests[0]), { FILTRO: {}, TABELA: 'LAB', TABELA_ID: 7 });
  files.backup(); files.excluirArquivo(files.data[0]); assert.equal(files.data_excluir[0].ID, 9);
  files.restore(); assert.equal(files.data.length, 1); assert.equal(files.data_excluir.length, 0);
  files.receive([{ name: 'foto.png', size: 100, type: 'image/png' }]);
  files.excluirArquivo(files.data[1]); assert.equal(revoked.length, 1);
  var pendingFiles = deferred();
  files = filesModule.createFileClient({ post: function () { return pendingFiles.promise; } }, {}, {});
  var loadingFiles = files.getFiles('LAB', 1); await Promise.resolve(); files.clear();
  pendingFiles.resolve([{ ID: 1, ARQUIVO: 'antigo.txt', EXTENSAO: 'txt' }]); await loadingFiles;
  assert.equal(files.data.length, 0); files.destroy();
  console.log('OK: arquivos preservam backup/exclusao, liberam URLs e ignoram carregamento cancelado.');

  var flowModule = load('flow-client');
  assert.deepEqual(json(flowModule.cleanFlowData({ rows: [{ ID: 1, $$hashKey: 'x' }], callback: function () {} })), { rows: [{ ID: 1 }] });
  var flowCalls = [];
  var flow = flowModule.createFlowClient({ post: function (url, data) { flowCalls.push({ url: url, data: copy(data) }); return Promise.resolve([]); } });
  flow.TAREFA_SELECTED = { ID: 1 }; await flow.opcaoRecusar();
  assert.equal(flowCalls[0].data.OPCAO_TAREFA, 2); assert.equal(flow.loginOpen, true);
  await assert.rejects(flow.validarUsuario(), /credencial/);
  flow.SENHA_INFORMADA = 'simulada'; flow.MOTIVO_RECUSA = 'curto'; await assert.rejects(flow.validarUsuario(), /10 caracteres/);
  console.log('OK: fluxo limpa dados, preserva opcao da tarefa e valida credencial/motivo.');

  var epc = load('epc-client').createEpcClient({ post: function () { return Promise.resolve([]); } });
  epc.iniciar({ conferencia: true, itens: [{ MODELO_ID: 1, COR_ID: 2, TAMANHO: 40, QUANTIDADE: 1 }] });
  assert.equal(epc.QUANTIDADE_TOTAL_CONFERIR, 1);
  epc.addListaItens({ EPC: '123456789012345678901234', MODELO_ID: 1, COR_ID: 2, TAMANHO: 40 });
  assert.equal(epc.QUANTIDADE_TOTAL_CONFERIDA, 1); assert.equal(epc.ITENS_LISTA[0].STATUS, 1);
  assert.equal(epc.validarItemConferencia({ MODELO_ID: 1, COR_ID: 2, TAMANHO: 40 }).STATUS, false);
  await epc.gravar(); assert.equal(epc.open, false);
  console.log('OK: EPC confere quantidades, bloqueia item conferido e conclui a lista.');

  var commands = [];
  var speech = load('speech-client').createSpeechClient({ update: function (fn) { fn(); }, Recognition: function () { this.start = function () { this.onstart(); }; this.stop = function () { this.onend(); }; this.abort = function () {}; } }, {
    commands: [{ COMANDO: 'ABRIR MENU #VAR#', variaveis: 1, FUNCAO: function (values) { commands.push(values[0]); } }]
  });
  speech.comandoManual('abrir menu 19160'); assert.deepEqual(commands, ['19160']);
  speech.iniciar(); assert.equal(speech.executando, true); speech.stop(); assert.equal(speech.executando, false); speech.destroy();
  console.log('OK: voz reconhece comandos e descarta reconhecimento.');

  var xhrs = [], now = 1000;
  function Xhr() { this.open = function (method, url) { this.method = method; this.url = url; }; this.setRequestHeader = function () {}; this.send = function () { xhrs.push(this); }; this.abort = function () { this.onabort(); }; }
  var speed = load('speed-client').createSpeedClient({ XMLHttpRequest: Xhr, now: function () { return now; }, random: function () { return 0.5; } });
  var task = speed.testDownloadSpeed(); now += 1000;
  Object.assign(xhrs[0], { status: 200, responseText: 'abcd' }); xhrs[0].onload();
  assert.equal((await task).downloadSpeed, 32);
  task = speed.testLatency(); task.cancel(); await assert.rejects(task, function (error) { return error.status === -1; });
  console.log('OK: velocidade inclui duracao da transferencia e permite cancelamento.');
}
main().catch(function (error) { console.error(error); process.exitCode = 1; });
