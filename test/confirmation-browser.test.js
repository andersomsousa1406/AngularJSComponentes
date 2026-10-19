'use strict';

// Dependency-free browser check; run with Node 22+ (built-in WebSocket).
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var os = require('node:os');
var http = require('node:http');
var spawn = require('node:child_process').spawn;
var root = path.resolve(__dirname, '..');
var labMode = process.argv.includes('--lab');
var screenshotMode = process.argv.includes('--screenshot');
var browser = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(fs.existsSync);
var pause = function (ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); };
async function main() {
  assert(browser, 'Chrome/Edge necessario.');
  assert.equal(typeof WebSocket, 'function', 'Usar Node 22+ para este teste.');
  var server = http.createServer(function (request, response) {
    var file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path.relative(root, file).startsWith('..')) { response.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, function (error, contents) {
      if (error) { response.writeHead(404).end(); return; }
      var types = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html' };
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.end(contents);
    });
  });
  var profile = fs.mkdtempSync(path.join(os.tmpdir(), 'easy-confirm-browser-'));
  var process;
  var socket;
  try {
    await new Promise(function (resolve) { server.listen(0, '127.0.0.1', resolve); });
    process = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    var active = path.join(profile, 'DevToolsActivePort');
    for (var i = 0; i < 200 && !fs.existsSync(active); i++) await pause(50);
    assert(fs.existsSync(active), 'Browser nao iniciou.');
    var port = fs.readFileSync(active, 'utf8').split('\n')[0];
    var pages = await (await fetch('http://127.0.0.1:' + port + '/json')).json();
    socket = new WebSocket(pages.find(function (page) { return page.type === 'page'; }).webSocketDebuggerUrl);
    await new Promise(function (resolve, reject) { socket.addEventListener('open', resolve); socket.addEventListener('error', reject); });
    var next = 0;
    var pending = new Map();
    var exceptions = [];
    var requests = [];
    socket.addEventListener('message', function (event) {
      var message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
      if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
      if (pending.has(message.id)) {
        var callback = pending.get(message.id); pending.delete(message.id);
        if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
        else callback.resolve(message.result);
      }
    });
    function call(method, params) {
      return new Promise(function (resolve, reject) {
        var id = ++next; pending.set(id, { resolve: resolve, reject: reject });
        socket.send(JSON.stringify({ id: id, method: method, params: params || {} }));
      });
    }
    async function evaluate(expression) {
      var result = await call('Runtime.evaluate', { expression: expression, returnByValue: true, awaitPromise: true });
      assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
      return result.result.value;
    }
    await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
    await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: 'http://127.0.0.1:' + server.address().port + '/legacy-migration/' + (labMode ? 'lab.html' : '') });
    var ready;
    for (i = 0; i < 200; i++) {
      ready = await evaluate(labMode ? "!!(window.angular && document.querySelector('migration-lab .lab-shell'))" : "!!(window.angular && document.querySelector('legacy-demo-root .gc-demo'))");
      if (ready) break;
      await pause(50);
    }
    assert(ready, 'Demo nao montou.');
    if (labMode) {
      var labResult = await evaluate(`(async function () {
        var element = document.querySelector('migration-lab');
        var scope = angular.element(element).isolateScope();
        var app = scope.vm;
        function digest() { if (!scope.$root.$$phase) scope.$root.$digest(); }
        await app.handles.lookup.filtrar(); digest();
        var lookupCount = app.handles.lookup.dados.length;
        await app.handles.lookup.onScrollEnd(); digest();
        var pagedCount = app.handles.lookup.dados.length;
        app.handles.grid.MarcarItens(); digest();
        var marked = app.handles.grid.counter_selected;
        app.handles.grid.DesmarcarItens();
        app.handles.grid.setVisible('CIDADE', false); digest();
        var hidden = app.handles.grid.COLUNAS.find(function (col) { return col.CAMPO === 'CIDADE'; }).VISIBLE === false;
        app.handles.grid.restaurarColunas();
        await app.crud.consultar(); app.crud.SELECTED = app.crud.DADOS[0]; app.crud.alterar();
        app.crud.SELECTED.DESCRICAO = 'Alterado no teste';
        app.crud.confirmar_gravar = false;
        await app.crud.gravar(); digest();
        var saved = app.crud.DADOS[0].DESCRICAO;
        await app.handles.files.getFiles('LAB', 1); digest();
        var loadedFiles = app.handles.files.data.length;
        app.handles.files.excluirArquivo(app.handles.files.data[0]); digest();
        var removedFiles = app.handles.files.data_excluir.length;
        var parsed = app.handles.importer.parseText('ID;NOME\\n1;"Ana; Lima"'); digest();
        app.handles.importer.importRows(); digest();
        var imported = app.events[0].data.rows[0].NOME;
        await app.handles.history.consultar(0); digest();
        var history = app.handles.history.DADOS.length;
        await app.handles.flow.executar(); await app.handles.flow.opcaoAprovar(); digest();
        var loginOpen = app.handles.flow.loginOpen;
        app.handles.flow.SENHA_INFORMADA = 'simulada'; await app.handles.flow.validarUsuario(); digest();
        app.speech.comandoManual('abrir menu 19160');
        app.epc.EPC_SIMPLIFICADO = '123456789012345678901234'; app.epc.AvaliarEPC({ key: 'Enter' });
        await app.sendDevice(); await app.runSpeed(); digest();
        app.backend.failNext = true;
        await app.refreshHistory(); digest();
        var handledError = app.error.includes('Falha simulada');
        app.openDialog(); digest();
        var confirmation = !!element.querySelector('.gc-confirm'); app.handles.confirm.closeAll(); digest();
        var overflow = [];
        app.tabs.forEach(function (tab) { app.active = tab.id; digest(); if (document.documentElement.scrollWidth > window.innerWidth + 2) overflow.push(tab.id); });
        return { lookupCount: lookupCount, pagedCount: pagedCount, marked: marked, hidden: hidden,
          saved: saved, loadedFiles: loadedFiles, removedFiles: removedFiles, parsed: parsed.rows.length,
          imported: imported, history: history, loginOpen: loginOpen, authenticated: !app.handles.flow.loginOpen,
          epcs: app.epc.ITENS_INCLUIR.length, speed: !!app.speed, handledError: handledError,
          confirmation: confirmation, noLegacyEngine: !window.GcLegacyEngine, overflow: overflow };
      }())`);
      assert.deepEqual(labResult, { lookupCount: 2, pagedCount: 4, marked: 5, hidden: true, saved: 'Alterado no teste',
        loadedFiles: 1, removedFiles: 1, parsed: 1, imported: 'Ana; Lima', history: 2, loginOpen: true,
        authenticated: true, epcs: 1, speed: true, handledError: true, confirmation: true, noLegacyEngine: true, overflow: [] });
      assert.deepEqual(exceptions, []);
      assert(requests.every(function (url) { return !/^https?:/.test(url) || url.startsWith('http://127.0.0.1:' + server.address().port + '/'); }), 'O laboratorio tentou acessar um servidor externo.');
      await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      var mobileOverflow = await evaluate(`(function () {
        var scope = angular.element(document.querySelector('migration-lab')).isolateScope();
        var overflow = [];
        scope.vm.tabs.forEach(function (tab) { scope.vm.active = tab.id; scope.$root.$digest(); if (document.documentElement.scrollWidth > 392) overflow.push(tab.id); });
        return overflow;
      }())`);
      assert.deepEqual(mobileOverflow, [], 'Abas com overflow em celular.');
      if (screenshotMode) {
        await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
        await evaluate("(function () { var scope = angular.element(document.querySelector('migration-lab')).isolateScope(); scope.vm.active = 'consulta'; scope.$root.$digest(); }())");
        var screenshot = await call('Page.captureScreenshot', { format: 'png' });
        var artifacts = path.join(root, 'test/artifacts'); fs.mkdirSync(artifacts, { recursive: true });
        fs.writeFileSync(path.join(artifacts, 'migration-lab.png'), Buffer.from(screenshot.data, 'base64'));
      }
      console.log('OK: laboratorio em navegador real valida consultas, tabela, CRUD, arquivos, CSV, historico, fluxo, EPC, voz, velocidade, erros e confirmacao sem motor antigo.');
      return;
    }
    var result = await evaluate(`(async function () {
      var injector = angular.element(document.querySelector('legacy-demo-root')).injector();
      var scope = injector.get('$rootScope').$new();
      var element = injector.get('$compile')('<gc-confirm-dialog></gc-confirm-dialog>')(scope);
      angular.element(document.body).append(element); scope.$digest();
      var queue = element.isolateScope().vm.dialogs;
      var received = null;
      queue.add(2, 'Contrato', 'Pergunta', [queue.obtn_ok], [function (event, button) { received = [event.type, button.ret]; }]);
      scope.$digest();
      var title = element[0].querySelector('.modal-title').textContent;
      element[0].querySelector('.modal-footer button').click();
      await new Promise(function (resolve) { setTimeout(resolve, 50); }); scope.$digest();
      var closed = !element[0].querySelector('.gc-confirm');
      scope.$destroy(); element.remove();
      return { title: title, received: received, closed: closed };
    }())`);
    assert.deepEqual(result, { title: 'Contrato', received: ['click', '1'], closed: true });
    assert.deepEqual(exceptions, []);
    console.log('OK: navegador real monta a fila, entrega callback e remove dialogo sem erros AngularJS.');
  } finally {
    if (socket) socket.close();
    if (process) {
      var stopped = new Promise(function (resolve) { process.once('exit', resolve); });
      process.kill(); await Promise.race([stopped, pause(3000)]);
    }
    server.closeAllConnections(); server.close();
    var tempRoot = fs.realpathSync(os.tmpdir());
    var resolvedProfile = fs.realpathSync(profile);
    assert(path.dirname(resolvedProfile).toLowerCase() === tempRoot.toLowerCase());
    try { fs.rmSync(resolvedProfile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }); }
    catch (cleanupError) { console.warn('O navegador ainda bloqueou o perfil temporario: ' + resolvedProfile); }
  }
}
var deadline = setTimeout(function () { console.error('Timeout do teste em navegador.'); process.exit(1); }, 45000);
main().catch(function (error) { console.error(error); process.exitCode = 1; }).finally(function () { clearTimeout(deadline); });
