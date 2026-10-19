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
var referenceMode = process.argv.includes('--22430');
var uiMode = process.argv.includes('--ui-kit');
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
    await call('Emulation.setFocusEmulationEnabled', { enabled: true });
    await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: 'http://127.0.0.1:' + server.address().port + (uiMode ? '/ui-kit/index.html' : '/legacy-migration/' + (referenceMode ? '22430.html' : labMode ? 'lab.html' : '')) });
    var ready;
    for (i = 0; i < 200; i++) {
      ready = await evaluate(uiMode ? "!!(window.angular && document.querySelector('g-catalog .catalog'))" : referenceMode ? "!!(window.angular && document.querySelector('reference-22430 .screen-22430') && document.querySelectorAll('gc-data-grid tbody tr').length === 50)" : labMode ? "!!(window.angular && document.querySelector('migration-lab .lab-shell'))" : "!!(window.angular && document.querySelector('legacy-demo-root .gc-demo'))");
      if (ready) break;
      await pause(50);
    }
    assert(ready, 'Demo nao montou.');
    if (uiMode) {
      var uiResult = await evaluate(`(async function () {
        var scope = angular.element(document.querySelector('g-catalog')).isolateScope(), app = scope.vm;
        function digest() { if (!scope.$root.$$phase) scope.$root.$digest(); }
        function input(element, value) { element.value = value; element.dispatchEvent(new Event('input', { bubbles: true })); digest(); }
        function choose(element, label) { element.value = Array.from(element.options).find(function (option) { return option.textContent === label; }).value; element.dispatchEvent(new Event('change', { bubbles: true })); digest(); }
        var preview = document.querySelector('.preview-button button'), before = app.events.length;
        app.disabled = true; digest(); preview.click(); digest(); var disabled = preview.disabled && app.events.length === before;
        app.disabled = false; app.previewLoading = true; digest(); preview.click(); var blockedLoading = preview.disabled && preview.getAttribute('aria-busy') === 'true' && preview.textContent.includes('Carregando');
        app.previewLoading = false; digest(); preview.click(); digest(); var click = app.events[0].text === 'Criar registro';
        choose(document.querySelector('.controls-grid g-select select'), 'success'); var color = app.color;
        document.querySelector('g-button-group button:nth-child(2)').click(); digest(); var group = app.view;
        document.querySelector('g-save-button button').click(); digest(); var saving = app.saving && document.querySelector('g-save-button button').disabled;
        await new Promise(function (resolve) { setTimeout(resolve, 750); }); digest(); var saved = !app.saving && app.events[0].text === 'Dados gravados';
        app.active = 'forms'; digest();
        input(document.querySelector('section[aria-label="Campos e buscas"] g-float-label-input input'), 'Ana Lima'); var name = app.name;
        input(document.querySelectorAll('section[aria-label="Campos e buscas"] g-float-label-input input')[1], 'invalido'); var error = !!document.querySelector('g-float-label-input [role=alert]');
        app.name = 'João'; digest(); var controlled = document.querySelector('g-float-label-input input').value === 'João';
        choose(document.querySelector('section[aria-label="Campos e buscas"] g-select select'), 'Produção'); var department = app.department;
        document.querySelector('section[aria-label="Campos e buscas"] g-switch input').click(); digest(); var switched = !app.notifications;
        var search = document.querySelector('g-search-home-input input'); search.focus(); input(search, 'producao');
        var results = document.querySelectorAll('g-search-home-input [role=option]').length;
        search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); digest();
        var selected = app.selectedModule.CONTROLE;
        app.modalOpen = true; digest(); await new Promise(function (resolve) { setTimeout(resolve, 30); }); digest();
        var dialog = document.querySelector('g-modal dialog'), opened = dialog.open && dialog.contains(document.activeElement);
        Array.from(dialog.querySelectorAll('footer button')).find(function (button) { return button.textContent.includes('Criar registro'); }).click(); digest();
        var rejectedEmpty = dialog.open && !!dialog.querySelector('[role=alert]');
        input(dialog.querySelector('input'), 'Modelo novo');
        Array.from(dialog.querySelectorAll('footer button')).find(function (button) { return button.textContent.includes('Criar registro'); }).click(); digest();
        await new Promise(function (resolve) { setTimeout(resolve, 30); }); digest(); var confirmed = !dialog.open && app.events[0].text === 'Registro criado: Modelo novo';
        app.modalOpen = true; digest(); await new Promise(function (resolve) { setTimeout(resolve, 30); });
        dialog.dispatchEvent(new Event('cancel', { cancelable: true })); digest(); await new Promise(function (resolve) { setTimeout(resolve, 30); }); var escaped = !dialog.open && !app.modalOpen;
        var toastCount = app.toast.items.length; document.querySelector('g-toast button').click(); digest(); var dismissed = app.toast.items.length === toastCount - 1;
        var temporary = app.toast.show('Temporária', '', 'info', 30); await new Promise(function (resolve) { setTimeout(resolve, 70); }); digest(); var expired = !app.toast.items.some(function (item) { return item.id === temporary; });
        app.active = 'feedback'; digest(); var progress = document.querySelector('g-loading progress').value;
        return { disabled: disabled, blockedLoading: blockedLoading, click: click, color: color, group: group, saving: saving, saved: saved, name: name, error: error,
          controlled: controlled, department: department, switched: switched, results: results, selected: selected, opened: opened, rejectedEmpty: rejectedEmpty, confirmed: confirmed, escaped: escaped, dismissed: dismissed, expired: expired, progress: progress };
      }())`);
      assert.deepEqual(uiResult, { disabled: true, blockedLoading: true, click: true, color: 'success', group: 'cards', saving: true, saved: true, name: 'Ana Lima', error: true,
        controlled: true, department: 'producao', switched: true, results: 1, selected: '22430', opened: true, rejectedEmpty: true, confirmed: true, escaped: true, dismissed: true, expired: true, progress: 65 });
      await evaluate("(async function () { var button = document.querySelector('main.content > g-toolbar button'); button.focus(); button.click(); await new Promise(function (resolve) { setTimeout(resolve, 30); }); }())");
      for (var tab = 0; tab < 6; tab++) {
        await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        assert(await evaluate("document.querySelector('g-modal dialog').contains(document.activeElement)"), 'Foco escapou do dialogo.');
      }
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      assert(await evaluate("(async function () { await new Promise(function (resolve) { setTimeout(resolve, 40); }); return !document.querySelector('g-modal dialog').open && document.activeElement === document.querySelector('main.content > g-toolbar button'); }())"), 'Escape ou restauracao de foco falhou.');
      await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      var uiOverflow = await evaluate(`(function () { var scope = angular.element(document.querySelector('g-catalog')).isolateScope(), bad = []; scope.vm.tabs.forEach(function (tab) { scope.vm.active = tab.id; scope.$root.$digest(); if (document.documentElement.scrollWidth > 391) bad.push(tab.id); }); return bad; }())`);
      assert.deepEqual(uiOverflow, []);
      assert.deepEqual(exceptions, []);
      assert(!requests.some(function (url) { return /legacy-migration|bootstrap/.test(url); }));
      assert(requests.every(function (url) { return !/^https?:/.test(url) || url.startsWith('http://127.0.0.1:' + server.address().port + '/'); }));
      if (screenshotMode) {
        await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
        await evaluate("(function () { var s = angular.element(document.querySelector('g-catalog')).isolateScope(); s.vm.active = 'buttons'; s.vm.color = 'primary'; s.vm.toast.items.forEach(function (item) { s.vm.toast.dismiss(item.id); }); s.$root.$digest(); window.scrollTo(0,0); }())");
        var uiScreenshot = await call('Page.captureScreenshot', { format: 'png' });
        fs.mkdirSync(path.join(root, 'test/artifacts'), { recursive: true }); fs.writeFileSync(path.join(root, 'test/artifacts/ui-kit.png'), Buffer.from(uiScreenshot.data, 'base64'));
      }
      console.log('OK: UI Kit valida botoes, carregamento, campos controlados, busca com teclado, select, switch, dialogo, toast, progresso e 4 abas em celular, sem componentes antigos.');
      return;
    }
    if (referenceMode) {
      var referenceResult = await evaluate(`(async function () {
        var scope = angular.element(document.querySelector('reference-22430')).isolateScope(), app = scope.vm;
        function digest() { if (!scope.$root.$$phase) scope.$root.$digest(); }
        var gridElement = document.querySelector('gc-data-grid');
        var gridVm = angular.element(gridElement).isolateScope().vm;
        var header = getComputedStyle(gridElement.querySelector('thead th')).backgroundColor;
        var blocked = Array.from(gridElement.querySelectorAll('tbody tr')).find(function (tr) { return tr.textContent.includes('007619'); });
        var blockedColor = getComputedStyle(blocked.querySelectorAll('td')[3]).color;
        var initial = app.grid.DADOS.length;
        await gridVm.loadMore(); digest(); var second = gridElement.querySelectorAll('tbody tr').length;
        var offset = app.backend.calls.at(-1).data.FILTRO.PAGINA;
        var viewport = gridElement.querySelector('.gc-data-grid__viewport');
        viewport.scrollTop = viewport.scrollHeight; viewport.dispatchEvent(new Event('scroll'));
        await new Promise(function (resolve) { setTimeout(resolve, 100); }); digest(); var last = app.grid.DADOS.length;
        var end = app.grid.infinite_end;
        viewport.scrollTop = 0;
        var firstButton = gridElement.querySelector('tbody .acoes button'); firstButton.click(); digest();
        var menu = !!gridElement.querySelector('.gc-data-grid__row-menu');
        gridElement.querySelector('.gc-data-grid__row-menu button').click(); digest();
        var callbackRow = app.filesRow.ID; app.filesRow = null;
        app.grid.setVisible('HINT_TIPO', true); digest();
        gridElement.querySelector('tbody .gc-data-grid__hint').click(); digest();
        var popover = gridElement.querySelector('.popover-content').textContent;
        gridVm.closeMenus(); app.grid.setVisible('HINT_TIPO', false); digest();
        app.form.FILTRO_DADOS = 'BODY'; await app.consultar(); digest(); var filtered = app.grid.DADOS.length;
        app.form.FILTRO_DADOS = ''; await app.consultar(); digest();
        await app.lookups.FAMILIA_ID.filtrar(); digest();
        var family = document.querySelectorAll('gc-lookup')[1];
        var familyHeaders = Array.from(family.querySelectorAll('th')).map(function (th) { return th.textContent; });
        app.lookups.FAMILIA_ID.selecionarItem(app.lookups.FAMILIA_ID.dados[0]); await app.consultar(); digest();
        var familyFilter = app.backend.calls.at(-1).data.FILTRO.FAMILIA_ID;
        app.lookups.FAMILIA_ID.clear(); digest();
        var cleared = app.grid.DADOS.length;
        app.backend.failNext = true; await app.consultar(); digest(); var failed = app.error.includes('Falha simulada');
        await app.consultar(); digest();
        return { header: header, blockedColor: blockedColor, initial: initial, second: second, offset: offset, last: last, end: end,
          menu: menu, callbackRow: callbackRow, popover: popover, filtered: filtered, familyHeaders: familyHeaders, familyFilter: familyFilter, cleared: cleared, failed: failed,
          declarations: app.grid.COLUNAS.length, motorLoaded: !!window.LegacyComponents };
      }())`);
      assert.deepEqual(referenceResult, { header: 'rgb(36, 75, 255)', blockedColor: 'rgb(169, 68, 66)', initial: 50, second: 100,
        offset: 50, last: 124, end: true, menu: true, callbackRow: 1, popover: 'PRODUTOS REVENDA', filtered: 2,
        familyHeaders: ['ID', 'DESCRIÇÃO', 'TIPO DO PRODUTO'], familyFilter: '0271', cleared: 0, failed: true, declarations: 27, motorLoaded: false });
      assert.deepEqual(exceptions, []);
      assert(requests.every(function (url) { return !/^https?:/.test(url) || url.startsWith('http://127.0.0.1:' + server.address().port + '/'); }));
      if (screenshotMode) {
        await call('Emulation.setDeviceMetricsOverride', { width: 1910, height: 900, deviceScaleFactor: 1, mobile: false });
        await evaluate("(async function () { var s = angular.element(document.querySelector('reference-22430')).isolateScope(); await s.vm.lookups.FAMILIA_ID.filtrar(); s.$root.$digest(); }())");
        var referenceScreenshot = await call('Page.captureScreenshot', { format: 'png' });
        fs.mkdirSync(path.join(root, 'test/artifacts'), { recursive: true });
        fs.writeFileSync(path.join(root, 'test/artifacts/22430.png'), Buffer.from(referenceScreenshot.data, 'base64'));
      }
      console.log('OK: 22430 valida 27 declaracoes, cores, status, BTN3/callback, consulta Familia, filtros, pagina 50/100/124 e falha sem rede externa.');
      return;
    }
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
      var gridAppearance = await evaluate(`(function () {
        var root = document.querySelector('migration-lab');
        var scope = angular.element(root).isolateScope(); scope.vm.active = 'tabela'; scope.$root.$digest();
        var grid = root.querySelector('section[aria-label="Tabela"] gc-data-grid');
        var controller = angular.element(grid).isolateScope().vm;
        var th = grid.querySelector('thead th'); var td = grid.querySelector('tbody td');
        var style = { header: getComputedStyle(th).backgroundColor, text: getComputedStyle(th).color,
          padding: getComputedStyle(td).paddingTop, total: getComputedStyle(grid.querySelector('tfoot td')).backgroundColor,
          sticky: getComputedStyle(th).position, legacyClasses: !!grid.querySelector('.table-ec .table-low.tabelaJS'),
          height: Math.round(grid.querySelector('.table-ec').getBoundingClientRect().height) };
        grid.querySelector('thead input[type=checkbox]').click(); scope.$root.$digest();
        style.marked = controller.selectedRows.length;
        grid.querySelector('tbody input[type=checkbox]').click(); scope.$root.$digest();
        style.afterUncheck = controller.selectedRows.length;
        grid.querySelector('[aria-label="Ações da tabela"]').click(); scope.$root.$digest();
        style.menu = !!grid.querySelector('.dropdown-menu');
        grid.querySelector('.dropdown-menu input[type=checkbox]').click(); scope.$root.$digest();
        style.visibleColumns = controller.displayColumns.length;
        scope.vm.handles.grid.restaurarColunas(); controller.menuOpen = false; scope.$root.$digest();
        return style;
      }())`);
      assert.deepEqual(gridAppearance, { header: 'rgb(51, 122, 183)', text: 'rgb(255, 255, 255)', padding: '3px',
        total: 'rgb(191, 191, 191)', sticky: 'sticky', legacyClasses: true, height: 260, marked: 5, afterUncheck: 4, menu: true, visibleColumns: 3 });
      var cellContracts = await evaluate(`(async function () {
        var injector = angular.element(document.querySelector('migration-lab')).injector();
        var scope = injector.get('$rootScope').$new(), calls = [], viewed = 0;
        var row = { ID: 9, COLOR: '#123456', GRADIENT: ['#fff', '#000'], STATUS: 0, VALOR: 2 };
        scope.probe = { DADOS: [row], HEIGHT: '160px', MIN_HEIGHT: '0px', status_visible: false, input_visible: true,
          model_tabela: { visualizar: function () { viewed++; } }, COLUNAS: [
            { CAMPO: '', TIPO: 'btn2', BTN2: [{ class: 'probe-btn2', label: 'B2', funcao: function (event, value) { calls.push(['btn2', event.type, value.ID]); } }] },
            { CAMPO: '', TIPO: 'btn4', BTN4: [{ class: function () { return 'probe-btn4'; }, label: function (value) { return 'B4-' + value.ID; }, icone: function () { return 'glyphicon glyphicon-ok'; }, funcao: function (event, value) { calls.push(['btn4', event.type, value.ID]); } }] },
            { CAMPO: 'STATUS', TIPO: 'status2' }, { CAMPO: 'COLOR', TIPO: 'cor' }, { CAMPO: 'GRADIENT', TIPO: 'cor-grd' },
            { CAMPO: 'ID', TIPO: 'html', HTML: { funcao: function (value) { return '<b class="probe-html">Registro ' + value.ID + '</b>'; } } },
            { CAMPO: 'ID', TIPO: 'link', LINK: '/modelo/#ID#', LINK_PARAM: [{ PARAM: 'ID', CAMPO: 'ID' }] },
            { CAMPO: 'VALOR', TIPO: 'imput_number', MIN: 0, MAX: 10, EVENT_BLUR: { funcao: function (value, event) { calls.push(['blur', event.type, value.ID, value.VALOR]); } } }
          ] };
        var element = injector.get('$compile')('<gc-data-grid config="probe"></gc-data-grid>')(scope);
        angular.element(document.body).append(element); scope.$digest();
        element[0].querySelector('.probe-btn2').click(); element[0].querySelector('.probe-btn4').click(); scope.$digest();
        var tr = element[0].querySelector('tbody tr'); tr.focus(); scope.$digest();
        await new Promise(function (resolve) { setTimeout(resolve, 20); }); scope.$digest();
        var focused = scope.probe.model_tabela.SELECTED === row;
        tr.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); scope.$digest();
        var checkedBefore = !!row.CHECKED;
        var editor = element[0].querySelector('.item_edit_tab'); editor.value = '7'; editor.dispatchEvent(new Event('input', { bubbles: true })); editor.dispatchEvent(new Event('blur')); scope.$digest();
        var result = { calls: calls, focused: focused, viewed: viewed, checkedBefore: checkedBefore,
          label: element[0].querySelector('.probe-btn4').textContent.trim(), html: element[0].querySelector('.probe-html').textContent,
          status: getComputedStyle(element[0].querySelector('.status2-0')).backgroundColor,
          color: getComputedStyle(element[0].querySelector('.gc-data-grid__swatch')).backgroundColor,
          gradient: getComputedStyle(element[0].querySelectorAll('.gc-data-grid__swatch')[1]).backgroundImage.includes('linear-gradient'),
          link: element[0].querySelector('tbody a').getAttribute('href') };
        scope.$destroy(); element.remove(); return result;
      }())`);
      assert.deepEqual(cellContracts, { calls: [['btn2', 'click', 9], ['btn4', 'click', 9], ['blur', 'blur', 9, 7]], focused: true,
        viewed: 1, checkedBefore: false, label: 'B4-9', html: 'Registro 9', status: 'rgb(68, 157, 68)', color: 'rgb(18, 52, 86)', gradient: true, link: '/modelo/9' });
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
        await evaluate("(function () { var scope = angular.element(document.querySelector('migration-lab')).isolateScope(); scope.vm.active = 'tabela'; scope.vm.error = ''; scope.$root.$digest(); window.scrollTo(0, 0); }())");
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
